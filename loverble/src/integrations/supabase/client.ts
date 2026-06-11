import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function createSupabaseClient(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn("[Supabase] Not configured — auth features disabled.");
    return null;
  }

  return createClient(url, key, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let _client: SupabaseClient | null | undefined;

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (_client === undefined) _client = createSupabaseClient();
    if (!_client) {
      if (prop === "auth") {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
          signUp: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
          signOut: async () => ({ error: null }),
        };
      }
      return () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } });
    }
    return Reflect.get(_client, prop);
  },
});
