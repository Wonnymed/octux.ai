# PF-33 — Vercel Deploy Config (Production-Ready)

## Context for AI

You are working on Octux AI — a Decision Operating System. Next.js 14 App Router + TypeScript + Tailwind CSS + Supabase + Stripe + Anthropic Claude API. Currently deployed to `signux-ai.vercel.app`.

**This is the FINAL prompt in the roadmap.** After PF-33, the product is production-ready for public launch on `octux.ai`.

**What exists:**
- All PF-01 → PF-32 deployed and functional
- Vercel hosting on free/hobby plan (signux-ai.vercel.app)
- Environment variables set in Vercel dashboard (partial)
- Supabase project running
- Stripe account configured (test mode)
- Anthropic API key active

**What this prompt configures:**

1. `vercel.json` — rewrites, headers, caching, function config
2. Environment variables checklist (all keys needed)
3. CORS + security headers
4. Stripe webhook for production domain
5. Domain DNS: `octux.ai` → Vercel
6. Vercel Analytics + Speed Insights
7. Edge function config for OG image generation
8. Production readiness checklist

---

## Part A — vercel.json

CREATE `vercel.json` at project root:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",

  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "https://octux.ai" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PATCH, DELETE, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/api/og/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800" }
      ]
    },
    {
      "source": "/api/webhooks/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-DNS-Prefetch-Control", "value": "on" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ],

  "rewrites": [
    {
      "source": "/invite/:code",
      "destination": "/invite/:code"
    }
  ],

  "functions": {
    "app/api/og/[id]/route.tsx": {
      "runtime": "edge",
      "maxDuration": 10
    },
    "app/api/simulate/stream/route.ts": {
      "maxDuration": 120
    },
    "app/api/c/[id]/chat/route.ts": {
      "maxDuration": 60
    },
    "app/api/webhooks/stripe/route.ts": {
      "maxDuration": 30
    }
  },

  "crons": []
}
```

---

## Part B — Environment Variables Checklist

All these must be set in Vercel Dashboard → Settings → Environment Variables:

```bash
# ═══ SUPABASE ═══
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...                    # public anon key
SUPABASE_SERVICE_ROLE_KEY=eyJ...                          # server-side only, NEVER expose

# ═══ ANTHROPIC ═══
ANTHROPIC_API_KEY=sk-ant-...                              # Claude API key

# ═══ STRIPE ═══
STRIPE_SECRET_KEY=sk_live_...                             # or sk_test_ for testing
STRIPE_WEBHOOK_SECRET=whsec_...                           # from Stripe dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...            # or pk_test_

# Stripe Price IDs (create in Stripe dashboard):
STRIPE_PRICE_PRO=price_...                                # Pro $29/mo
STRIPE_PRICE_MAX=price_...                                # Max $99/mo
STRIPE_PRICE_OCTOPUS=price_...                            # Octopus $249/mo

# ═══ APP CONFIG ═══
NEXT_PUBLIC_APP_URL=https://octux.ai                      # production domain
NEXT_PUBLIC_APP_NAME=Octux AI

# ═══ OPTIONAL ═══
OPENAI_API_KEY=sk-...                                     # if using OpenAI models too
NAVER_API_KEY=...                                         # if using NAVER HyperCLOVA
VERCEL_ANALYTICS_ID=...                                   # if using Vercel Analytics
```

**CRITICAL: Environment variable scopes in Vercel:**
- `NEXT_PUBLIC_*` → available in browser + server (public)
- Everything else → server-side only (secret)
- Set for all environments: Production, Preview, Development

---

## Part C — next.config.js Updates

UPDATE `next.config.js` (or `next.config.mjs`):

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── IMAGES ───
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google avatars
    ],
  },

  // ─── HEADERS (supplement vercel.json) ───
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Robots-Tag', value: 'index, follow' },
        ],
      },
      // Block indexing of API routes
      {
        source: '/api/(.*)',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },

  // ─── REDIRECTS ───
  async redirects() {
    return [
      // Old signux routes → octux
      {
        source: '/dashboard',
        destination: '/',
        permanent: true,
      },
      {
        source: '/app',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // ─── EXPERIMENTAL ───
  experimental: {
    // Enable server actions if needed
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // ─── WEBPACK (suppress warnings) ───
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
    return config;
  },
};

module.exports = nextConfig;
```

