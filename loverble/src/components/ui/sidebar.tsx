import * as React from "react";
import { cn } from "@/lib/utils";

const SidebarCtx = React.createContext<{ open: boolean; toggle: () => void }>({
  open: true,
  toggle: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);
  return (
    <SidebarCtx.Provider value={{ open, toggle: () => setOpen((o) => !o) }}>
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
      className={cn("p-2 rounded-sm hover:bg-accent text-muted-foreground", className)}
      aria-label="Toggle sidebar"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12h18M3 6h18M3 18h18" />
      </svg>
    </button>
  );
}

export function Sidebar({
  children,
  collapsible,
  className,
}: {
  children: React.ReactNode;
  collapsible?: string;
  className?: string;
}) {
  const { open } = React.useContext(SidebarCtx);
  return (
    <aside
      data-collapsible={collapsible}
      className={cn(
        "border-r border-sidebar-border bg-sidebar text-sidebar-foreground shrink-0 transition-all",
        open ? "w-64" : "w-16",
        className,
      )}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-2", className)}>{children}</div>;
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 overflow-y-auto px-2 py-2">{children}</div>;
}

export function SidebarFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-3", className)}>{children}</div>;
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
        "flex items-center gap-2 rounded-sm px-2 py-2 text-sm transition-colors",
        isActive
          ? "bg-gold/12 text-gold border-l-2 border-gold -ml-px pl-[calc(0.5rem+1px)] font-medium"
          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground border-l-2 border-transparent",
      )}
    >
      {children}
    </div>
  );
}
