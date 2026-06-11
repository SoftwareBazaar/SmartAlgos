// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Reuse production Vercel env names (SUPABASE_*, PAYSTACK_*) without duplicating VITE_* keys.
const viteEnv = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "",
  VITE_SUPABASE_ANON_KEY:
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "",
  VITE_PAYSTACK_PUBLIC_KEY:
    process.env.VITE_PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY || "",
  VITE_API_URL: process.env.VITE_API_URL || "",
  VITE_QC_GOLD_MOMENTUM_URL:
    process.env.VITE_QC_GOLD_MOMENTUM_URL || process.env.QC_GOLD_MOMENTUM_URL || "",
  VITE_QC_FX_MEAN_REVERSION_URL:
    process.env.VITE_QC_FX_MEAN_REVERSION_URL || process.env.QC_FX_MEAN_REVERSION_URL || "",
  VITE_HERO_VIDEO_URL: process.env.VITE_HERO_VIDEO_URL || "",
};

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "src/server" },
  },
  // Vercel deployment — uses existing Paystack/API on same domain via /api rewrites
  nitro: { preset: "vercel" },
  vite: {
    define: Object.fromEntries(
      Object.entries(viteEnv).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)]),
    ),
  },
});
