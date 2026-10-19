import { useEffect, useState, type FormEvent } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Comment = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
  pending?: boolean;
};

function storageKey(slug: string) {
  return `finance-comments-pending:${slug}`;
}

function loadPending(slug: string): Comment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(slug));
    return raw ? (JSON.parse(raw) as Comment[]) : [];
  } catch {
    return [];
  }
}

function savePending(slug: string, comments: Comment[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(slug), JSON.stringify(comments.slice(-20)));
}

export function FinanceComments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [pending, setPending] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    setPending(loadPending(slug));
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/finance/comments?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (!cancelled && data?.success) {
          setComments(data.comments || []);
        }
      } catch {
        /* soft fail */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/finance/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, name, email, comment: body }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Could not submit comment");
      }
      const next: Comment = {
        ...(data.comment as Comment),
        pending: true,
      };
      const merged = [...pending, next];
      setPending(merged);
      savePending(slug, merged);
      setBody("");
      setStatus("ok");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not submit comment");
    }
  }

  const visible = [
    ...comments,
    ...pending.filter((p) => !comments.some((c) => c.id === p.id)),
  ];

  return (
    <section className="rounded-2xl border border-border/60 bg-secondary-surface p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-gold" />
        <h2 className="font-display text-xl font-semibold">Discussion</h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Share a question or takeaway. New comments are moderated before they appear publicly.
      </p>

      <div className="space-y-4">
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-border/60 px-4 py-6 text-center">
            No comments yet — start the thread.
          </p>
        ) : (
          visible.map((c) => (
            <div key={c.id} className="rounded-lg border border-border/50 bg-card/30 px-4 py-3 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <span className="text-gold">{c.author_name}</span>
                <span>{new Date(c.created_at).toLocaleDateString()}</span>
                {c.pending ? <span>Pending review</span> : null}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{c.body}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-3 border-t border-border/50 pt-5">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="fc-name" className="text-xs">
              Name
            </Label>
            <Input
              id="fc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={80}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fc-email" className="text-xs">
              Email (optional)
            </Label>
            <Input
              id="fc-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={120}
              placeholder="for reply only"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fc-body" className="text-xs">
            Comment
          </Label>
          <textarea
            id="fc-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            minLength={8}
            maxLength={2000}
            rows={4}
            placeholder="What stood out in the decay math?"
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        {status === "error" ? <p className="text-xs text-red-400">{error}</p> : null}
        {status === "ok" ? (
          <p className="text-xs text-gold">Submitted for review — thanks.</p>
        ) : null}
        <Button type="submit" disabled={status === "loading"} className="gap-2">
          <Send className="h-3.5 w-3.5" />
          {status === "loading" ? "Sending…" : "Post comment"}
        </Button>
      </form>
    </section>
  );
}
