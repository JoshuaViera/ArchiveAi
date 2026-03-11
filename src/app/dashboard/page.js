import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import StatCard from "@/components/ui/StatCard";
import BarChart from "@/components/ui/BarChart";
import PostCard from "@/components/ui/PostCard";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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

  // Empty state
  if (totalPosts === 0) {
    return (
      <div className="max-w-[700px] mx-auto text-center py-20">
        <div className="text-5xl mb-4">☰</div>
        <h1 className="text-2xl font-bold mb-2">Welcome to ArchiveAI</h1>
        <p className="text-text-muted mb-8">
          Upload your LinkedIn archive to get started. We'll analyze your posts,
          build your voice profile, and unlock the full dashboard.
        </p>
        <Link
          href="/dashboard/archive"
          className="inline-block px-8 py-3 rounded-xl text-base font-bold text-white no-underline"
          style={{ background: "linear-gradient(135deg, #7C6AEF, #9B8DF5)" }}
        >
          Upload your archive →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[940px] mx-auto">
      <h1 className="text-2xl font-bold mb-1.5 tracking-tight">Dashboard</h1>
      <p className="text-text-muted text-sm mb-7">Your LinkedIn content intelligence at a glance.</p>

      {/* Stats */}
      <div className="flex gap-3.5 mb-7 flex-wrap">
        <StatCard label="Posts Analyzed" value={totalPosts} sub={dateRange} />
        <StatCard label="Best Format" value="Story" sub="Highest avg engagement" />
        <StatCard label="Top Percentile" value={`${bestPercentile}th`} sub="Your best post" />
      </div>

      {/* Voice Profile */}
      {voiceProfile && (
        <div className="bg-surface border border-border rounded-xl p-6 mb-7">
          <div className="flex justify-between items-center mb-3.5">
            <div>
              <h3 className="text-base font-semibold m-0">Your Voice Profile</h3>
              <p className="text-xs text-text-dim mt-1 mb-0">
                Generated from {voiceProfile.post_count_analyzed} posts
              </p>
            </div>
            <span
              className={`text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider ${
                voiceProfile.confidence_level === "full"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-amber-500/10 text-amber-400"
              }`}
            >
              {voiceProfile.confidence_level} confidence
            </span>
          </div>
          <p className="text-sm leading-relaxed text-text-muted mb-4">{voiceProfile.profile_summary}</p>
          <div className="flex gap-2 flex-wrap">
            {(voiceProfile.traits || []).map((t, i) => (
              <span key={i} className="text-[11px] px-3 py-1 rounded-full bg-bg text-text-muted border border-border">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Engagement chart */}
      {formatStats.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6 mb-7">
          <h3 className="text-base font-semibold mb-4">Engagement by Post Format</h3>
          <BarChart data={formatStats} />
        </div>
      )}

      {/* Top posts */}
      {topPosts.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-3.5">
            <h3 className="text-base font-semibold m-0">Top Posts</h3>
            <Link href="/dashboard/archive" className="text-accent-light text-[13px] font-semibold no-underline">
              View all →
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {topPosts.map((p) => (
              <PostCard key={p.id} post={p} compact />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