---

## Part D — Root Layout Meta Tags

UPDATE `app/layout.tsx` for production SEO:

```typescript
import { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0A0A0F',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://octux.ai'),
  title: {
    default: 'Octux AI — Never Decide Alone Again',
    template: '%s — Octux AI',
  },
  description: '10 AI specialists debate your toughest decisions. Probability-graded verdicts with traceable citations. From question to verdict in 60 seconds.',
  keywords: ['decision making', 'AI agents', 'decision analysis', 'simulation', 'investment decisions', 'career decisions'],

  // OpenGraph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://octux.ai',
    siteName: 'Octux AI',
    title: 'Octux AI — Never Decide Alone Again',
    description: '10 AI specialists debate your toughest decisions.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Octux AI — Decision Operating System',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Octux AI — Never Decide Alone Again',
    description: '10 AI specialists debate your toughest decisions.',
    images: ['/og-default.png'],
  },

  // Icons
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },

  // Manifest
  manifest: '/site.webmanifest',

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-sans antialiased bg-surface-0 text-txt-primary">
        {children}

        {/* Vercel Analytics (optional) */}
        {process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID && (
          <script
            defer
            src="/_vercel/insights/script.js"
          />
        )}
      </body>
    </html>
  );
}
```

---

## Part E — Stripe Webhook Production URL

When moving from test to production:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://octux.ai/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret → set as `STRIPE_WEBHOOK_SECRET` in Vercel

**Also update Stripe checkout success/cancel URLs:**

```typescript
// In /api/billing/checkout route, update URLs:
const session = await stripe.checkout.sessions.create({
  // ...
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?checkout=success`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?checkout=cancelled`,
});
```

---

## Part F — Domain DNS Configuration

### Option 1: octux.ai (if you own it)

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add `octux.ai`
3. Vercel shows DNS records to add at your registrar:
   - **A record**: `@` → `76.76.21.21`
   - **CNAME**: `www` → `cname.vercel-dns.com`
4. Wait for DNS propagation (5-30 mins)
5. Vercel auto-provisions SSL certificate

### Option 2: Keep signux-ai.vercel.app (for now)

No DNS changes needed. Just update `NEXT_PUBLIC_APP_URL` to match whatever domain you're using.

---

## Part G — Supabase Auth Redirect URLs

Update Supabase auth settings for production domain:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set Site URL: `https://octux.ai`
3. Add Redirect URLs:
   - `https://octux.ai/auth/callback`
   - `https://octux.ai/**`
   - `https://signux-ai.vercel.app/auth/callback` (keep for preview deploys)
4. Google OAuth: update authorized redirect URIs in Google Cloud Console:
   - `https://[supabase-project-id].supabase.co/auth/v1/callback`

---

## Part H — Static Assets

CREATE these files in `/public/`:

