import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardContent from "@/components/DashboardContent";

// Demo data for unauthenticated users
const DEMO_VOICE_PROFILE = {
  confidence_level: "full",
  post_count_analyzed: 85,
  profile_summary: "Direct and story-driven. Favors short punchy sentences followed by one longer explanatory line. Opens with personal anecdotes or contrarian claims. Closes with a single actionable takeaway.",
  traits: ["Personal anecdote openers", "One-line paragraphs", "No hashtags", "Direct CTAs", "Em-dash usage"],
  structural_patterns: {
    topFormats: [
      { type: "Hook-driven Story", avgPercentile: 85, pct: 35 },
      { type: "Framework", avgPercentile: 78, pct: 28 },
      { type: "Hot Take", avgPercentile: 72, pct: 22 },
      { type: "Listicle", avgPercentile: 60, pct: 10 },
      { type: "Question", avgPercentile: 55, pct: 5 },
    ],
  },
};

const DEMO_POSTS = [
  { id: "d1", content: "I lost my biggest client last Tuesday.\n\nNot because of price. Not because of quality.\n\nBecause I forgot to reply to one email.", published_at: "2024-11-14", post_type: "hook-driven-story", hook_style: "personal-anecdote", performance_percentile: 95, likes: 847, comments: 93, shares: 41 },
  { id: "d2", content: "Unpopular opinion: Most consultants don\u2019t have a lead gen problem.\n\nThey have a positioning problem.", published_at: "2024-09-22", post_type: "hot-take", hook_style: "contrarian-claim", performance_percentile: 88, likes: 612, comments: 78, shares: 35 },
  { id: "d3", content: "The framework that doubled my consulting rate in 6 months:\n\n1. Track every hour for 2 weeks\n2. Calculate your effective hourly rate\n3. Identify the bottom 20% of tasks\n4. Eliminate, delegate, or reprice\n5. Repeat quarterly", published_at: "2024-08-03", post_type: "framework", hook_style: "promise-of-outcome", performance_percentile: 82, likes: 534, comments: 67, shares: 52 },
  { id: "d4", content: "Nobody talks about the loneliness of solo consulting.\n\nYou leave a team of 30. Suddenly it\u2019s just you and your laptop.", published_at: "2024-07-08", post_type: "hook-driven-story", hook_style: "personal-anecdote", performance_percentile: 71, likes: 198, comments: 42, shares: 16 },
];

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Demo mode: show sample data
  if (!user) {
    return (
      <DashboardContent
        totalPosts={85}
        dateRange="Jan 2023 \u2013 Feb 2026"
        bestPercentile={95}
        voiceProfile={DEMO_VOICE_PROFILE}
        formatStats={DEMO_VOICE_PROFILE.structural_patterns.topFormats}
        topPosts={DEMO_POSTS}
        demoMode
      />
    );
  }

  // Fetch data in parallel
  const [postsRes, voiceRes] = await Promise.all([
    supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("performance_percentile", { ascending: false }),
    supabase
      .from("voice_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single(),
  ]);

  const posts = postsRes.data || [];
  const voiceProfile = voiceRes.data;
  const topPosts = posts.filter((p) => p.performance_percentile >= 80).slice(0, 4);

  // Calculate format stats from structural_patterns or posts
  const formatStats = voiceProfile?.structural_patterns?.topFormats || [];

  // Compute summary stats
  const totalPosts = posts.length;
  const bestPercentile = posts[0]?.performance_percentile || 0;
  const dateRange = totalPosts > 0
    ? `${new Date(posts[posts.length - 1]?.published_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })} – ${new Date(posts[0]?.published_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
    : "No posts yet";

  // Empty state: no posts
  if (totalPosts === 0) {
    // If they have a bootstrap voice profile from the questionnaire, show dashboard with it
    if (voiceProfile) {
      return (
        <DashboardContent
          totalPosts={0}
          dateRange="No posts yet"
          bestPercentile={0}
          voiceProfile={voiceProfile}
          formatStats={formatStats}
          topPosts={[]}
          bootstrapMode
        />
      );
    }

    // No profile at all — offer both paths
    return (
      <div className="max-w-[640px] mx-auto text-center py-16">
        <div className="text-5xl mb-4">✦</div>
        <h1 className="text-3xl font-bold mb-3 tracking-tight">Welcome to ArchiveAI</h1>
        <p className="text-text-muted mb-10 text-base leading-relaxed">
          Let's build your voice profile. Pick the path that works for you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {/* Archive path */}
          <Link
            href="/dashboard/archive"
            className="bg-surface border border-border rounded-xl p-6 no-underline hover:border-border-hi transition-all group"
          >
            <div className="text-3xl mb-3">📁</div>
            <h3 className="text-base font-semibold text-text-primary mb-1 group-hover:text-accent-light transition-colors">
              Upload LinkedIn Archive
            </h3>
            <p className="text-xs text-text-muted m-0 leading-relaxed">
              Best results. We'll analyze your posts, learn your patterns, and build a high-confidence voice profile.
            </p>
            <span className="inline-block mt-3 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-md">
              Recommended
            </span>
          </Link>

          {/* Questionnaire path */}
          <Link
            href="/dashboard/onboarding"
            className="bg-surface border border-border rounded-xl p-6 no-underline hover:border-border-hi transition-all group"
          >
            <div className="text-3xl mb-3">🎤</div>
            <h3 className="text-base font-semibold text-text-primary mb-1 group-hover:text-accent-light transition-colors">
              Voice Questionnaire
            </h3>
            <p className="text-xs text-text-muted m-0 leading-relaxed">
              No archive? No problem. Answer a few questions about your style and we'll build a starter profile in 2 minutes.
            </p>
            <span className="inline-block mt-3 text-xs font-semibold text-accent-light bg-accent/10 px-2.5 py-1 rounded-md">
              Quick start
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <DashboardContent
      totalPosts={totalPosts}
      dateRange={dateRange}
      bestPercentile={bestPercentile}
      voiceProfile={voiceProfile}
      formatStats={formatStats}
      topPosts={topPosts}
    />
  );
}
