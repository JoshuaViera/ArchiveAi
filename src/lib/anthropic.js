/**
 * AI client — uses Google Gemini (free tier, no credit card required)
 * 
 * Get your key at: https://aistudio.google.com/apikey
 * Free tier: 15 requests/min, 1M tokens/day on Gemini 2.0 Flash
 * 
 * DEMO MODE: If GEMINI_API_KEY is not set, returns mock responses for demonstration
 */

// Mock responses for demo mode
const DEMO_RESPONSES = {
  "story": `I lost a $40K contract last month.

Not because of price. Not because of quality.

Because I sent a proposal that was 15 pages long.

The prospect told me later — she stopped reading on page 2. By the time she picked it back up, she'd already signed with someone else.

Here's the thing nobody tells you about proposals. Nobody reads them. Not really.

They skim the first page. They flip to the price. They make a decision based on how confident you sound — not how thorough you are.

I replaced my 15-page template with a 1-page scope doc. Problem, approach, timeline, price. That's it.

Close rate went from 30% to 62% in three months.

The length of your proposal is inversely proportional to your confidence in what you're selling.

Shorter wins. Every time.`,

  "framework": `The framework that tripled my effective hourly rate in 6 months:

1. Track every hour for 2 weeks — all of them, not just billable
2. Calculate your real rate (total revenue divided by ALL hours worked)
3. Find the bottom 20% of tasks by effective rate
4. Eliminate, delegate, or reprice those tasks
5. Repeat quarterly

Most consultants are shocked when they run this exercise.

I was billing $200/hr but my effective rate was $47/hr. The gap was admin, scope creep, and underbidding.

That gap is where your profit is hiding.

The fix isn't working more hours. It's being ruthless about which hours you work.

Run the numbers this week. You'll never look at your calendar the same way.`,

  "hot-take": `Unpopular opinion — most consultants don't have a lead gen problem.

They have a positioning problem.

If you can't explain what you do in one sentence to your mom, you're not clear enough.

I spent two years trying every growth tactic. Webinars. Cold outreach. Referral programs. Content calendars.

None of it worked until I rewrote my positioning.

Old version — "I help companies optimize their operations."

New version — "I help B2B startups cut onboarding time in half."

Same skills. Same person. Completely different results.

Clarity is the ultimate growth hack. Everything else is noise.`,

  "listicle": `3 things I wish I knew before going solo:

Your first 3 clients will come from your last employer's network. Plan for that. Don't burn bridges on the way out — those bridges are your runway.

Pricing is a story, not a spreadsheet. The narrative around your rate matters more than the number. "I charge $10K for this engagement" hits different than "$150/hr."

You'll spend 40% of your time on non-billable work. Marketing, admin, invoicing, proposals. Build that into your rate from day one or you'll wonder why you're working harder and earning less.

The consultants who struggle aren't less talented.

They're less prepared for the business side.`,

  "question": `What's the one thing you changed in your consulting practice this year that had the biggest impact?

For me — I stopped sending proposals.

I send 1-page scope docs instead. Problem, approach, timeline, price.

Close rate went from 30% to 65%.

Simpler is almost always better. The more you add, the more reasons you give someone to say no.

What's yours?`,
};

export async function generateWithClaude({ system, prompt }) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // Demo mode: return mock response if API key is not available
  if (!apiKey || apiKey.includes("placeholder")) {
    console.log("🎭 DEMO MODE: Using mock response (real Gemini API key not configured)");
    
    // Detect request type from system prompt and return appropriate mock
    const sysLower = (system || "").toLowerCase();
    
    // ── Classification requests: return JSON array ──
    if (sysLower.includes("classify") && sysLower.includes("quality_score")) {
      // Count how many posts were sent by counting "--- POST" markers
      const postCount = (prompt.match(/--- POST \d+/g) || []).length || 1;
      const types = ["hook-driven-story", "framework", "hot-take", "listicle", "question"];
      const hooks = ["personal-anecdote", "contrarian-claim", "data-point", "promise-of-outcome", "question"];
      
      const classifications = Array.from({ length: postCount }, (_, i) => ({
        post_type: types[i % types.length],
        hook_style: hooks[i % hooks.length],
        // Spread scores across a realistic range so percentiles differentiate
        quality_score: Math.round(35 + Math.random() * 55), // 35-90 range
      }));
      
      return JSON.stringify(classifications);
    }
    
    // ── Voice profile requests: return JSON object ──
    if (sysLower.includes("voice profile") || sysLower.includes("style analyst")) {
      return JSON.stringify({
        summary: "Direct and story-driven. Favors short punchy sentences followed by one longer explanatory line. Opens with personal anecdotes or contrarian claims. Closes with a single actionable takeaway. Avoids jargon — prefers plain language even on complex B2B topics.",
        traits: ["Personal anecdote openers", "One-line paragraphs", "No hashtags", "Direct CTAs", "Em-dash usage"],
        sentence_patterns: "Mix of very short (3-6 word) punch lines and medium (15-20 word) explanatory sentences. Rarely exceeds 25 words.",
        vocabulary_level: "plain",
        tone: "Confident but conversational — like explaining to a smart friend over coffee",
        opening_patterns: ["Personal failure or surprise", "Contrarian claim", "Specific data point"],
        closing_patterns: ["Single actionable takeaway", "Reframe of opening hook"],
      });
    }
    
    // ── Generation requests: return canned post content ──
    let format = "story";
    if (prompt.toLowerCase().includes("framework") || prompt.toLowerCase().includes("how")) {
      format = "framework";
    } else if (prompt.toLowerCase().includes("take")) {
      format = "hot-take";
    } else if (prompt.toLowerCase().includes("list")) {
      format = "listicle";
    } else if (prompt.toLowerCase().includes("?")) {
      format = "question";
    }
    
    const demoResponse = DEMO_RESPONSES[format] || DEMO_RESPONSES["story"];
    return demoResponse;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 1200,
            temperature: 0.9,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Gemini API error:", data.error);
      throw new Error(`Gemini API error: ${data.error.message || "Unknown error"}`);
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Gemini API fetch error:", error);
    throw error;
  }
}