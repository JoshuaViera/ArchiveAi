import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWithClaude } from "@/lib/anthropic";
import { buildRevoicePrompt } from "@/lib/prompts";

// Demo voice profile for unauthenticated users
const DEMO_VOICE_PROFILE = {
  profile_summary: "Direct and story-driven. Favors short punchy sentences followed by one longer explanatory line. Opens with personal anecdotes or contrarian claims. Closes with a single actionable takeaway.",
  traits: ["Personal anecdote openers", "One-line paragraphs", "No hashtags", "Direct CTAs", "Em-dash usage"],
};

export async function POST(request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const isDemoMode = !user;
    const { postId, postContent, postType, postDate, context } = await request.json();

    let originalPost = null;
    let voiceProfile = null;

    if (user) {
      // Real mode: fetch from database
      if (!postId) return NextResponse.json({ error: "Post ID is required." }, { status: 400 });

      const { data: dbPost } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .eq("user_id", user.id)
        .single();

      if (!dbPost) {
        return NextResponse.json({ error: "Post not found." }, { status: 404 });
      }
      originalPost = dbPost;

      const { data: dbVoiceProfile } = await supabase
        .from("voice_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!dbVoiceProfile) {
        return NextResponse.json({ error: "No voice profile found." }, { status: 400 });
      }
      voiceProfile = dbVoiceProfile;
    } else {
      // Demo mode: use content passed from frontend
      if (!postContent) return NextResponse.json({ error: "Post content is required." }, { status: 400 });
      console.log("🎭 DEMO MODE: Using provided post content and mock voice profile");
      originalPost = {
        content: postContent,
        post_type: postType || "other",
        hook_style: "other",
        published_at: postDate || "2024-01-01",
      };
      voiceProfile = DEMO_VOICE_PROFILE;
    }

    // Generate re-voiced version
    const { system, prompt } = buildRevoicePrompt({
      voiceProfile,
      originalPost,
      context,
    });

    const output = await generateWithClaude({ system, prompt });

    // Only save if user is authenticated
    if (user) {
      await supabase.from("generated_posts").insert({
        user_id: user.id,
        source_post_id: postId,
        prompt: context || `Re-voice post from ${originalPost.published_at}`,
        output,
        format: originalPost.post_type || "revoice",
      });

      await supabase
        .from("posts")
        .update({ is_reused: true })
        .eq("id", postId);
    }

    return NextResponse.json({ output, demoMode: isDemoMode });
  } catch (e) {
    console.error("Revoice error:", e);
    return NextResponse.json({ error: "Re-voicing failed." }, { status: 500 });
  }
}
