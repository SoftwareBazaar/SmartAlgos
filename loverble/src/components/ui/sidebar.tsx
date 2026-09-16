import * as React from "react";
import { cn } from "@/lib/utils";

interface SidebarContextValue {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarCtx = React.createContext<SidebarContextValue>({
  open: false,
  toggle: () => {},
  close: () => {},
});

export function useSidebar() {
  return React.useContext(SidebarCtx);
}

export function SidebarProvider({
  children,
  defaultOpen = false,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <SidebarCtx.Provider value={{ open, toggle: () => setOpen((o) => !o), close: () => setOpen(false) }}>
      {children}
    </SidebarCtx.Provider>
  );
}

export function SidebarTrigger({ className }: { className?: string }) {
  const { toggle } = React.useContext(SidebarCtx);
  return (
    <button
      type="button"
      onClick={toggle}
      className={cn("p-2 rounded-sm hover:bg-accent text-muted-foreground shrink-0", className)}
      aria-label="Toggle sidebar"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12h18M3 6h18M3 18h18" />
      </svg>
    </button>
  );
}

/**
 * Sidebar layout strategy:
 *
 * MOBILE (< lg):
 *   - Always position:fixed, slides in as overlay
 *   - Never takes up layout space — content is always full width
 *   - Backdrop closes it on tap outside
 *
 * DESKTOP (>= lg):
 *   - Always position:relative, normal flex child (shrink-0)
 *   - Always visible at w-64 — no collapse, no gap
 *   - Toggle button on desktop hides/shows it via w-0 overflow-hidden
 *
 * This eliminates the gap because on desktop the sidebar is a flex child
 * and flex-1 on main fills the rest automatically.
 */
export function Sidebar({
  children,
  collapsible,
  className,
}: {
  children: React.ReactNode;
  collapsible?: string;
  className?: string;
}) {
  const { open, close } = React.useContext(SidebarCtx);

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={close}
          aria-hidden
        />
      )}

      {/*
        Mobile: fixed overlay — no layout impact on content
        Desktop: static flex child — w-64 always, hidden by collapsing to w-0
      */}
      <aside
        data-collapsible={collapsible}
        className={cn(
          "flex flex-col shrink-0",
          "border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
          "overflow-hidden overscroll-contain transition-all duration-300 ease-in-out touch-pan-y",

          // MOBILE: fixed position overlay
          "fixed inset-y-0 left-0 z-50 w-64",
          open ? "translate-x-0" : "-translate-x-full",

          // DESKTOP: static, always in layout, toggle collapses width to 0
          "lg:relative lg:translate-x-0 lg:z-auto",
          open ? "lg:w-64" : "lg:w-0 lg:border-r-0",

          className,
        )}
      >
        {/* Inner wrapper keeps content at 64 even when outer animates to 0 */}
        <div className="flex flex-col h-full w-64">
          {children}
        </div>
      </aside>
    </>
  );
}

export function SidebarHeader({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn("shrink-0 p-2", className)}>{children}</div>;
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">{children}</div>;
}

export function SidebarFooter({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn("shrink-0 p-3", className)}>{children}</div>;
}

export function SidebarGroup({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function SidebarGroupLabel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("px-2 mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70", className)}>
      {children}
    </div>
  );
}

export function SidebarGroupContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function SidebarMenu({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-0.5">{children}</ul>;
}

export function SidebarMenuItem({ children }: { children: React.ReactNode }) {
  return <li>{children}</li>;
}

export function SidebarMenuButton({
  asChild,
  isActive,
  tooltip,
  children,
}: {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      title={tooltip}
      className={cn(
        "rounded-sm px-2 py-1.5 text-sm transition-colors whitespace-nowrap",
        isActive
          ? "bg-gold/12 text-gold border-l-2 border-gold -ml-px pl-[calc(0.5rem+1px)] font-medium"
          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground border-l-2 border-transparent",
        "[&>a]:flex [&>a]:items-center [&>a]:gap-2.5 [&>a]:w-full",
        "[&>a>svg]:h-4 [&>a>svg]:w-4 [&>a>svg]:shrink-0",
      )}
    >
      {children}
    </div>
  );
}
