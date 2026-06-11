/**
 * Smart Algos Capital — subscription sync via Supabase profiles + paystack_payments
 */

const TIER_RANK = {
  free: 0,
  'research-pro': 1,
  research_pro: 1,
  active: 1,
  'quant-pro': 2,
  quant_pro: 2,
};

const SUBSCRIPTION_DAYS = 30;

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

function productIdToTier(productId) {
  if (productId === 'quant-pro') return 'quant-pro';
  if (productId === 'research-pro') return 'research-pro';
  return null;
}

function tierRank(tier) {
  if (!tier) return 0;
  return TIER_RANK[tier] ?? 0;
}

function pickHigherTier(a, b) {
  return tierRank(a) >= tierRank(b) ? a : b;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function getActivePaymentsByEmail(supabase, email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return [];

  const since = addDays(new Date(), -SUBSCRIPTION_DAYS);

  const { data, error } = await supabase
    .from('paystack_payments')
    .select('id, email, metadata, confirmed_at, paystack_reference, amount_usd, product_type, status')
    .eq('email', normalized)
    .eq('status', 'completed')
    .eq('product_type', 'research_subscription')
    .gte('confirmed_at', since.toISOString())
    .order('confirmed_at', { ascending: false });

  if (error) {
    console.warn('[Capital] paystack_payments lookup failed:', error.message);
    return [];
  }
  return data || [];
}

function tierFromPayments(payments) {
  let tier = 'free';
  let latest = null;

  for (const payment of payments) {
    const productId = payment.metadata?.product_id || payment.metadata?.productId || '';
    const paymentTier = productIdToTier(productId);
    if (!paymentTier) continue;
    tier = pickHigherTier(tier, paymentTier);
    if (!latest || new Date(payment.confirmed_at) > new Date(latest.confirmed_at)) {
      latest = payment;
    }
  }

  return { tier, latest };
}

function tierFromProfile(profile) {
  if (!profile) return { tier: 'free', expiresAt: null };
  const expiresAt = profile.subscription_expires_at;
  if (expiresAt && new Date(expiresAt) < new Date()) {
    return { tier: 'free', expiresAt: null };
  }
  const status = profile.subscription_status || 'free';
  if (status === 'quant-pro' || status === 'quant_pro') return { tier: 'quant-pro', expiresAt };
  if (status === 'research-pro' || status === 'research_pro' || status === 'active') {
    return { tier: 'research-pro', expiresAt };
  }
  return { tier: 'free', expiresAt };
}

async function syncProfileSubscription(supabase, { email, tier, expiresAt, reference }) {
  const normalized = normalizeEmail(email);
  if (!normalized || !tier || tier === 'free') return null;

  const { data: profile, error: findError } = await supabase
    .from('profiles')
    .select('id, email, subscription_status, subscription_expires_at')
    .eq('email', normalized)
    .maybeSingle();

  if (findError) {
    console.warn('[Capital] profiles lookup failed:', findError.message);
    return null;
  }
  if (!profile) return null;

  const current = tierFromProfile(profile);
  const bestTier = pickHigherTier(current.tier, tier);
  const bestExpiry =
    current.expiresAt && expiresAt
      ? new Date(current.expiresAt) > new Date(expiresAt)
        ? current.expiresAt
        : expiresAt
      : expiresAt || current.expiresAt;

  const { data: updated, error: updateError } = await supabase
    .from('profiles')
    .update({
      subscription_status: bestTier,
      subscription_expires_at: bestExpiry,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)
    .select('id, email, subscription_status, subscription_expires_at')
    .maybeSingle();

  if (updateError) {
    console.warn('[Capital] profiles update failed:', updateError.message);
    return null;
  }

  console.log('[Capital] Profile subscription synced:', {
    email: normalized,
    tier: bestTier,
    reference,
    profileId: profile.id,
  });
  return updated;
}

async function activateFromPayment(supabase, { email, productId, productType, reference }) {
  if (productType !== 'research_subscription') {
    return { tier: 'free', synced: false };
  }

  const tier = productIdToTier(productId);
  if (!tier) return { tier: 'free', synced: false };

  const expiresAt = addDays(new Date(), SUBSCRIPTION_DAYS).toISOString();
  const synced = await syncProfileSubscription(supabase, { email, tier, expiresAt, reference });
  return { tier, expiresAt, synced: Boolean(synced) };
}

async function resolveSubscriptionForEmail(supabase, email) {
  const payments = await getActivePaymentsByEmail(supabase, email);
  const fromPayments = tierFromPayments(payments);

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, subscription_status, subscription_expires_at')
    .eq('email', normalizeEmail(email))
    .maybeSingle();

  const fromProfile = tierFromProfile(profile);
  const tier = pickHigherTier(fromPayments.tier, fromProfile.tier);

  let expiresAt = fromProfile.expiresAt;
  if (fromPayments.latest?.confirmed_at) {
    const paymentExpiry = addDays(fromPayments.latest.confirmed_at, SUBSCRIPTION_DAYS).toISOString();
    if (!expiresAt || new Date(paymentExpiry) > new Date(expiresAt)) {
      expiresAt = paymentExpiry;
    }
  }

  return {
    tier,
    expiresAt,
    email: normalizeEmail(email),
    source: tierRank(fromPayments.tier) >= tierRank(fromProfile.tier) ? 'payments' : 'profile',
    latestPayment: fromPayments.latest,
    profileId: profile?.id ?? null,
  };
}

async function getUserFromAuthHeader(supabase, authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

async function syncUserSubscription(supabase, user) {
  const email = normalizeEmail(user.email);
  if (!email) return { tier: 'free' };

  const resolved = await resolveSubscriptionForEmail(supabase, email);

  if (resolved.tier !== 'free' && resolved.expiresAt) {
    await syncProfileSubscription(supabase, {
      email,
      tier: resolved.tier,
      expiresAt: resolved.expiresAt,
      reference: resolved.latestPayment?.paystack_reference || 'sync',
    });

    // Link completed payments to user_id when profile exists
    if (resolved.profileId) {
      await supabase
        .from('paystack_payments')
        .update({ user_id: resolved.profileId, updated_at: new Date().toISOString() })
        .eq('email', email)
        .eq('status', 'completed')
        .is('user_id', null);
    }
  }

  return resolved;
}

module.exports = {
  activateFromPayment,
  resolveSubscriptionForEmail,
  syncUserSubscription,
  getUserFromAuthHeader,
  productIdToTier,
  SUBSCRIPTION_DAYS,
};
