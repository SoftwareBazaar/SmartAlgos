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
 * Sidebar — desktop: static flex child that takes up space in the layout.
 * Mobile: fixed overlay that slides over content (no layout gap).
 * 
 * On desktop, `open` drives the width via Tailwind classes.
 * On mobile (< lg), sidebar is always position:fixed, so the flex layout
 * isn't affected — the main content area gets full width.
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
      {/* Mobile backdrop overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={close}
          aria-hidden
        />
      )}

      {/*
        Mobile (< lg):
          - position: fixed, slides in/out with translateX
          - Does NOT affect flex layout (content always full width)
        Desktop (>= lg):
          - position: relative (normal flex child)
          - Width transitions from w-64 → w-16 (or stays w-64 when open)
          - flex-shrink-0 keeps it from collapsing
          - Content area is flex-1, so it fills the rest automatically
      */}
      <aside
        data-collapsible={collapsible}
        className={cn(
          "flex flex-col",
          "border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
          "transition-all duration-300 ease-in-out",

          // Mobile: fixed overlay, no layout impact
          "fixed inset-y-0 left-0 z-50",
          "w-64",
          open ? "translate-x-0" : "-translate-x-full",

          // Desktop: static flex child, layout-aware width
          "lg:relative lg:z-auto lg:translate-x-0",
          open ? "lg:w-64" : "lg:w-16",
          "lg:shrink-0",

          className,
        )}
      >
        {children}
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
  const { open } = React.useContext(SidebarCtx);
  return (
    <div className={cn(
      "px-2 mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 transition-opacity duration-200",
      // Hide label text on desktop collapsed, keep on mobile (always w-64)
      "lg:block",
      !open && "lg:opacity-0 lg:pointer-events-none",
      className,
    )}>
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
  const { open } = React.useContext(SidebarCtx);
  return (
    <div
      title={!open ? tooltip : undefined}
      className={cn(
        "rounded-sm px-2 py-1.5 text-sm transition-colors",
        isActive
          ? "bg-gold/12 text-gold border-l-2 border-gold -ml-px pl-[calc(0.5rem+1px)] font-medium"
          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground border-l-2 border-transparent",
        // Icon+text flex layout — span hides on desktop collapsed
        "[&>a]:flex [&>a]:items-center [&>a]:gap-2.5 [&>a]:w-full [&>a]:whitespace-nowrap [&>a]:overflow-hidden",
        "[&>a>svg]:h-4 [&>a>svg]:w-4 [&>a>svg]:shrink-0",
        "[&>a>span]:transition-all [&>a>span]:duration-200",
        !open && "lg:[&>a>span]:w-0 lg:[&>a>span]:opacity-0",
      )}
    >
      {children}
    </div>
  );
}
