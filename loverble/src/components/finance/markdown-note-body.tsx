import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AdSlot } from "@/components/finance/ad-slot";

/** Strip YAML frontmatter and optional leading H1 (page chrome already shows title). */
export function prepareFinanceMarkdown(raw: string): string {
  let text = raw.replace(/^\uFEFF/, "");
  if (text.startsWith("---")) {
    const end = text.indexOf("\n---", 3);
    if (end !== -1) {
      text = text.slice(end + 4).replace(/^\s+/, "");
    }
  }
  text = text.replace(/^#\s+[^\n]+\n+/, "");
  // Turn LaTeX display math into fenced blocks the renderer can style
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_m, body: string) => `\n\`\`\`math\n${body.trim()}\n\`\`\`\n`);
  // Inline $...$ → monospace (skip already-converted $$ blocks)
  text = text.replace(/\$([^$\n]+)\$/g, "`$1`");
  return text;
}

const components: Components = {
  h2: ({ children }) => (
    <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground pt-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-foreground pt-1">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-sm md:text-[15px] text-muted-foreground leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 space-y-1.5 text-sm text-muted-foreground">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a href={href} className="text-gold hover:underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  hr: () => <hr className="border-border/60 my-2" />,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-gold/40 pl-4 text-sm text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full text-left text-xs md:text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-card/50 text-muted-foreground">{children}</thead>,
  th: ({ children }) => (
    <th className="px-3 py-2 font-medium border-b border-border/60 align-top">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 border-b border-border/40 text-muted-foreground align-top">{children}</td>
  ),
  code: ({ className, children }) => {
    const isBlock = Boolean(className);
    const text = String(children).replace(/\n$/, "");
    if (className?.includes("language-math") || className?.includes("math")) {
      return (
        <pre className="overflow-x-auto rounded-lg border border-border/60 bg-card/40 px-4 py-3 font-mono text-xs md:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {text}
        </pre>
      );
    }
    if (isBlock) {
      return (
        <pre className="overflow-x-auto rounded-lg border border-border/60 bg-card/40 px-4 py-3 font-mono text-xs md:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {text}
        </pre>
      );
    }
    return (
      <code className="rounded bg-card/60 px-1 py-0.5 font-mono text-[0.85em] text-foreground/90">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <>{children}</>,
};

/**
 * Split markdown on ad-slot HTML comments and render with GFM tables.
 */
export function MarkdownNoteBody({ source }: { source: string }) {
  const prepared = prepareFinanceMarkdown(source);
  const parts = prepared.split(/<!--\s*\[AD_SLOT[^\]]*\]\s*-->/i);

  return (
    <div className="space-y-8">
      {parts.map((part, i) => (
        <div key={i} className="space-y-5">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {part.trim()}
          </ReactMarkdown>
          {i < parts.length - 1 ? <AdSlot id={`ke-inline-${i + 1}`} /> : null}
        </div>
      ))}
    </div>
  );
}
