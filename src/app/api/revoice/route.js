import { NextResponse } from "next/server";
import { generateWithClaude } from "@/lib/anthropic";
import { buildRevoicePrompt } from "@/lib/prompts";

const DEMO_VOICE_PROFILE = {
  profile_summary: "Direct and story-driven. Favors short punchy sentences followed by one longer explanatory line. Opens with personal anecdotes or contrarian claims. Closes with a single actionable takeaway. Avoids jargon — prefers plain language even on complex B2B topics.",
  traits: ["Personal anecdote openers", "One-line paragraphs", "No hashtags", "Direct CTAs", "Em-dash usage"],
};

export async function POST(request) {
  try {
    const { postId, postContent, postType, postDate, context } = await request.json();

    const content = postContent;
    if (!content) {
      return NextResponse.json({ error: "Post content is required." }, { status: 400 });
    }

    const originalPost = {
      content,
      post_type: postType || "hook-driven-story",
      hook_style: "personal-anecdote",
      published_at: postDate || "2024-01-01",
    };

    const { system, prompt } = buildRevoicePrompt({
      voiceProfile: DEMO_VOICE_PROFILE,
      originalPost,
      context,
    });

    const output = await generateWithClaude({ system, prompt });

    return NextResponse.json({ output, demoMode: true });
  } catch (e) {
    console.error("Revoice error:", e);
    return NextResponse.json({ error: "Re-voicing failed." }, { status: 500 });
  }
}