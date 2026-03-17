# ArchiveAI

**Your LinkedIn voice, on autopilot.**

ArchiveAI turns your LinkedIn post history into a perpetual content engine. Upload your archive, and we'll learn your writing voice, surface your best ideas, and generate new posts that sound exactly like you — in under 5 minutes.

With the latest **"Content Studio Light"** release (Option 2.5), ArchiveAI features a completely revamped, dynamically animated interface optimized for both desktop and mobile, with side-by-side voice profile context and content generation.

---

## ✨ Key Features

- **Voice Profile Analysis**: Ingests your LinkedIn data and builds a persistent AI voice profile.
- **Content Studio Interface**: Fully responsive, mobile-first design leveraging `framer-motion` for smooth, 60fps micro-interactions.
- **Split-View Generation**: Contextual side-by-side layout (on desktop) keeping your Voice Profile visible while prompting Claude.
- **Animated Dashboard**: Staggered component loading, animated confidence meters, and interactive quick action cards.
- **Trial & Monetization**: Built-in 3-post free trial before paywalling via Stripe.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) account
- An [Anthropic API key](https://console.anthropic.com)
- Stripe account (for monetization/webhooks)

### 1. Clone & install

```bash
git clone https://github.com/your-org/archiveai.git
cd archiveai
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration file from `supabase/migrations/001_initial_schema.sql`.
3. Go to **Authentication → Providers** and enable:
   - Email/Password (enabled by default)
   - Google OAuth (requires a Google Cloud project — [guide](https://supabase.com/docs/guides/auth/social-login/auth-google))
4. Copy your project URL, anon key, and service role key from **Settings → API**.

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local`. See the file for descriptions of each variable.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and explore the animated dashboard!

---

## 🏗 Project Structure & Architecture

The application is built on Next.js 14 App Router, Supabase, Tailwind CSS, and Framer Motion.

### Data Flow

```text
User uploads .zip → API route parses Shares.csv → Posts saved to Supabase
                                                 → Claude classifies each post
                                                 → Claude builds Voice Profile
                                                 → Dashboard renders animated analytics

User enters topic → API route loads Voice Profile + top posts
                  → Claude generates post in user's voice
                  → Output saved to generated_posts table
                  → User copies to clipboard → pastes into LinkedIn
```

### Directory Structure

```text
archiveai/
├── middleware.js                    # Auth middleware (redirects unauthenticated users)
├── supabase/
│   └── migrations/                  # Full database schema (7 tables + RLS)
├── src/
│   ├── app/
│   │   ├── layout.js                # Root layout
│   │   ├── page.js                  # Landing page
│   │   ├── login/page.js            # Email/password + Google OAuth
│   │   ├── auth/callback/route.js   # OAuth callback handler
│   │   ├── dashboard/               # Animated Dashboard shell with sidebar
│   │   │   ├── page.js              # Main dashboard (animated stats, voice profile, top posts)
│   │   │   ├── archive/page.js      # Archive browser
│   │   │   ├── generate/page.js     # Split-view Content Studio generator
│   │   │   └── revoice/page.js      # Re-voice old posts
│   │   └── api/                     # Backend endpoints (archive processing, generation, Stripe webhooks)
│   ├── components/
│   │   ├── ui/                      # Reusable UI elements (VoiceProfileCard, StatCard, Pill, PostCard)
│   │   ├── DashboardContent.js      # Main client-side animated dashboard wrapper
│   │   └── Sidebar.js               # Dashboard navigation
│   └── lib/                         # Supabase clients, Anthropic API wrapper, Archive Parser, Prompts
```

### Development Philosophy

- **Animations (`framer-motion`)**: Purposeful, highly-performant micro-interactions rather than overwhelming effects. Focus on 0.2s-0.4s ease-out transitions for scale and opacity.
- **Mobile-First Responsiveness**: Single column touch-friendly layout on mobile, automatically expanding to a 2-3 column split-view on desktop.
- **Voice Engine**: Uses Claude Haiku (via `@anthropic-ai/sdk`) bound to prompts found in `src/lib/prompts.js` for post generation based on parsed LinkedIn `.zip` exports.

---

## 💾 Database Schema (7 Tables)

| Table | Purpose |
|-------|---------|
| `profiles` | User data, subscription status, Stripe ID, trial count (`generation_count`) |
| `posts` | Archived LinkedIn posts with classification types |
| `voice_profiles` | AI-generated voice analysis (one per user) |
| `generated_posts` | Historical record of AI-generated content |
| `voice_questionnaire_responses` | Backup path for users lacking sufficient archive data |
| `writing_samples` | Hand-picked writing samples for further training |
| `engagement_self_reports` | Monthly engagement tracking metrics |

*(Note: Data access is strictly controlled via Supabase Row-Level Security.)*

---

## 🚢 Deployment

### Vercel (recommended)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add all environment variables from `.env.local.example`
4. Deploy — completed

### Stripe Webhooks

After deploying, set up the Stripe webhook:

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the webhook secret → add as `STRIPE_WEBHOOK_SECRET` in Vercel env vars

---

## 🔮 What's Next / Roadmap

These are scoped for later phases per the technical roadmap:

- [ ] Add keyboard shortcuts (e.g., Cmd+G for generate)
- [ ] Post scheduling integrations
- [ ] Voice profile "deep dive" insights modal
- [ ] Multi-format image export feature
- [ ] Resend email integration (welcome, tips, upgrade nudge)
- [ ] Voice questionnaire bootstrap flow (UI exists in schema, needs frontend)
- [ ] Custom domain setup

---

## License

Private — not for redistribution.
