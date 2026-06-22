import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter, useRouterState,
  HeadContent, Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const SITE_ORIGIN = "https://smartalgosts.com";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-semibold gold-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This route doesn't exist in Smart Algos Capital.</p>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Return Home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try again or head home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
            Try again
          </button>
          <a href="/" className="rounded-md border px-4 py-2 text-sm">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Smart Algos Capital — Quantitative Research & Investment Technology" },
      { name: "description", content: "Quantitative research, strategy development, and financial systems. Operated by Smart Algos Investment Solution Ltd (Kenya)." },
      { property: "og:title", content: "Smart Algos Capital — Quantitative Research & Systematic Strategies" },
      { property: "og:description", content: "Quantitative research, systematic strategies, and verified performance. Operated by Smart Algos Investment Solution Ltd (Kenya)." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_ORIGIN },
      { property: "og:image", content: `${SITE_ORIGIN}/apple-touch-icon.png` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Smart Algos Capital — Quantitative Research & Systematic Strategies" },
      { name: "twitter:description", content: "Quantitative research, systematic strategies, and verified performance." },
      { name: "twitter:image", content: `${SITE_ORIGIN}/apple-touch-icon.png` },
      { name: "theme-color", content: "#0a0f1a" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", href: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { rel: "icon", href: "/favicon-16.png", type: "image/png", sizes: "16x16" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isStandalone =
    pathname === "/" || pathname === "/consultation" || pathname === "/book";

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster theme="dark" position="top-center" richColors closeButton />
      {isStandalone ? (
        <Outlet />
      ) : (
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <header className="h-14 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur px-4 sticky top-0 z-30">
                <SidebarTrigger />
                <div className="ml-auto text-xs text-muted-foreground hidden sm:inline uppercase tracking-[0.18em]">
                  Research First · Building a Track Record
                </div>
              </header>
              <main className="flex-1 min-w-0"><Outlet /></main>
            </div>
          </div>
        </SidebarProvider>
      )}
    </QueryClientProvider>
  );
}
