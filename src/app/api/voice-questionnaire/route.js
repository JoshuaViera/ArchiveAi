import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWithClaude } from "@/lib/anthropic";
import { buildBootstrapProfilePrompt } from "@/lib/prompts";

export async function POST(request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { responses, archetype, writingSamples } = await request.json();

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json({ error: "Questionnaire responses are required." }, { status: 400 });
    }

    // ── Step 1: Save questionnaire responses ──
    const { error: qErr } = await supabase
      .from("voice_questionnaire_responses")
      .upsert({
        user_id: user.id,
        responses,
        selected_archetype: archetype || null,
      }, { onConflict: "user_id" });

    if (qErr) {
      console.error("Questionnaire save error:", qErr);
      return NextResponse.json({ error: "Failed to save questionnaire." }, { status: 500 });
    }

    // ── Step 2: Save writing samples (if provided) ──
    if (writingSamples?.length > 0) {
      // Clear existing samples first
      await supabase.from("writing_samples").delete().eq("user_id", user.id);

      const samplesToInsert = writingSamples
        .filter((s) => s.content?.trim())
        .map((s) => ({
          user_id: user.id,
          content: s.content.trim(),
          source_label: s.source_label || null,
        }));

      if (samplesToInsert.length > 0) {
        const { error: sErr } = await supabase.from("writing_samples").insert(samplesToInsert);
        if (sErr) console.error("Writing samples save error:", sErr);
      }
    }

    // ── Step 3: Fetch any existing posts (user may have a small archive) ──
    const { data: existingPosts } = await supabase
      .from("posts")
      .select("content")
      .eq("user_id", user.id)
      .order("performance_percentile", { ascending: false })
      .limit(10);

    // Merge writing samples: existing posts + manually provided samples
    const allSamples = [
      ...(existingPosts || []).map((p) => ({ content: p.content, source_label: "LinkedIn archive" })),
      ...(writingSamples || []).filter((s) => s.content?.trim()),
    ];

    // ── Step 4: Generate bootstrap voice profile ──
    const { system, prompt } = buildBootstrapProfilePrompt({
      questionnaireResponses: responses,
      archetype,
      writingSamples: allSamples,
    });

    const raw = await generateWithClaude({ system, prompt });

    let profileData;
    try {
      profileData = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch (parseErr) {
      console.error("Bootstrap profile parse error:", parseErr);
      profileData = {
        summary: "Voice profile is being built from your questionnaire responses.",
        traits: [],
        vocabulary_level: "moderate",
        tone: "conversational",
      };
    }

    // ── Step 5: Upsert voice profile ──
    const postCount = existingPosts?.length || 0;
    const confidenceLevel = postCount >= 30 ? "full" : postCount >= 10 ? "limited" : "bootstrap-only";

    const { error: upsertErr } = await supabase
      .from("voice_profiles")
      .upsert({
        user_id: user.id,
        profile_summary: profileData.summary || "",
        traits: profileData.traits || [],
        post_count_analyzed: postCount,
        confidence_level: confidenceLevel,
        structural_patterns: {
          topFormats: [],
          toneCharacteristics: [profileData.tone || "conversational"],
          commonThemes: [],
          vocabularyLevel: profileData.vocabulary_level || "moderate",
          bootstrapArchetype: archetype || null,
        },
        last_updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (upsertErr) {
      console.error("Voice profile upsert error:", upsertErr);
      return NextResponse.json({ error: "Failed to save voice profile." }, { status: 500 });
    }

    return NextResponse.json({
      profile: {
        summary: profileData.summary,
        traits: profileData.traits,
        tone: profileData.tone,
        vocabularyLevel: profileData.vocabulary_level,
      },
      confidenceLevel,
      postCount,
    });
  } catch (e) {
    console.error("Voice questionnaire error:", e);
    return NextResponse.json({ error: "Failed to process questionnaire." }, { status: 500 });
  }
}
