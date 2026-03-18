# ArchiveAI — Complete Project Reference

**Repository:** https://github.com/JoshuaViera/ArchiveAi
**Framework:** Next.js 14.2.21 + React 18 + Tailwind CSS 3
**Backend:** Supabase (Postgres + Auth + RLS) + Google Gemini 2.0 Flash (free tier)
**Payments:** Stripe (lazy-loaded, dormant until configured)
**Deployment:** Vercel
**Last updated:** March 17, 2026

---

## How This Project Was Built

### Phase 1: Strategy & Planning (Chat 1)

Joshua uploaded the ArchiveAI PRD v1.1, Technical Roadmap v1.0, and a competitive landscape analysis. Claude produced:

1. **PRD Review (.docx)** — A strategic critique identifying 7 issues:
   - The archive-as-source differentiator is already commoditized (5–7 competitors)
   - The analytics engine is the real differentiator and should be elevated to P0
   - The 30-post minimum creates a dead-end for 40–60% of signups
   - LinkedIn's 24-hour archive processing creates an onboarding gap
   - AI engagement penalty risk (30–45% reduction) is unaddressed
   - Model tier mismatch (Haiku may not hit the voice fidelity target)
   - Multi-platform dependency on LinkedIn is existential risk

2. **Technical Roadmap v1.1 (.docx)** — Revised build plan incorporating the review findings, adding the bootstrap onboarding path, analytics engine, and engagement tracking

3. **Nine-Phase Completion Roadmap (.docx)** — Step-by-step from "test locally" to "50 paying users," including testing checklists, beta feedback criteria, and launch distribution plan

4. **Day 2–6 Build Guide (.docx)** — Daily checklist: GitHub + Vercel deploy, Google OAuth setup, Stripe integration, Resend emails, and polish

5. **Interactive Prototype (.jsx)** — A self-contained React artifact with sample data demonstrating the Dashboard, Archive, Generate, and Re-voice views with a dark UI theme

### Phase 2: Full Codebase Scaffolding (Chat 1, continued)

Claude generated the complete 40-file Next.js codebase as a downloadable zip. Joshua extracted it, set up Supabase, and ran the SQL migration.

Key decisions during setup:
- **Gemini swap:** Joshua switched from Anthropic API ($5 minimum) to Google Gemini 2.0 Flash (free tier, no credit card). `src/lib/anthropic.js` was rewritten to call Gemini's REST API. The function name `generateWithClaude` was kept so all API route imports stayed unchanged.
- **Mock mode:** Added `USE_MOCK_AI=true` env var so development uses canned responses with zero API calls
- **Demo mode:** Extended mock mode — when `GEMINI_API_KEY` is missing or set to "placeholder," the app returns pre-written sample posts instead of crashing
- **Supabase key confusion:** Joshua had Supabase's new-format keys mixed with Stripe keys. Resolved by using the "Legacy anon, service_role API keys" tab.
- **Stripe build crash:** Vercel build failed because `new Stripe(key)` ran at module import time without a key. Fixed by lazy-loading the Stripe client behind a `getStripe()` function.

### Phase 3: Fixes & Feature Build (Chat 2 — current session)

**Audit findings:**
- Demo mode in `anthropic.js` returned canned LinkedIn posts for ALL requests, breaking classification (expected JSON) and voice profile (expected JSON) calls silently
- Revoice API returned 401 for unauthenticated users (no demo mode)
- Dashboard hard-redirected to /login, overriding the `?demo=true` middleware bypass
- The batch classify prompt asked for `quality_score` but the demo response didn't return JSON, so every post defaulted to score 50
- `UpgradePrompt` was calling the webhook route as a checkout endpoint (fragile dual-purpose design)
- `.env.local.example` was already fixed (earlier session had `ANTHROPIC_API_KEY`, now shows `GEMINI_API_KEY`)
- `model_used` default in schema was still `claude-haiku-3.5`

