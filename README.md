# Lazarus — Trading & News Site

A modern, minimal trading/financial news website inspired by CNN's information hierarchy. Built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and a **Git-based MDX CMS**.

---

## ✨ Features

- **CNN-style layout**: Hero lead story, secondary featured, category strips, latest news grid
- **Live market ticker**: Scrolling price strip with simulated live updates
- **TradingView charts**: Per-article embedded chart widget
- **Git-based CMS**: Posts are MDX files in `/content/posts` — version-controlled, zero vendor cost
- **Web admin editor**: Password-protected `/admin` with WYSIWYG post editor, scheduling, SEO fields
- **Full SEO**: sitemap.xml, robots.txt, OG tags, schema.org Article JSON-LD
- **Accessible**: Skip nav, semantic HTML, ARIA labels, keyboard navigation
- **ISR**: Incremental Static Regeneration with 60-second revalidation

---

## 🚀 Quick Start

```bash
# 1. Navigate to the project
cd /Users/mac/Desktop/reddit/antigravity

# 2. Install dependencies (already done)
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and set ADMIN_PASSWORD

# 4. Start development server
npm run dev
# → Open http://localhost:3000
```

---

## 📁 Project Structure

```
antigravity/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Homepage
│   ├── layout.tsx          # Root layout (Header, Footer, Tickers)
│   ├── post/[slug]/        # Article page
│   ├── category/[slug]/    # Category listing
│   ├── tag/[slug]/         # Tag listing
│   ├── author/[slug]/      # Author profile
│   ├── search/             # Search results
│   ├── admin/              # CMS editor (password protected)
│   │   └── posts/new/      # New post editor
│   ├── about/              # Static about page
│   ├── subscribe/          # Newsletter page
│   ├── privacy/            # Privacy policy
│   ├── api/market/         # Serverless market data proxy
│   ├── api/posts/          # Post CRUD API
│   ├── sitemap.ts          # Auto-generated sitemap
│   └── robots.ts           # Robots.txt
├── components/             # React UI components
│   ├── Header.tsx          # Sticky nav with search
│   ├── Footer.tsx          # Dark footer
│   ├── BreakingBar.tsx     # Rotating breaking news bar
│   ├── MarketTicker.tsx    # Live market ticker strip
│   ├── Hero.tsx            # CNN-style hero section
│   ├── CategoryStrip.tsx   # Scrollable category card row
│   ├── ArticleCard.tsx     # Reusable article card
│   ├── AuthorCard.tsx      # Author bio card
│   ├── TradingViewWidget.tsx # TradingView chart embed
│   └── ShareButtons.tsx    # Social share + copy link
├── content/                # Git-based CMS content
│   ├── posts/              # MDX posts (add posts here)
│   ├── authors/            # Author JSON files
│   └── categories/         # Category data (all.json)
├── lib/                    # Utility functions
│   ├── posts.ts            # Post parsing & querying
│   ├── authors.ts          # Author data
│   ├── categories.ts       # Category data
│   ├── utils.ts            # Date, formatting helpers
│   └── types.ts            # TypeScript interfaces
└── public/                 # Static assets
```

---

## 📝 CMS / Content Management

### Adding Posts via Editor UI (recommended)

1. Go to `http://localhost:3000/admin`
2. Password: `antigravity2024` (or your `ADMIN_PASSWORD`)
3. Click **New Post** and fill in the form
4. Click **Save Post** — the MDX file is created automatically

### Adding Posts Manually

Create a `.mdx` file in `/content/posts/your-slug.mdx`:

```mdx
---
title: "Your Article Title"
slug: "your-article-slug"
excerpt: "Short summary for cards."
deck: "Subtitle shown on article page."
coverImage: "https://images.unsplash.com/photo-..."
categories: ["Markets"]
tags: ["bitcoin", "etf"]
author: "alex-rivera"
publishAt: "2025-03-01T08:00:00.000Z"
featured: true
symbol: "BITSTAMP:BTCUSD"
---

## Introduction

Your article content in Markdown here.

> Pull quote styling.

## Section Two

More content...
```

### Adding Authors

Create a JSON file in `/content/authors/author-slug.json`:

```json
{
  "name": "Jane Doe",
  "slug": "jane-doe",
  "role": "Senior Analyst",
  "bio": "Jane covers...",
  "avatar": "https://...",
  "twitter": "janedoe",
  "linkedin": "https://linkedin.com/in/janedoe"
}
```

---

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_URL` | Public URL of the site | `http://localhost:3000` |
| `ADMIN_PASSWORD` | Password for `/admin` CMS | `antigravity2024` |
| `MARKET_API_KEY` | Market data API key (optional) | — |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID (optional) | — |

Copy `.env.example` to `.env.local` and fill in your values.

---

## 🚢 Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (first time — follow prompts)
vercel

# Deploy to production
vercel --prod
```

**Or push to GitHub and connect to Vercel:**
1. Push the repo: `git push origin main`
2. Go to [vercel.com](https://vercel.com) → Import project
3. Set environment variables in Project Settings → Environment Variables
4. Deploy

**Required Vercel env vars:**
- `NEXT_PUBLIC_SITE_URL` → your Vercel URL (e.g., `https://antigravity.vercel.app`)
- `ADMIN_PASSWORD` → choose a strong password

---

## 📊 Market Data

The market ticker uses **simulated data** by default (no API key needed). To use real data:

1. Sign up at [Finnhub.io](https://finnhub.io) (free tier)
2. Add `MARKET_API_KEY=your_key` to `.env.local`
3. Update `/app/api/market/route.ts` to call the Finnhub API

---

## 🛠 Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```

---

## 📜 License

MIT © Antigravity. Built for educational purposes.
