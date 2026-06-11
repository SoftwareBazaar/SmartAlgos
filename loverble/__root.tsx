import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter, useRouterState,
  HeadContent, Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-semibold gold-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This route doesn't exist in the Smart Algos platform.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-semibold text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try again or head home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Try again
          </button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
            Go home
          </a>
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
      { name: "description", content: "Smart Algos Capital — quantitative research, strategy development, and financial systems innovation. Operated by Smart Algos Investment Solution Ltd (Kenya)." },
      { property: "og:title", content: "Smart Algos Capital — Quantitative Research & Investment Technology" },
      { property: "og:description", content: "Smart Algos Capital — quantitative research, strategy development, and financial systems innovation. Operated by Smart Algos Investment Solution Ltd (Kenya)." },

      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Smart Algos Capital — Quantitative Research & Investment Technology" },
      { name: "twitter:description", content: "Smart Algos Capital — quantitative research, strategy development, and financial systems innovation. Operated by Smart Algos Investment Solution Ltd (Kenya)." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/57adf3c2-e57e-4dd0-bbf0-7e849b31d975/id-preview-4547daab--44490d08-febe-4322-b912-f3847faf9874.lovable.app-1781077661770.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/57adf3c2-e57e-4dd0-bbf0-7e849b31d975/id-preview-4547daab--44490d08-febe-4322-b912-f3847faf9874.lovable.app-1781077661770.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
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
  const isLanding = pathname === "/";

  return (
    <QueryClientProvider client={queryClient}>
      {isLanding ? (
        <Outlet />
      ) : (
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <header className="h-14 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur px-4 sticky top-0 z-30">
                <SidebarTrigger />
                <div className="hairline w-px h-5 bg-border" />
                <Link to="/" className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">
                  ← Smart Algos Capital
                </Link>
                <div className="ml-auto flex items-center gap-4 text-xs">
                  <div className="hidden md:flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-bull animate-pulse" />
                    <span className="text-muted-foreground uppercase tracking-[0.18em]">Research First</span>
                  </div>
                  <span className="font-mono text-muted-foreground hidden sm:inline uppercase tracking-[0.18em]">Building a Track Record</span>
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
