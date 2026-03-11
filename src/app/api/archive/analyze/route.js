import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWithClaude } from "@/lib/anthropic";
import { buildBatchClassifyPrompt, buildVoiceProfilePrompt } from "@/lib/prompts";

export async function POST(request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch all posts
    const { data: posts } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("published_at", { ascending: false });

    if (!posts || posts.length === 0) {
      return NextResponse.json({ error: "No posts to analyze." }, { status: 400 });
    }

    // ── Step 1: Classify posts by type ──────────────────
    // Process in batches of 10 to stay within context limits
    const batchSize = 10;
    for (let i = 0; i < posts.length; i += batchSize) {
      const batch = posts.slice(i, i + batchSize);
      const { system, prompt } = buildBatchClassifyPrompt(batch);

      const raw = await generateWithClaude({ system, prompt });

      try {
        const classifications = JSON.parse(raw.replace(/```json|```/g, "").trim());

        // Update each post
        for (let j = 0; j < batch.length && j < classifications.length; j++) {
          const c = classifications[j];
          await supabase
            .from("posts")
            .update({
              post_type: c.post_type || "other",
              hook_style: c.hook_style || "other",
            })
            .eq("id", batch[j].id);
        }
      } catch (parseErr) {
        console.error("Classification parse error:", parseErr);
        // Continue — partial classification is better than none
      }
    }

    // ── Step 2: Build voice profile ─────────────────────
    const topPosts = posts.slice(0, 30); // Use up to 30 posts for profile
    const { system: vpSystem, prompt: vpPrompt } = buildVoiceProfilePrompt(topPosts);
    const vpRaw = await generateWithClaude({ system: vpSystem, prompt: vpPrompt });

    let profileData;
    try {
      profileData = JSON.parse(vpRaw.replace(/```json|```/g, "").trim());
    } catch (parseErr) {
      console.error("Voice profile parse error:", parseErr);
      profileData = {
        summary: "Voice profile generation in progress. Please try again.",
        traits: [],
      };
    }

    // ── Step 3: Compute structural patterns ─────────────
    const { data: classifiedPosts } = await supabase
      .from("posts")
      .select("post_type, performance_percentile")
      .eq("user_id", user.id)
      .not("post_type", "is", null);

    const typeStats = {};
    for (const p of classifiedPosts || []) {
      if (!typeStats[p.post_type]) typeStats[p.post_type] = { count: 0, totalPercentile: 0 };
      typeStats[p.post_type].count++;
      typeStats[p.post_type].totalPercentile += p.performance_percentile || 0;
    }

    const topFormats = Object.entries(typeStats)
      .map(([type, stats]) => ({
        type,
        avgPercentile: Math.round(stats.totalPercentile / stats.count),
        pct: Math.round((stats.count / (classifiedPosts?.length || 1)) * 100),
      }))
      .sort((a, b) => b.avgPercentile - a.avgPercentile);

    // ── Step 4: Upsert voice profile ────────────────────
    const confidenceLevel = posts.length >= 30 ? "full" : posts.length >= 10 ? "limited" : "bootstrap-only";

    const { error: upsertErr } = await supabase
      .from("voice_profiles")
      .upsert({
        user_id: user.id,
        profile_summary: profileData.summary || "",
        traits: profileData.traits || [],
        post_count_analyzed: posts.length,
        confidence_level: confidenceLevel,
        structural_patterns: { topFormats },
        last_updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (upsertErr) {
      console.error("Voice profile upsert error:", upsertErr);
    }

    return NextResponse.json({
      postsClassified: classifiedPosts?.length || 0,
      confidenceLevel,
      topFormats,
    });
  } catch (e) {
    console.error("Analysis error:", e);
    return NextResponse.json({ error: "Analysis failed." }, { status: 500 });
  }
}
