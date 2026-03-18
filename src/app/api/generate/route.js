import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWithClaude } from "@/lib/anthropic";
import { buildGeneratePostPrompt } from "@/lib/prompts";

const FREE_GENERATION_LIMIT = 3;

// Mock demo voice profile
const DEMO_VOICE_PROFILE = {
  id: "demo-user-id",
  user_id: "demo-user-id",
  confidence_level: "full",
  post_count_analyzed: 85,
  profile_summary: "You have a conversational, vulnerability-driven style focused on actionable consulting insights with data-backed examples.",
  traits: ["Actionable", "Data-driven", "Conversational", "Vulnerable"],
  structural_patterns: {
    topFormats: [
      { type: "Hook-driven Story", avgPercentile: 85, pct: 35 },
      { type: "Framework", avgPercentile: 78, pct: 28 },
      { type: "Hot Take", avgPercentile: 72, pct: 22 },
    ],
    toneCharacteristics: ["Vulnerable", "Conversational", "Direct"],
    commonThemes: ["Entrepreneurship", "Leadership", "Business Growth"],
  },
};

// Mock demo posts
const DEMO_POSTS = [
  {
    id: "1",
    content: "Why most consultants underprice their services...",
    post_type: "hook-driven-story",
    performance_percentile: 92,
  },
  {
    id: "2",
    content: "3 frameworks that changed my consulting business...",
    post_type: "framework",
    performance_percentile: 88,
  },
  {
    id: "3",
    content: "Hot take: Most consultants are leaving money on the table...",
    post_type: "hot-take",
    performance_percentile: 75,
  },
];

export async function POST(request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // In demo mode, allow requests without authentication
    const isDemoMode = !user;

    const { topic, format } = await request.json();
    if (!topic?.trim()) return NextResponse.json({ error: "Topic is required." }, { status: 400 });

    let profile = null;
    let voiceProfile = null;
    let topPosts = DEMO_POSTS;
    let generationsUsed = 0;

    if (user) {
      // Real mode: fetch from database
      const { data: dbProfile } = await supabase
        .from("profiles")
        .select("subscription_status, generation_count")
        .eq("id", user.id)
        .single();

      profile = dbProfile;

      const isSubscribed = profile?.subscription_status === "active";
      generationsUsed = profile?.generation_count || 0;

      if (!isSubscribed && generationsUsed >= FREE_GENERATION_LIMIT) {
        return NextResponse.json({
          error: "You've used your 3 free generations. Upgrade to continue.",
          upgrade: true,
          generationsUsed,
        }, { status: 403 });
      }

      // Fetch voice profile
      const { data: dbVoiceProfile } = await supabase
        .from("voice_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      voiceProfile = dbVoiceProfile;

      if (!voiceProfile) {
        return NextResponse.json({
          error: "No voice profile found. Upload your archive first.",
        }, { status: 400 });
      }

      // Fetch top posts for examples
      const { data: dbTopPosts } = await supabase
        .from("posts")
        .select("content, post_type, performance_percentile")
        .eq("user_id", user.id)
        .order("performance_percentile", { ascending: false })
        .limit(5);

      topPosts = dbTopPosts || DEMO_POSTS;
    } else {
      // Demo mode: use mock data
      console.log("🎭 DEMO MODE: Using mock voice profile and posts");
      voiceProfile = DEMO_VOICE_PROFILE;
      topPosts = DEMO_POSTS;
      generationsUsed = 0;
    }

    // Build structural insight
    const patterns = voiceProfile.structural_patterns?.topFormats;
    let structuralInsight = "";
    if (patterns?.length > 0) {
      const best = patterns[0];
      structuralInsight = `Your "${best.type}" posts have the highest average performance (${best.avgPercentile}th percentile). They make up ${best.pct}% of your archive.`;
    }

    // Generate
    const { system, prompt } = buildGeneratePostPrompt({
      voiceProfile,
      topPosts: topPosts || [],
      topic,
      format,
      structuralInsight,
    });

    const output = await generateWithClaude({ system, prompt });

    // Only save if user is authenticated
    if (user) {
      // Save generated post
      await supabase.from("generated_posts").insert({
        user_id: user.id,
        prompt: topic,
        output,
        format,
      });

      // Increment generation count
      await supabase
        .from("profiles")
        .update({ generation_count: generationsUsed + 1 })
        .eq("id", user.id);
    }

    return NextResponse.json({
      output,
      generationsUsed: generationsUsed + 1,
      demoMode: isDemoMode,
    });
  } catch (e) {
    console.error("Generate error:", e);
    return NextResponse.json({ error: "Generation failed." }, { status: 500 });
  }
}
