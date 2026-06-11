import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import {
  Copy, Download, Loader2, LogOut, ShieldCheck, ChevronDown, Plus, Trash2, KeyRound, Activity,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/client-dashboard")({
  head: () => ({
    meta: [
      { title: "Client Dashboard — Smart Algos Capital" },
      { name: "description", content: "Manage your Trade Copier license, MetaTrader accounts, and downloads." },
    ],
  }),
  component: ClientDashboard,
});

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  subscription_status: string;
  subscription_expires_at: string | null;
};
type License = { id: string; license_key: string; is_active: boolean };
type MtAccount = {
  id: string; account_number: string; platform: string; broker: string | null;
  label: string | null; is_active: boolean;
};

const mtSchema = z.object({
  account_number: z.string().trim().regex(/^\d{4,15}$/, "Account number must be 4-15 digits"),
  platform: z.enum(["MT4", "MT5"]),
  broker: z.string().trim().max(80).optional(),
  label: z.string().trim().max(60).optional(),
});

// Replace this URL with the actual hosted EA download.
const EA_DOWNLOAD_URL = "https://smartalgosts.com/downloads/SmartAlgosCopier.ex5";

function ClientDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [license, setLicense] = useState<License | null>(null);
  const [accounts, setAccounts] = useState<MtAccount[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [p, l, m] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("licenses").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("mt_accounts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    if (p.data) setProfile(p.data as Profile);
    if (l.data) setLicense(l.data as License);
    if (m.data) setAccounts(m.data as MtAccount[]);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = mtSchema.safeParse({
      account_number: form.get("account_number"),
      platform: form.get("platform") ?? "MT5",
      broker: form.get("broker") || undefined,
      label: form.get("label") || undefined,
    });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }
    const { error } = await supabase.from("mt_accounts").insert({
      user_id: user.id,
      account_number: parsed.data.account_number,
      platform: parsed.data.platform,
      broker: parsed.data.broker ?? null,
      label: parsed.data.label ?? null,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Account whitelisted");
    (e.target as HTMLFormElement).reset();
    refresh();
  }

  async function handleRemove(id: string) {
    const { error } = await supabase.from("mt_accounts").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Account removed");
    refresh();
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const status = profile?.subscription_status ?? "trial";
  const statusVariant =
    status === "active" ? "default" : status === "expired" ? "destructive" : "secondary";
  const expires = profile?.subscription_expires_at
    ? new Date(profile.subscription_expires_at).toLocaleDateString()
    : null;

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-10 max-w-[1400px] mx-auto w-full">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-6">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">Client Portal</div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold">Trade Copier Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as <span className="text-foreground">{profile?.email}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant} className="uppercase tracking-wider">{status}</Badge>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" /> Subscription
            </CardTitle>
            <CardDescription>Your access status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={statusVariant} className="uppercase">{status}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{status === "active" ? "Renews" : "Expires"}</span>
              <span className="text-sm font-mono">{expires ?? "—"}</span>
            </div>
            {status !== "active" && (
              <Button className="w-full" onClick={() => toast.info("Checkout coming soon")}>
                Upgrade to Active
              </Button>
            )}
          </CardContent>
        </Card>

        {/* License */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4 text-primary" /> License Key
            </CardTitle>
            <CardDescription>Paste this into the EA inputs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-border bg-muted/40 p-3 font-mono text-sm break-all">
              {license?.license_key ?? "—"}
            </div>
            <Button
              variant="outline"
              className="w-full"
              disabled={!license}
              onClick={() => license && copy(license.license_key, "License key")}
            >
              <Copy className="h-4 w-4" /> Copy key
            </Button>
          </CardContent>
        </Card>

        {/* Download */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Download className="h-4 w-4 text-primary" /> Slave EA
            </CardTitle>
            <CardDescription>Latest build for MT4 / MT5</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Download the Smart Algos Copier EA and attach it to any chart in your terminal.
            </p>
            <Button asChild className="w-full">
              <a href={EA_DOWNLOAD_URL} target="_blank" rel="noreferrer">
                <Download className="h-4 w-4" /> Download EA
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* MT accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-primary" /> MetaTrader Accounts
          </CardTitle>
          <CardDescription>
            Add the account numbers you want to receive copied trades. Only whitelisted accounts will connect.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-12">
            <div className="sm:col-span-3 space-y-1.5">
              <Label htmlFor="account_number">Account number</Label>
              <Input id="account_number" name="account_number" placeholder="12345678" required />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Platform</Label>
              <Select name="platform" defaultValue="MT5">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MT5">MT5</SelectItem>
                  <SelectItem value="MT4">MT4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-3 space-y-1.5">
              <Label htmlFor="broker">Broker (optional)</Label>
              <Input id="broker" name="broker" placeholder="ICMarkets" maxLength={80} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="label">Label (optional)</Label>
              <Input id="label" name="label" placeholder="Live" maxLength={60} />
            </div>
            <div className="sm:col-span-2 flex items-end">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Plus className="h-4 w-4" /> Add</>)}
              </Button>
            </div>
          </form>

          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2">Account</th>
                  <th className="text-left px-3 py-2">Platform</th>
                  <th className="text-left px-3 py-2">Broker</th>
                  <th className="text-left px-3 py-2">Label</th>
                  <th className="text-right px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">No accounts whitelisted yet.</td></tr>
                )}
                {accounts.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-3 py-2 font-mono">{a.account_number}</td>
                    <td className="px-3 py-2">{a.platform}</td>
                    <td className="px-3 py-2 text-muted-foreground">{a.broker ?? "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{a.label ?? "—"}</td>
                    <td className="px-3 py-2 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleRemove(a.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <Collapsible defaultOpen>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Installation guide</span>
                <ChevronDown className="h-4 w-4" />
              </CardTitle>
              <CardDescription>3 steps to get the copier running</CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <ol className="space-y-4">
                {[
                  { t: "Attach to chart", d: "Open MT4/MT5, drag SmartAlgosCopier from the Navigator onto any chart. Allow algorithmic trading." },
                  { t: "Paste your license key", d: "In the EA Inputs tab, paste the License Key from this dashboard into the LicenseKey field." },
                  { t: "Enable WebRequests", d: "Tools → Options → Expert Advisors → tick 'Allow WebRequest for listed URL' and add https://api.smartalgosts.com" },
                ].map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">{i + 1}</div>
                    <div>
                      <div className="font-medium">{s.t}</div>
                      <p className="text-sm text-muted-foreground">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
