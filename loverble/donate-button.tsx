import { useState } from "react";
import { Heart } from "lucide-react";
import { payWithPaystack, PAYSTACK_PUBLIC_KEY } from "@/lib/paystack";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";

const PRESETS = [5, 10, 25, 50, 100];

export function DonateButton({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(10);
  const [custom, setCustom] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const finalAmount = custom ? Number(custom) : amount;

  const donate = async () => {
    if (!email.includes("@")) return toast.error("Enter a valid email");
    if (!finalAmount || finalAmount < 1) return toast.error("Enter an amount of at least $1");
    if (!PAYSTACK_PUBLIC_KEY) {
      return toast.error("Payments not configured", {
        description: "Add VITE_PAYSTACK_PUBLIC_KEY to enable donations.",
      });
    }
    setLoading(true);
    try {
      await payWithPaystack({
        email,
        amount: Math.round(finalAmount * 100),
        currency: "USD",
        metadata: { purpose: "research_donation" },
        callback: (res) => {
          toast.success("Thank you for supporting research!", {
            description: `Reference: ${res.reference}`,
          });
          setLoading(false);
          setOpen(false);
        },
        onClose: () => setLoading(false),
      });
    } catch (e) {
      toast.error((e as Error).message);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={`inline-flex items-center justify-center gap-2 rounded-sm border border-gold/60 bg-gold/10 text-gold hover:bg-gold/20 transition font-semibold uppercase tracking-wider ${compact ? "px-3 py-1.5 text-[11px]" : "px-4 py-2 text-xs"}`}
        >
          <Heart className="h-3.5 w-3.5" />
          {compact ? "Donate" : "Support Research"}
        </button>
      </DialogTrigger>
      <DialogContent className="surface-card">
        <DialogHeader>
          <DialogTitle className="font-display">Support Smart Algos Research</DialogTitle>
          <DialogDescription>
            Your contribution funds open-source notebooks, white papers and frontier-market data acquisition.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { setAmount(p); setCustom(""); }}
              className={`px-3 py-2 rounded-sm border text-sm font-mono transition ${!custom && amount === p ? "border-gold bg-gold/10 text-gold" : "border-border bg-card/30 text-muted-foreground hover:text-foreground"}`}
            >
              ${p}
            </button>
          ))}
          <input
            type="number"
            min={1}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Other"
            className="w-24 bg-background border border-border rounded-sm px-3 py-2 text-sm font-mono focus:outline-none focus:border-gold/60"
          />
        </div>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email for receipt"
          className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60"
        />

        <button
          onClick={donate}
          disabled={loading}
          className="w-full rounded-sm bg-gold px-4 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition disabled:opacity-60"
        >
          {loading ? "Opening Paystack…" : `Donate $${finalAmount || 0}`}
        </button>
        <p className="text-[11px] text-muted-foreground text-center">Secure payment via Paystack</p>
      </DialogContent>
    </Dialog>
  );
}
