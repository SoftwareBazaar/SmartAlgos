# Smart Algos Capital — Design System

## 60 : 30 : 10 Color Rule

| Share | Role | Token | Usage |
|-------|------|-------|--------|
| **60%** | Dominant | `--dominant` / `bg-dominant` | Page background, hero, footer base |
| **30%** | Secondary | `--card` / `bg-secondary-surface` | Cards, stats band, section fills, body copy areas |
| **10%** | Accent | `--gold` / `text-gold`, `bg-primary` | CTAs, badges, icons, key labels only |

Do not spread gold across large surfaces — reserve it for conversion and hierarchy.

## Motion

- Library: **Framer Motion** (`framer-motion`)
- Hero: `HeroCinematic` — animated orbs, equity curve draw, particles (no video)
- Sections: `MotionReveal` + `MotionItem` — staggered fade-up on scroll
- Respect `prefers-reduced-motion`

## Style (UI UX Pro Max)

- Pattern: Conversion-optimized fintech landing
- Style: Glassmorphism nav (`glass-nav`), layered depth
- Typography: Playfair Display (display) + Inter (body)
- Transitions: 150–300ms on interactive elements

## 21st.dev MCP

Connect Magic MCP for premium animated components:

```bash
npx @21st-dev/cli@latest install cursor --api-key YOUR_KEY
```

Get key: https://21st.dev/magic/console
