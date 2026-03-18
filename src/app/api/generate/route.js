import { NextResponse } from "next/server";
import { generateWithClaude } from "@/lib/anthropic";
import { buildGeneratePostPrompt } from "@/lib/prompts";

const DEMO_VOICE_PROFILE = {
  profile_summary: "Direct and story-driven. Favors short punchy sentences followed by one longer explanatory line. Opens with personal anecdotes or contrarian claims. Closes with a single actionable takeaway. Avoids jargon — prefers plain language even on complex B2B topics.",
  traits: ["Personal anecdote openers", "One-line paragraphs", "No hashtags", "Direct CTAs", "Em-dash usage"],
  structural_patterns: {
    topFormats: [
      { type: "Hook-driven Story", avgPercentile: 85, pct: 35 },
    ],
  },
};

const DEMO_POSTS = [
  { content: "I lost my biggest client last Tuesday.\n\nNot because of price. Not because of quality.\n\nBecause I forgot to reply to one email.\n\nThe relationship IS the deliverable." },
  { content: "Unpopular opinion: Most consultants don't have a lead gen problem.\n\nThey have a positioning problem.\n\nClarity is the ultimate growth hack. Everything else is noise." },
  { content: "The framework that doubled my consulting rate in 6 months:\n\n1. Track every hour for 2 weeks\n2. Calculate your effective hourly rate\n3. Identify the bottom 20% of tasks\n4. Eliminate, delegate, or reprice\n5. Repeat quarterly" },
];

export async function POST(request) {
  try {
    const { topic, format } = await request.json();
    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    const { system, prompt } = buildGeneratePostPrompt({
      voiceProfile: DEMO_VOICE_PROFILE,
      topPosts: DEMO_POSTS,
      topic,
      format,
      structuralInsight: 'Your "Hook-driven Story" posts have the highest average performance (85th percentile). They make up 35% of your archive.',
    });

    const output = await generateWithClaude({ system, prompt });

    return NextResponse.json({ output, generationsUsed: 0, demoMode: true });
  } catch (e) {
    console.error("Generate error:", e);
    return NextResponse.json({ error: "Generation failed." }, { status: 500 });
  }
}