import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardContent from "@/components/DashboardContent";

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
        <div className="text-6xl mb-4 animate-bounce">☰</div>
        <h1 className="text-3xl font-bold mb-3 tracking-tight">Welcome to ArchiveAI</h1>
        <p className="text-text-muted mb-8 text-base leading-relaxed">
          Upload your LinkedIn archive to get started. We'll analyze your posts,
          build your voice profile, and unlock the full dashboard.
        </p>
        <Link
          href="/dashboard/archive"
          className="inline-block px-8 py-3 rounded-xl text-base font-bold text-white no-underline transition-all hover:shadow-lg hover:shadow-accent/20"
          style={{ background: "linear-gradient(135deg, #7C6AEF, #9B8DF5)" }}
        >
          Upload your archive →
        </Link>
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