**What was built/fixed:**
1. `src/lib/anthropic.js` — Demo mode now detects request type from system prompt and returns appropriate mock data (JSON array for classification, JSON object for voice profiles, canned post for generation). Error fallbacks now throw instead of silently returning wrong content types.
2. `src/lib/prompts.js` — Generate prompt handles empty `topPosts` gracefully (for bootstrap profiles with no archive)
3. `src/app/api/revoice/route.js` — Added full demo mode: accepts `postContent` directly, uses mock voice profile for unauthenticated users
4. `src/app/api/checkout/route.js` — NEW. Dedicated Stripe checkout session creator with subscription check and graceful handling of missing Stripe config
5. `src/app/api/billing-portal/route.js` — NEW. Lets subscribed users manage billing via Stripe's hosted portal
6. `src/app/api/voice-questionnaire/route.js` — NEW. Full bootstrap pipeline: saves questionnaire + writing samples, merges with any archive posts, calls AI, upserts voice profile with `confidence_level: "bootstrap-only"`
7. `src/app/api/webhooks/stripe/route.js` — Cleaned up to only handle webhook events (checkout logic moved to dedicated route)
8. `src/app/dashboard/page.js` — Empty state now offers two paths (archive upload + voice questionnaire). Shows demo data for unauthenticated users. Handles bootstrap-only profiles.
9. `src/app/dashboard/onboarding/page.js` — NEW. 4-step onboarding: archetype selection (5 options) → 6 voice questions → optional writing samples (up to 5) → animated generation with redirect
10. `src/app/dashboard/revoice/page.js` — Added demo mode with 4 mock posts
11. `src/components/DashboardContent.js` — Added `demoMode` and `bootstrapMode` props with contextual banners
12. `src/components/UpgradePrompt.js` — Points to `/api/checkout`, added error state handling

---

## Complete File Inventory

### Root Config (6 files)

