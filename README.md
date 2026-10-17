# Gaurav Roy — Portfolio (V2)

A clean, modern personal portfolio website built with React 19, Vite, and Framer Motion, inspired by Google's clean design system.

## 🚀 Tech Stack

- **Framework:** React 19
- **Bundler & Build Tool:** Vite 8, Bun
- **Styling:** Custom CSS with Google Material-inspired design system
- **Routing:** React Router v7 (SPA with lazy loading & code splitting)
- **Animations:** Framer Motion v13 (page transitions, staggered reveals, animated SVG geometry)
- **Hosting / CI:** Netlify

## 🛠️ Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (or Node.js 18+)

### Installation

```bash
bun install
```

### Development

```bash
bun run dev
```

### Content editing — the local Studio

All site content lives in `src/content/*.json` and is managed through the
local-only Studio (never deployed, never visible on Netlify):

```bash
bun run dev        # the portfolio, at localhost:5173
bun run studio     # the Studio, at http://127.0.0.1:4321
```

Add case studies, blog posts, and reading links in a plain web UI, or paste a
LinkedIn / Medium / Reddit post link straight into the chat-style composer.
The **LinkedIn type** screen reads one of your own LinkedIn posts and can turn
it into a link card, a blog card that opens the original post in a new tab, or
a case study. Images are resized and converted to `.webp` on upload. You
commit and push yourself when you want it live — the Studio never talks to
GitHub.
See [`adminpannel/README.md`](adminpannel/README.md) for the full guide.

### Production Build

```bash
bun run build
```

### Preview

```bash
bun run preview
```
