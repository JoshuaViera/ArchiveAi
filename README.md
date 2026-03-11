# ArchiveAI

**Your LinkedIn voice, on autopilot.**

ArchiveAI turns your LinkedIn post history into a perpetual content engine. Upload your archive, and we'll learn your writing voice, surface your best ideas, and generate new posts that sound exactly like you — in under 5 minutes.

---

## Quick Start

### Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) account
- An [Anthropic API key](https://console.anthropic.com)

### 1. Clone & install

```bash
git clone https://github.com/your-org/archiveai.git
cd archiveai
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration file:
   - Paste the contents of `supabase/migrations/001_initial_schema.sql`
   - Click **Run**
3. Go to **Authentication → Providers** and enable:
   - Email/Password (enabled by default)
   - Google OAuth (requires a Google Cloud project — [guide](https://supabase.com/docs/guides/auth/social-login/auth-google))
4. Copy your project URL, anon key, and service role key from **Settings → API**

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local`. See the file for descriptions of each variable.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
archiveai/
├── middleware.js                    # Auth middleware (redirects unauthenticated users)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Full database schema (7 tables + RLS)
├── src/
│   ├── app/
│   │   ├── layout.js               # Root layout
│   │   ├── page.js                 # Landing page
│   │   ├── login/page.js           # Email/password + Google OAuth
│   │   ├── auth/callback/route.js  # OAuth callback handler
│   │   ├── dashboard/
│   │   │   ├── layout.js           # Dashboard shell with sidebar
│   │   │   ├── page.js             # Main dashboard (stats, voice profile, top posts)
│   │   │   ├── archive/page.js     # Archive browser (upload, search, filter, sort)
│   │   │   ├── generate/page.js    # New post generator
│   │   │   └── revoice/page.js     # Re-voice old posts
│   │   └── api/
│   │       ├── archive/
│   │       │   ├── upload/route.js  # .zip parsing → Supabase
│   │       │   └── analyze/route.js # Post classification + voice profile generation
│   │       ├── generate/route.js    # New post generation (with trial limit)
│   │       ├── revoice/route.js     # Re-voice existing posts
│   │       ├── voice-profile/route.js # Read voice profile
│   │       └── webhooks/
│   │           └── stripe/route.js  # Stripe webhook + checkout session creation
│   ├── components/
│   │   ├── ui/                      # Reusable UI components
│   │   │   ├── StatCard.js
│   │   │   ├── BarChart.js
│   │   │   ├── Pill.js
│   │   │   ├── PostCard.js
│   │   │   └── Spinner.js
│   │   ├── Sidebar.js               # Dashboard navigation
│   │   └── UpgradePrompt.js         # Paywall UI
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.js            # Browser Supabase client
│   │   │   ├── server.js            # Server Supabase client + admin client
│   │   │   └── middleware.js         # Session refresh + route protection
│   │   ├── anthropic.js             # Claude API wrapper
│   │   ├── stripe.js                # Stripe checkout + portal helpers
│   │   ├── archive-parser.js        # LinkedIn .zip → posts (JSZip + PapaParse)
│   │   └── prompts.js               # All AI prompt templates
│   └── styles/
│       └── globals.css              # Tailwind + custom styles
```

---

## Architecture

### Data Flow

```
User uploads .zip → API route parses Shares.csv → Posts saved to Supabase
                                                 → Claude classifies each post
                                                 → Claude builds Voice Profile
                                                 → Dashboard renders analytics

User enters topic  → API route loads Voice Profile + top posts
                   → Claude generates post in user's voice
                   → Output saved to generated_posts table
                   → User copies to clipboard → pastes into LinkedIn
```

### Database (7 tables)

| Table | Purpose |
|-------|---------|
| `profiles` | User data, subscription status, Stripe customer ID |
| `posts` | Archived LinkedIn posts with type classification |
| `voice_profiles` | AI-generated voice analysis (one per user) |
| `generated_posts` | Every post ArchiveAI creates |
| `voice_questionnaire_responses` | Bootstrap path for thin archives |
| `writing_samples` | External writing samples |
| `engagement_self_reports` | Monthly engagement tracking |

All tables have Row-Level Security — users can only access their own data.

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/archive/upload` | POST | Parse .zip, save posts to DB |
| `/api/archive/analyze` | POST | Classify posts, build voice profile |
| `/api/generate` | POST | Generate new post (enforces trial limit) |
| `/api/revoice` | POST | Re-voice an archived post |
| `/api/voice-profile` | GET | Read current voice profile |
| `/api/webhooks/stripe` | POST | Handle Stripe events + create checkout |

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add all environment variables from `.env.local.example`
4. Deploy — done

### Stripe Webhooks

After deploying, set up the Stripe webhook:

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the webhook secret → add as `STRIPE_WEBHOOK_SECRET` in Vercel env vars

---

## Development Notes

### Trial Model

Users get 3 free generations. After that, they must upgrade via Stripe. The generation count is tracked in `profiles.generation_count` and checked in `/api/generate`.

### Voice Engine

All prompts are in `src/lib/prompts.js`. To iterate on voice quality:
1. Edit the prompt templates
2. Test with a real archive
3. Compare output quality

The `generateWithClaude` wrapper in `src/lib/anthropic.js` defaults to Claude Haiku. To A/B test with Sonnet, pass `model: "claude-sonnet-4-20250514"` to the function.

### Archive Parsing

The parser handles multiple LinkedIn export formats (column names vary by region and export date). If you encounter an unsupported format, add the column name variants to `src/lib/archive-parser.js`.

---

## What's Not Built Yet

These are scoped for later phases per the technical roadmap:

- [ ] Resend email integration (welcome, tips, upgrade nudge)
- [ ] Voice questionnaire bootstrap flow (UI exists in schema, needs frontend)
- [ ] Writing samples import (schema ready, needs UI)
- [ ] Monthly engagement self-report survey
- [ ] Post rating feedback loop ("sounds like me" / "doesn't")
- [ ] Mobile responsiveness pass
- [ ] Custom domain setup

---

## License

Private — not for redistribution.
