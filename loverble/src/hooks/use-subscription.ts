import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const local = getStoredSubscription();
      let profileStatus: string | null = null;
      let userEmail: string | null = local?.email ?? null;

      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user?.email) userEmail = data.session.user.email;
        if (data.session?.user?.id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("subscription_status, email")
            .eq("id", data.session.user.id)
            .maybeSingle();
          profileStatus = profile?.subscription_status ?? null;
          if (profile?.email) userEmail = profile.email;
        }
      } catch {
        // Supabase optional
      }

      if (!mounted) return;
      setStored(local);
      setEmail(userEmail);
      setTier(resolveTier(profileStatus));
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
    loading,
    tierLabel: tierLabel(tier),
    hasAccess: (required: "free" | "research-pro" | "quant-pro") => hasTierAccess(tier, required),
  };
}
