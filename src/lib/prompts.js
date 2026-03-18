/**
 * ArchiveAI — Prompt Templates
 *
 * All prompts sent to the Anthropic API are defined here.
 * This makes it easy to iterate on voice quality without
 * touching API route logic.
 */

// ─── VOICE PROFILE GENERATION ──────────────────────────────

export function buildVoiceProfilePrompt(posts) {
  return {
    system: `You are a writing style analyst. Analyze the LinkedIn posts provided and produce a structured voice profile. Be specific and precise — this profile will be used to generate new content that sounds like the author.

Respond ONLY with valid JSON in this exact shape:
{
  "summary": "2-3 sentence description of writing style",
  "traits": ["trait 1", "trait 2", "trait 3", "trait 4", "trait 5"],
  "sentence_patterns": "brief description of typical sentence length and structure",
  "vocabulary_level": "plain | moderate | technical",
  "tone": "brief tone description",
  "opening_patterns": ["pattern 1", "pattern 2"],
  "closing_patterns": ["pattern 1", "pattern 2"]
}`,
    prompt: `Analyze these ${posts.length} LinkedIn posts and generate a voice profile:\n\n${posts.map((p, i) => `--- POST ${i + 1} ---\n${p.content}`).join("\n\n")}`,
  };
}


// ─── POST CLASSIFICATION ───────────────────────────────────

export function buildClassifyPostPrompt(postContent) {
  return {
    system: `You classify LinkedIn posts by type and hook style. Respond ONLY with valid JSON:
{
  "post_type": "hook-driven-story" | "framework" | "hot-take" | "listicle" | "question" | "other",
  "hook_style": "personal-anecdote" | "contrarian-claim" | "data-point" | "promise-of-outcome" | "question" | "other",
  "explanation": "one sentence explaining why"
}`,
    prompt: `Classify this LinkedIn post:\n\n${postContent}`,
  };
}

// Batch classify — more efficient for archive processing
// Also assigns a quality_score (1-100) since LinkedIn exports lack engagement data
export function buildBatchClassifyPrompt(posts) {
  return {
    system: `You classify LinkedIn posts and score their content quality. For each post, determine:
- post_type: hook-driven-story, framework, hot-take, listicle, question, or other
- hook_style: personal-anecdote, contrarian-claim, data-point, promise-of-outcome, question, or other
- quality_score: integer 1-100 rating the post's likely engagement potential based on:
  * Hook strength (does the opening line stop the scroll?)
  * Specificity (concrete numbers, names, details vs vague generalities)
  * Structure (clear rhythm, white space, scannable format)
  * Emotional resonance (vulnerability, surprise, relatability)
  * Actionability (does the reader walk away with something useful?)
  * Originality (fresh angle vs generic advice)
  Score 80+ = exceptional, 60-79 = strong, 40-59 = average, below 40 = weak.

Respond ONLY with a JSON array, one object per post, in the same order:
[{ "post_type": "...", "hook_style": "...", "quality_score": 72 }, ...]`,
    prompt: `Classify and score these ${posts.length} posts:\n\n${posts.map((p, i) => `--- POST ${i + 1} ---\n${p.content}`).join("\n\n")}`,
  };
}


// ─── POST GENERATION ───────────────────────────────────────

export function buildGeneratePostPrompt({ voiceProfile, topPosts, topic, format, structuralInsight }) {
  const system = `You are a LinkedIn ghostwriter. Write ONLY the LinkedIn post — no preamble, no explanation, no labels, no quotes around it.

VOICE PROFILE:
${voiceProfile.profile_summary}

STYLE TRAITS: ${(voiceProfile.traits || []).join(", ")}

${structuralInsight ? `ANALYTICS INSIGHT: ${structuralInsight}` : ""}

RULES:
- Write in first person
- No hashtags, no emojis
- Short paragraphs (1-2 sentences max)
- Sound human, not AI
${topPosts.length > 0 ? "- Match the rhythm and energy of the reference posts exactly" : "- Follow the voice profile traits closely since no reference posts are available"}`;

  const examples = topPosts.map((p) => p.content).join("\n---\n");

  const prompt = topPosts.length > 0
    ? `Write a LinkedIn post in the "${format}" format about: ${topic}\n\nVoice reference (top-performing posts):\n${examples}\n\nWrite ONLY the post.`
    : `Write a LinkedIn post in the "${format}" format about: ${topic}\n\nNo reference posts available — rely entirely on the voice profile above.\n\nWrite ONLY the post.`;

  return { system, prompt };
}


// ─── RE-VOICING ────────────────────────────────────────────

export function buildRevoicePrompt({ voiceProfile, originalPost, context }) {
  const system = `You are a LinkedIn ghostwriter. Re-voice the original post for 2026. Keep the core idea but update the framing, write a stronger opening hook, and match the current voice profile.

VOICE PROFILE:
${voiceProfile.profile_summary}

STYLE TRAITS: ${(voiceProfile.traits || []).join(", ")}

RULES:
- Write in first person
- No hashtags, no emojis
- Short paragraphs (1-2 sentences max)
- Sound human, not AI
- Write ONLY the re-voiced post — no preamble, no labels`;

  const prompt = `Re-voice this post (originally from ${originalPost.published_at}):

${originalPost.content}

${context ? `CONTEXT: ${context}` : ""}

Original format: "${originalPost.post_type}" with "${originalPost.hook_style}" hook.

Write ONLY the re-voiced post.`;

  return { system, prompt };
}


// ─── BOOTSTRAP VOICE PROFILE ───────────────────────────────

export function buildBootstrapProfilePrompt({ questionnaireResponses, archetype, writingSamples }) {
  return {
    system: `You are a writing style analyst. Build a preliminary voice profile from questionnaire responses and optional writing samples. This profile will be used for content generation, so be as specific as possible about writing patterns.

Respond ONLY with valid JSON in this shape:
{
  "summary": "2-3 sentence description of likely writing style",
  "traits": ["trait 1", "trait 2", "trait 3", "trait 4", "trait 5"],
  "vocabulary_level": "plain | moderate | technical",
  "tone": "brief tone description"
}`,
    prompt: `Build a voice profile from this data:

SELECTED ARCHETYPE: ${archetype || "none selected"}

QUESTIONNAIRE RESPONSES:
${JSON.stringify(questionnaireResponses, null, 2)}

${writingSamples?.length ? `WRITING SAMPLES:\n${writingSamples.map((s, i) => `--- SAMPLE ${i + 1} (${s.source_label || "unknown source"}) ---\n${s.content}`).join("\n\n")}` : "No writing samples provided."}`,
  };
}
