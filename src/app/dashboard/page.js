import Link from "next/link";
import DashboardContent from "@/components/DashboardContent";

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
  { id: "d1", content: "I lost my biggest client last Tuesday.\n\nNot because of price. Not because of quality.\n\nBecause I forgot to reply to one email.", published_at: "2025-11-14", post_type: "hook-driven-story", hook_style: "personal-anecdote", performance_percentile: 99, likes: 847, comments: 93, shares: 41 },
  { id: "d2", content: "Unpopular opinion: Most consultants don\u2019t have a lead gen problem.\n\nThey have a positioning problem.", published_at: "2025-09-22", post_type: "hot-take", hook_style: "contrarian-claim", performance_percentile: 96, likes: 612, comments: 78, shares: 35 },
  { id: "d3", content: "The framework that doubled my consulting rate in 6 months:\n\n1. Track every hour for 2 weeks\n2. Calculate your effective hourly rate\n3. Identify the bottom 20% of tasks\n4. Eliminate, delegate, or reprice\n5. Repeat quarterly", published_at: "2025-08-03", post_type: "framework", hook_style: "promise-of-outcome", performance_percentile: 94, likes: 534, comments: 67, shares: 52 },
  { id: "d4", content: "Nobody talks about the loneliness of solo consulting.\n\nYou leave a team of 30. Suddenly it\u2019s just you and your laptop.", published_at: "2024-07-08", post_type: "hook-driven-story", hook_style: "personal-anecdote", performance_percentile: 61, likes: 198, comments: 42, shares: 16 },
];

export default function DashboardPage() {
  return (
    <DashboardContent
      totalPosts={85}
      dateRange="Jan 2023 – Feb 2026"
      bestPercentile={99}
      voiceProfile={DEMO_VOICE_PROFILE}
      formatStats={DEMO_VOICE_PROFILE.structural_patterns.topFormats}
      topPosts={DEMO_POSTS}
      demoMode
    />
  );
}
