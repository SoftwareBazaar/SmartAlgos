import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const DialogCtx = React.createContext<{ open: boolean; setOpen: (v: boolean) => void } | null>(null);

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  children: React.ReactNode;
}) {
  const [internal, setInternal] = React.useState(false);
  const isOpen = open ?? internal;
  const setOpen = React.useCallback(
    (v: boolean) => (onOpenChange ?? setInternal)(v),
    [onOpenChange],
  );
  return <DialogCtx.Provider value={{ open: isOpen, setOpen }}>{children}</DialogCtx.Provider>;
}

export function DialogTrigger({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: React.ReactElement;
}) {
  const ctx = React.useContext(DialogCtx)!;
  const child = React.Children.only(children);
  if (!asChild) {
    return (
      <button type="button" onClick={() => ctx.setOpen(true)}>
        {children}
      </button>
    );
  }
  return React.cloneElement(child, {
    onClick: (e: React.MouseEvent) => {
      child.props.onClick?.(e);
      if (!e.defaultPrevented) ctx.setOpen(true);
    },
  } as React.HTMLAttributes<HTMLElement>);
}

export function DialogContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const ctx = React.useContext(DialogCtx)!;
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!ctx.open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={() => ctx.setOpen(false)} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-2xl",
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={cn("font-display text-lg font-semibold", className)}>{children}</h2>;
}

export function DialogDescription({ children }: { className?: string; children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground mt-1">{children}</p>;
}