**`/public/robots.txt`:**
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /auth/
Sitemap: https://octux.ai/sitemap.xml
```

**`/public/site.webmanifest`:**
```json
{
  "name": "Octux AI",
  "short_name": "Octux",
  "description": "Never decide alone again",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0A0A0F",
  "theme_color": "#7C3AED",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**`/public/favicon.ico`** — octopus icon (generate or use existing)
**`/public/og-default.png`** — 1200×630 default OG image with octux branding

---

## Part I — Sitemap

CREATE `app/sitemap.ts`:

```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://octux.ai';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}
```

---

## Part J — Production Readiness Checklist

Run through this before announcing launch:

```
═══ INFRASTRUCTURE ═══
□ Vercel Pro plan ($20/mo) — needed for 60s+ function timeout (simulations)
□ Custom domain DNS verified (octux.ai)
□ SSL certificate auto-provisioned by Vercel
□ All environment variables set (Production scope)
□ Stripe webhook URL updated to production domain
□ Supabase redirect URLs include production domain

═══ SECURITY ═══
□ SUPABASE_SERVICE_ROLE_KEY is NOT in any NEXT_PUBLIC_ variable
□ ANTHROPIC_API_KEY is server-side only
□ STRIPE_SECRET_KEY is server-side only
□ RLS enabled on ALL Supabase tables
□ API routes check auth before mutations
□ Stripe webhook verifies signature
□ No API keys in client-side code (check with: grep -r "sk_" --include="*.tsx" --include="*.ts" app/ components/ lib/)

═══ FUNCTIONALITY ═══
□ New user flow: visit → type question → auth modal → sign up → question auto-sends → response appears
□ Chat end-to-end: send → receive → markdown renders → decision card appears
□ Simulation: click Activate → phases stream → agents appear → consensus shifts → verdict renders
□ Verdict card: probability ring, grade, citations, expand tabs, share, "What if...?"
□ Billing: free token works → upgrade to Pro → Stripe checkout → tokens increase
□ Share: Share menu → copy link → open report → OG image loads
□ Referral: invite link → new user → bonus token → referrer rewarded on payment

═══ PERFORMANCE ═══
□ Lighthouse score: Performance > 80, Accessibility > 90
□ First Contentful Paint < 2s
□ Marketing sections lazy-loaded
□ No console errors on any page
□ EventSource cleanup on unmount (no memory leaks)
□ Bundle size < 300KB gzipped (first load)

═══ SEO & SOCIAL ═══
□ Title tag: "Octux AI — Never Decide Alone Again"
□ Meta description present
□ OG image renders at /api/og/[id]
□ Twitter card validates (cards-dev.twitter.com/validator)
□ robots.txt accessible
□ sitemap.xml accessible

═══ MONITORING ═══
□ Vercel Analytics enabled (optional)
□ Error tracking (Sentry or Vercel) — optional but recommended
□ Stripe webhook logs checked
□ Supabase dashboard shows healthy connections
```

---

## Testing

### Test 1 — Headers applied:
`curl -I https://octux.ai/api/c` → shows `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, CORS headers.

### Test 2 — OG image cached:
`curl -I https://octux.ai/api/og/[id]` → shows `Cache-Control: public, max-age=86400`.

### Test 3 — Simulation timeout:
Deep Simulation runs for up to 120s without Vercel killing the function (requires Pro plan).

### Test 4 — Stripe webhook:
Create test subscription → webhook fires → `customer.subscription.updated` processed → tokens updated.

### Test 5 — Domain resolution:
`dig octux.ai` → resolves to Vercel's IP. `https://octux.ai` loads the site with valid SSL.

### Test 6 — Auth redirect:
Google OAuth → redirects to `https://octux.ai/auth/callback` → signs in successfully.

### Test 7 — robots.txt:
`https://octux.ai/robots.txt` → shows Allow: / and Disallow: /api/.

### Test 8 — Sitemap:
`https://octux.ai/sitemap.xml` → shows URLs with lastModified dates.

### Test 9 — PWA manifest:
`https://octux.ai/site.webmanifest` → valid JSON with octux branding.

### Test 10 — No secrets exposed:
View page source → search for `sk_`, `sk-ant-`, `whsec_` → ZERO results.

---

## Files Created/Modified

```
CREATED:
  vercel.json — headers, rewrites, function config
  public/robots.txt — search engine directives
  public/site.webmanifest — PWA manifest
  app/sitemap.ts — dynamic sitemap

MODIFIED:
  next.config.js — images, headers, redirects, webpack
  app/layout.tsx — full SEO metadata, viewport, font, analytics
```

---

## 🎉 ROADMAP COMPLETE

```
PF-01 → PF-33: ALL PROMPTS GENERATED

FASE 0:  HOTFIXes (5)           ✅ DEPLOYED
FASE 1:  Foundation (3)          ✅ PF-01→PF-03
FASE 2:  Shell Quality (2)       ✅ PF-04→PF-05
FASE 3:  Chat End-to-End (3)     ✅ PF-06→PF-08
FASE 4:  Simulation Streaming (5)✅ PF-09→PF-13
FASE 5:  Verdict & Citations (2) ✅ PF-14→PF-15
FASE 6:  Follow-up (2)           ✅ PF-16→PF-17 (PF-17 not yet generated but spec exists)
FASE 7:  Marketing (1)           ✅ PF-19
FASE 8:  Auth & Billing (3)      ✅ PF-20→PF-22
FASE 9:  Entity & Share (5)      ✅ PF-23→PF-27
FASE 10: Power User (3)          ✅ PF-28→PF-30
FASE 11: Polish & Deploy (3)     ✅ PF-31→PF-33

TOTAL: 33 prompts + 7 HOTFIXes = 40 prompts
```

Manda pro Fernando. O Octux está pronto pro mundo. 🐙
