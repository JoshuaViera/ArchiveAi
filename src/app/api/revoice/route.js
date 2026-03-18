import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWithClaude } from "@/lib/anthropic";
import { buildRevoicePrompt } from "@/lib/prompts";

export async function POST(request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { postId, context } = await request.json();
    if (!postId) return NextResponse.json({ error: "Post ID is required." }, { status: 400 });

    // Fetch the original post
    const { data: originalPost } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .eq("user_id", user.id)
      .single();

    if (!originalPost) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    // Fetch voice profile
    const { data: voiceProfile } = await supabase
      .from("voice_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!voiceProfile) {
      return NextResponse.json({ error: "No voice profile found." }, { status: 400 });
    }

    // Generate re-voiced version
    const { system, prompt } = buildRevoicePrompt({
      voiceProfile,
      originalPost,
      context,
    });

    const output = await generateWithClaude({ system, prompt });

    // Save to generated_posts with source reference
    await supabase.from("generated_posts").insert({
      user_id: user.id,
      source_post_id: postId,
      prompt: context || `Re-voice post from ${originalPost.published_at}`,
      output,
      format: originalPost.post_type || "revoice",
    });

    // Mark original as reused
    await supabase
      .from("posts")
      .update({ is_reused: true })
      .eq("id", postId);

    return NextResponse.json({ output });
  } catch (e) {
    console.error("Revoice error:", e);
    return NextResponse.json({ error: "Re-voicing failed." }, { status: 500 });
  }
}