| File | Lines | Purpose |
|------|-------|---------|
| `package.json` | 31 | Dependencies: next, react, @supabase/ssr, @supabase/supabase-js, stripe (lazy), jszip, papaparse, resend, framer-motion. Dev: tailwindcss, postcss, autoprefixer, eslint. Note: `@anthropic-ai/sdk` is still listed but unused (Gemini replaced it). |
| `next.config.js` | 4 | Empty config — no custom settings needed |
| `tailwind.config.js` | 24 | Custom color palette: bg (#0C0D12), surface (#15171E), accent (#7C6AEF), accent-light (#9B8DF5), and text tiers (primary/muted/dim). Font: DM Sans. |
| `postcss.config.js` | 6 | Standard tailwindcss + autoprefixer |
| `jsconfig.json` | 6 | Path alias: `@/*` → `./src/*` |
| `middleware.js` | 12 | Imports `updateSession` from Supabase middleware. Matcher excludes static files and webhook routes. |

### Environment & Git (2 files)

| File | Lines | Purpose |
|------|-------|---------|
| `.env.local.example` | 28 | Template with 7 env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`. Notes Gemini free tier and demo mode fallback. |
| `.gitignore` | 7 | Standard: node_modules, .next, .env.local, out |

### Database (2 files)

| File | Lines | Purpose |
|------|-------|---------|
| `supabase/migrations/001_initial_schema.sql` | 172 | **7 tables with RLS:** `profiles` (extends auth.users, has subscription_status + stripe_customer_id + generation_count), `posts` (content + engagement + post_type + hook_style + performance_percentile), `voice_profiles` (profile_summary + traits[] + structural_patterns jsonb + confidence_level), `generated_posts` (prompt + output + format + rating + source_post_id), `voice_questionnaire_responses` (responses jsonb + selected_archetype), `writing_samples` (content + source_label), `engagement_self_reports` (engagement_trend + posts_per_week). Includes `handle_new_user()` trigger for auto-profile creation and `set_updated_at()` trigger. |
| `supabase/migrations/002_fix_model_default.sql` | 2 | Changes `generated_posts.model_used` default from `claude-haiku-3.5` to `gemini-2.0-flash` |

### Library Layer (7 files)

| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/supabase/client.js` | 8 | Browser Supabase client via `@supabase/ssr` |
| `src/lib/supabase/server.js` | 43 | Server Supabase client (cookie-based auth) + `createAdminClient()` with service role key (bypasses RLS for webhooks) |
| `src/lib/supabase/middleware.js` | 60 | Session refresh + auth routing: unauthenticated users redirected from /dashboard to /login (unless `?demo=true`), authenticated users redirected from /login to /dashboard |
| `src/lib/anthropic.js` | 177 | **AI client.** Named `generateWithClaude` for historical reasons but calls Gemini 2.0 Flash. Three modes: (1) Demo mode — when no API key, returns appropriate mock data based on request type (JSON for classification/voice profile, canned post for generation). (2) Real mode — calls Gemini REST API. (3) Error — throws instead of returning mismatched content. Contains 5 canned demo posts (story, framework, hot-take, listicle, question). |
| `src/lib/prompts.js` | 149 | **6 prompt templates:** `buildVoiceProfilePrompt` (analyzes posts → JSON voice profile), `buildClassifyPostPrompt` (single post classification), `buildBatchClassifyPrompt` (batch classification with quality_score 1-100), `buildGeneratePostPrompt` (voice-matched generation, handles empty topPosts), `buildRevoicePrompt` (re-voice with context), `buildBootstrapProfilePrompt` (questionnaire + samples → profile) |
| `src/lib/stripe.js` | 39 | Lazy-loaded Stripe client (`getStripe()` — only instantiates when first called). Exports `createCheckoutSession` (subscription mode, passes user_id in metadata) and `createPortalSession`. Throws descriptive error if STRIPE_SECRET_KEY missing. |
| `src/lib/archive-parser.js` | 201 | LinkedIn .zip parser. Uses JSZip to extract, searches multiple paths for Shares.csv, PapaParse with header normalization. Handles column name variants (sharecommentary, share commentary, commentary, content, text) and date format variants. `calculatePercentiles()` uses engagement score if data exists, falls back to `calculateContentScore()` heuristic (scores length, paragraph structure, hook strength, specificity, formatting). |

### API Routes (9 files)

| File | Lines | Purpose |
|------|-------|---------|
| `src/app/api/archive/upload/route.js` | 62 | POST: Accepts FormData .zip, parses via `parseLinkedInArchive`, calculates percentiles, deletes existing posts for user, batch-inserts in groups of 50. Requires auth. |
| `src/app/api/archive/analyze/route.js` | 120 | POST: Fetches all user posts, batch-classifies in groups of 10 (post_type + hook_style + quality_score), builds voice profile from top 30 posts, computes structural patterns (type stats, avg percentiles), upserts voice profile with confidence level (full/limited/bootstrap-only based on post count). Requires auth. |
| `src/app/api/generate/route.js` | 163 | POST: Accepts topic + format. Auth mode: fetches profile, enforces 3 free generation limit, fetches voice profile + top 5 posts, generates, saves to generated_posts, increments count. Demo mode: uses mock data, no DB writes. Returns `{ output, generationsUsed, demoMode }`. |
| `src/app/api/revoice/route.js` | 92 | POST: Auth mode — accepts postId, fetches post + voice profile, generates re-voiced version, saves to generated_posts, marks original as reused. Demo mode — accepts postContent directly, uses mock voice profile, no DB writes. |
| `src/app/api/voice-profile/route.js` | 25 | GET: Returns authenticated user's voice profile from Supabase. No demo mode (not called from demo flows). |
| `src/app/api/voice-questionnaire/route.js` | 128 | POST: Saves questionnaire responses + writing samples, merges with any existing archive posts, calls `buildBootstrapProfilePrompt`, parses AI response, upserts voice profile with bootstrap-only confidence. Requires auth. |
| `src/app/api/checkout/route.js` | 44 | POST: Creates Stripe checkout session. Checks for existing subscription (returns 400 if already active). Returns 503 if Stripe not configured. Requires auth. |
| `src/app/api/billing-portal/route.js` | 41 | POST: Creates Stripe billing portal session for existing customers. Requires auth + stripe_customer_id. |
| `src/app/api/webhooks/stripe/route.js` | 68 | POST: Stripe webhook handler. Verifies signature, handles checkout.session.completed (activates subscription), customer.subscription.updated (tracks status), customer.subscription.deleted (marks cancelled). Uses admin Supabase client to bypass RLS. Returns 503 if Stripe not configured. |

### Pages (9 files)

| File | Lines | Purpose |
|------|-------|---------|
| `src/app/layout.js` | 14 | Root layout: imports globals.css, sets metadata (title + description), renders `<html><body>` |
| `src/app/page.js` | 86 | Landing page: nav with sign-in link, hero section ("Your LinkedIn voice, on autopilot"), 3 value prop cards (Mine, Generate, Re-voice), footer. Links to /login. |
| `src/app/login/page.js` | 141 | Client component: email/password form (sign in + sign up toggle), Google OAuth button, Supabase auth calls, redirects to /dashboard on success. |
| `src/app/auth/callback/route.js` | 19 | OAuth callback: exchanges code for session, redirects to /dashboard or /login on error |
| `src/app/dashboard/layout.js` | 28 | Server component: fetches voice profile for sidebar confidence display. Renders Sidebar + main content area. Handles missing user gracefully for demo mode. |
| `src/app/dashboard/page.js` | 152 | Server component: fetches posts + voice profile. Three states: (1) Demo mode — renders DashboardContent with sample data + demo banner. (2) Empty + no profile — shows two-path welcome (upload archive OR voice questionnaire). (3) Empty + bootstrap profile — shows dashboard with bootstrap banner. (4) Normal — renders full dashboard. |
| `src/app/dashboard/archive/page.js` | 152 | Client component: file upload (.zip via FormData), triggers analysis after upload, post list with search/sort/filter by type. No demo mode (requires auth for Supabase queries). |
| `src/app/dashboard/generate/page.js` | 279 | Client component: topic input + format selection (5 pills), voice profile card, format recommendation ("Stories average 3.2x"), generation with loading state, copy button, regenerate, UpgradePrompt on limit. Has demo mode with mock profile. |
| `src/app/dashboard/revoice/page.js` | 190 | Client component: post list → select → optional context note → re-voice with side-by-side compare. Has demo mode with 4 mock posts. |
| `src/app/dashboard/onboarding/page.js` | 548 | Client component: 4-step flow with framer-motion transitions. Step 0: archetype selection (Storyteller, Teacher, Provocateur, Curator, Connector). Step 1: 6 questions (tone, vocabulary, structure, hooks, topics, formatting). Step 2: up to 5 writing samples with source labels. Step 3: generation animation → success → redirect to /dashboard. |

### Components (9 files)

| File | Lines | Purpose |
|------|-------|---------|
| `src/components/Sidebar.js` | 95 | Collapsible sidebar: logo, nav links (Dashboard, Archive, Generate, Re-voice), voice confidence progress bar with post count. Uses `usePathname` for active state. |
| `src/components/DashboardContent.js` | 195 | Client component with framer-motion stagger animations: demo banner (link to /login), bootstrap banner (link to /dashboard/archive), stat cards row, quick action cards (Generate, Re-voice, Browse), voice profile card, engagement bar chart, top posts list. |
| `src/components/UpgradePrompt.js` | 60 | Shows when `generationsUsed >= maxFree`. Calls POST /api/checkout, redirects to Stripe checkout URL. Error state handling. |
| `src/components/ui/StatCard.js` | 35 | Dark card with label (uppercase), large value, optional subtitle |
| `src/components/ui/BarChart.js` | 33 | Horizontal bar chart — data items with label, gradient fill bar (accent color), value label |
| `src/components/ui/Pill.js` | 22 | Toggle button with framer-motion scale/glow animation. Active state uses accent color. |
| `src/components/ui/PostCard.js` | 119 | Post display card: type badge (color-coded), percentile badge ("TOP 5%"), hook style label, content with line clamp, engagement stats (likes/comments/shares), optional "Re-voice ✦" button |
| `src/components/ui/Spinner.js` | 11 | CSS-animated spinning border circle with text label |
| `src/components/ui/VoiceProfileCard.js` | 161 | Voice profile display: confidence badge + progress bar, summary text, traits as pills, format breakdown with percentages, tone characteristics, common themes. Handles empty state. |

### Styles (1 file)

| File | Lines | Purpose |
|------|-------|---------|
| `src/styles/globals.css` | 43 | DM Sans font import, Tailwind directives, dark scrollbar, focus ring (accent color), spin animation |

### Documentation (7 files)

| File | Purpose |
|------|---------|
| `README.md` | Setup guide, architecture overview, what's built and what's not |
| `BUILD_COMPLETE.md` | Notes from the "Content Studio Light" implementation |
| `DEMO_MODE_GUIDE.md` | How demo mode works across frontend and backend |
| `IMPLEMENTATION_NOTES.md` | Option 2.5 design implementation details |
| `LAYOUT_GUIDE.md` | CSS layout and responsive design notes |
| `QUICK_START.md` | Abbreviated setup steps |
| `READY_TO_DEMO.md` | Checklist for running demos |
| `TESTING_CHECKLIST.md` | Manual QA test cases |

---

## Tech Stack Summary

| Layer | Technology | Status |
|-------|-----------|--------|
| Framework | Next.js 14.2.21 (App Router) | Working |
| UI | React 18 + Tailwind CSS 3 + framer-motion | Working |
| Auth | Supabase Auth (email/password + Google OAuth) | Working |
| Database | Supabase Postgres with RLS (7 tables) | Working |
| AI | Google Gemini 2.0 Flash (free tier) | Working (demo fallback if no key) |
| Payments | Stripe (subscription mode) | Scaffolded, needs STRIPE_SECRET_KEY + STRIPE_PRICE_ID |
| Email | Resend | Listed in package.json, no code written |
| Archive parsing | JSZip + PapaParse | Working |
| Deployment | Vercel | Configured |
| Domain | Not yet configured | — |

---

## Environment Variables

| Variable | Required | Where Used |
|----------|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | All Supabase clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | All Supabase clients |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Webhook handler (admin client) |
| `GEMINI_API_KEY` | No (demo mode without it) | `src/lib/anthropic.js` |
| `STRIPE_SECRET_KEY` | No (payments disabled without it) | `src/lib/stripe.js` |
| `STRIPE_WEBHOOK_SECRET` | No | Webhook signature verification |
| `STRIPE_PRICE_ID` | No | Checkout session creation |
| `RESEND_API_KEY` | No | Not yet used in code |
| `NEXT_PUBLIC_APP_URL` | Yes | Stripe return URLs, auth redirects |

---

## What's Not Built Yet

1. **Resend email integration** — package installed, no sending code exists. Needed for: welcome emails, generation limit nudges, weekly digest.
2. **Engagement self-report survey** — DB table exists (`engagement_self_reports`), no UI or API route.
3. **Post rating feedback loop** — DB column exists (`generated_posts.rating`: sounds_like_me / doesnt_sound_like_me), no UI to capture ratings.
4. **Mobile responsiveness pass** — Layout works on desktop, not optimized for mobile.
5. **Logout button** — No sign-out UI anywhere in the dashboard.
6. **Landing page SEO/polish** — Basic page exists, could use social proof, testimonials, and OG meta tags.
7. **Custom domain** — Not configured in Vercel.
8. **Archive page demo mode** — Archive page requires auth (no mock posts for unauthenticated demo users).
9. **`@anthropic-ai/sdk` cleanup** — Still in package.json dependencies but unused (Gemini replaced it). Safe to remove.

---

## Key Architectural Decisions

1. **Function name `generateWithClaude` kept after Gemini swap** — All API routes import this function. Renaming would require touching 4+ files for no functional benefit.
2. **Lazy-loaded Stripe** — `getStripe()` only instantiates when called, preventing build failures when STRIPE_SECRET_KEY is absent.
3. **Demo mode as first-class citizen** — Every generation route (generate, revoice) works without auth, returning mock data. This lets the product demo without any backend configuration.
4. **Content-quality heuristic as percentile fallback** — LinkedIn exports don't include engagement metrics. `calculateContentScore()` uses post length, paragraph structure, hook strength, and formatting signals as a ranking proxy until the AI classification step assigns real quality scores.
5. **Batch classification with quality scoring** — Posts are classified in batches of 10 to stay within context limits. Each batch returns post_type + hook_style + quality_score (1-100).
6. **Voice profile confidence tiers** — `full` (30+ posts), `limited` (10-29 posts), `bootstrap-only` (questionnaire only, no archive).
7. **3 free generations then paywall** — `profiles.generation_count` is incremented on each generate call. Checked against `FREE_GENERATION_LIMIT = 3`.