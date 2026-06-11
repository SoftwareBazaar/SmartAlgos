import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchSubscriptionStatus, syncSubscription } from "@/lib/payments-api";
import {
  getStoredSubscription,
  resolveTier,
  hasTierAccess,
  tierLabel,
  type SubscriptionTier,
  type StoredSubscription,
} from "@/lib/subscription-access";

export function useSubscription() {
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [stored, setStored] = useState<StoredSubscription | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const syncAfterLogin = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.access_token) return;
    const remote = await syncSubscription(data.session.access_token);
    setTier(resolveTier(null, remote.tier));
    setExpiresAt(remote.expiresAt);
    if (remote.email) setEmail(remote.email);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const local = getStoredSubscription();
      let profileStatus: string | null = null;
      let profileExpires: string | null = null;
      let userEmail: string | null = local?.email ?? null;
      let remoteTier: string | null = null;
      let remoteExpires: string | null = null;

      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user?.email) userEmail = data.session.user.email;

        if (data.session?.access_token) {
          try {
            const remote = await fetchSubscriptionStatus(data.session.access_token);
            remoteTier = remote.tier;
            remoteExpires = remote.expiresAt;
            if (remote.email) userEmail = remote.email;
          } catch {
            // Fall back to profile + localStorage
          }
        }

        if (data.session?.user?.id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("subscription_status, subscription_expires_at, email")
            .eq("id", data.session.user.id)
            .maybeSingle();
          profileStatus = profile?.subscription_status ?? null;
          profileExpires = profile?.subscription_expires_at ?? null;
          if (profile?.email) userEmail = profile.email;
        }
      } catch {
        // Supabase optional
      }

      if (!mounted) return;
      setStored(local);
      setEmail(userEmail);
      setExpiresAt(remoteExpires || profileExpires || local?.expiresAt || null);
      setTier(resolveTier(profileStatus, remoteTier));
      setLoading(false);
    }

    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    tier,
    stored,
    email,
    expiresAt,
    loading,
    tierLabel: tierLabel(tier),
    hasAccess: (required: "free" | "research-pro" | "quant-pro") => hasTierAccess(tier, required),
    syncAfterLogin,
  };
}
