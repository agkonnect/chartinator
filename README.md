# Chartinator ⚡

> **Describe it. Generate it. Trade it.**

Chartinator is an AI-powered MT5 indicator generator. Type a plain-English description of any trading indicator — Chartinator uses Claude AI to write the complete, ready-to-compile MQL5 code for you.

---

## Features

- Natural language → MQL5 indicator code in seconds
- Powered by Anthropic Claude 3.5 Sonnet
- MetaTrader 5 indicators (MT5 / MQL5 only)
- 5 free generations per day (no login required)
- Dashboard to view and re-download past indicators
- Magic-link email authentication (no passwords)
- Automatic code validation + error self-correction
- Dark, trading-terminal aesthetic

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Hosting | Netlify |
| AI | Anthropic Claude 3.5 Sonnet |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Magic Link |
| Storage | Supabase Storage |

---

## Setup Guide

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/chartinator.git
cd chartinator
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **SQL Editor** and run the entire contents of `supabase/schema.sql`
3. Go to **Authentication → URL Configuration** and set:
   - Site URL: `http://localhost:3000` (dev) / your Netlify URL (prod)
   - Redirect URLs: add `http://localhost:3000/auth/callback` and `https://YOUR_SITE.netlify.app/auth/callback`
4. Go to **Authentication → Email Templates** and enable Magic Link
5. Copy your project URL and keys from **Settings → API**

### 3. Get an Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Add credits if needed (costs ~$0.01-0.05 per indicator generated)

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in all values:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Netlify

### Option A — One-click via Netlify UI

1. Push your repo to GitHub
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**
3. Select your repo
4. Build settings are auto-detected from `netlify.toml`
5. Go to **Site settings → Environment variables** and add all variables from `.env.example`
6. Trigger a deploy

### Option B — Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set ANTHROPIC_API_KEY sk-ant-...
netlify env:set NEXT_PUBLIC_SUPABASE_URL https://...
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY eyJ...
netlify env:set SUPABASE_SERVICE_ROLE_KEY eyJ...
netlify env:set NEXT_PUBLIC_APP_URL https://YOUR_SITE.netlify.app
netlify deploy --prod
```

### After deploying

1. Copy your Netlify URL (e.g. `https://chartinator-abc123.netlify.app`)
2. Add it to Supabase **Authentication → URL Configuration → Site URL**
3. Add `https://YOUR_SITE.netlify.app/auth/callback` to Redirect URLs
4. Update `NEXT_PUBLIC_APP_URL` env var in Netlify to your live URL
5. Trigger a redeploy

---

## Project Structure

```
chartinator/
├── app/
│   ├── api/generate/route.ts     # Core API — calls Claude, validates, saves
│   ├── auth/                     # Magic link auth pages
│   ├── dashboard/                # User indicator history
│   ├── generate/                 # Main generator UI
│   ├── layout.tsx
│   └── page.tsx                  # Landing page
├── components/
│   ├── CodePreview.tsx           # Syntax-highlighted MQL5 output
│   ├── GeneratorForm.tsx         # NL input form
│   ├── IndicatorHistory.tsx      # Dashboard history list
│   ├── Navbar.tsx
│   └── UsageCounter.tsx
├── lib/
│   ├── mql5-prompt.ts            # Claude system prompt (the secret sauce)
│   ├── validator.ts              # MQL5 syntax validation
│   ├── supabase-client.ts        # Browser Supabase client
│   └── supabase-server.ts        # Server-side Supabase client
├── supabase/
│   └── schema.sql                # Run this in Supabase SQL Editor
├── .env.example
├── netlify.toml
└── README.md
```

---

## How It Works

1. User types a plain-English indicator description
2. Frontend sends POST to `/api/generate`
3. API checks daily usage limit (5/day via Supabase or localStorage)
4. Claude 3.5 Sonnet generates complete MQL5 code using an expert system prompt
5. Validator checks: buffer count, required functions, balanced braces, banned patterns
6. If errors found → automatically retries with error feedback to Claude
7. Final code returned to user as syntax-highlighted preview + `.mq5` download
8. If logged in → indicator saved to Supabase for later access

---

## Usage Limits

| Tier | Limit |
|---|---|
| Anonymous | 5 generations/day (localStorage tracked) |
| Free account | 5 generations/day (server-side tracked) |
| Pro (future) | Unlimited |

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Claude API key from console.anthropic.com |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server only) |
| `NEXT_PUBLIC_APP_URL` | Yes | Your app URL (http://localhost:3000 in dev) |

---

## License

MIT
