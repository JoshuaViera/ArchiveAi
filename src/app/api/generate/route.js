import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWithClaude } from "@/lib/anthropic";
import { buildGeneratePostPrompt } from "@/lib/prompts";

const FREE_GENERATION_LIMIT = 3;

export async function POST(request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { topic, format } = await request.json();
    if (!topic?.trim()) return NextResponse.json({ error: "Topic is required." }, { status: 400 });

    // Check subscription & generation count
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status, generation_count")
      .eq("id", user.id)
      .single();

    const isSubscribed = profile?.subscription_status === "active";
    const generationsUsed = profile?.generation_count || 0;

    if (!isSubscribed && generationsUsed >= FREE_GENERATION_LIMIT) {
      return NextResponse.json({
        error: "You've used your 3 free generations. Upgrade to continue.",
        upgrade: true,
        generationsUsed,
      }, { status: 403 });
    }

    // Fetch voice profile
    const { data: voiceProfile } = await supabase
      .from("voice_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!voiceProfile) {
      return NextResponse.json({
        error: "No voice profile found. Upload your archive first.",
      }, { status: 400 });
    }

    // Fetch top posts for examples
    const { data: topPosts } = await supabase
      .from("posts")
      .select("content, post_type, performance_percentile")
      .eq("user_id", user.id)
      .order("performance_percentile", { ascending: false })
      .limit(5);

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

    return NextResponse.json({
      output,
      generationsUsed: generationsUsed + 1,
    });
  } catch (e) {
    console.error("Generate error:", e);
    return NextResponse.json({ error: "Generation failed." }, { status: 500 });
  }
}
