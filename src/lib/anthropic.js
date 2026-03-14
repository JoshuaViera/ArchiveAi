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
  "story": `Here's why most consultants underprice their services:

The biggest mistake I made early in my career was undervaluing my work. I thought more clients = more revenue. Wrong.

I was charging $50/hour while competitors charged $250+. Why? Imposter syndrome.

Here's what changed everything:

1. **Your expertise has a market rate** — Not every consultant is created equal. Your results, experience, and network have value.

2. **Hourly pricing kills relationships** — When you're paid per hour, clients want to minimize hours. Instead, structure deals around outcomes.

3. **Value pricing compounds** — One high-value client beats 10 low-value ones. Better margins, happier clients, sustainable business.

4. **Confidence is a feature** — Charging premium rates actually increases close rates. People respect what they pay for.

If you're undercharging, you're doing your clients a disservice. They're leaving money on the table. You're burning out. It's a lose-lose.

Start with a 50% increase. Test it. You'll be shocked at the response.

#Consulting #Strategy #Business`,

  "framework": `3 frameworks that transformed my consulting practice:

**1. The Discovery-to-Delivery Framework**
- Week 1: Deep dive audit (understand their real problem)
- Week 2-3: Strategy development (show them the path)
- Week 4+: Implementation support (make it real)

This moved me from hourly billing → outcome-based pricing. Game changer.

**2. The 90-Day Sprint**
- Month 1: Baseline & quick wins
- Month 2: Systemic improvements
- Month 3: Handoff & sustainability

Clients see results. You build a reputation. Everyone wins.

**3. The Authority Ladder**
- Free content (prove you know what you're talking about)
- Paid courses (build audience + passive income)
- High-ticket consulting (cherry-pick dream clients)

I started here and scaled to $100K clients.

Use these frameworks and watch your business evolve.

#Consulting #Business #Growth`,

  "hot-take": `Hot take: Most consultants are leaving 10x revenue on the table.

Not because they're bad at what they do. Because they're pricing like employees.

You wouldn't hire a surgeon for $100/hour. You'd trust their expertise and pay what they ask. Yet we consultants constantly negotiate down.

The irony? Clients respect what they pay for. Cheap consultants = cheap results (in their minds).

Raise your rates. Today. You'll close fewer deals. Your profit will triple.

That's not greed. That's business.

#Consulting #Mindset #Reality`,

  "listicle": `5 reasons you'll never reach 6 figures as a consultant:

1. **You're selling time, not transformation** — Break the hourly trap. Sell outcomes instead.

2. **You're saying yes to everything** — Wrong clients kill your brand. Be selective. Your niche is your moat.

3. **You're not building leverage** — 1:1 services cap your income. Add products, courses, or group programs.

4. **You're not visible enough** — LinkedIn is free marketing. Your ideal clients are scrolling right now. Show up.

5. **You're not surrounding yourself with growth** — Your network = your networth. Find people ahead of you. Learn. Scale.

Want to hit 6 figures? Fix these five. Everything else follows.

#Consulting #Revenue #Growth`,

  "question": `How would your consulting business change if you charged 3x as much?

Think about it:
- Fewer deals to close (less sales friction)
- Higher-quality clients (they self-select)
- Longer retention (skin in the game)
- Better margins (sustainable growth)

The only thing stopping you is the belief that you're not worth it.

Are you?

#Consulting #Pricing #Mindset`,
};

export async function generateWithClaude({ system, prompt }) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // Demo mode: return mock response if API key is not available
  if (!apiKey || apiKey.includes("placeholder")) {
    console.log("🎭 DEMO MODE: Using mock response (real Gemini API key not configured)");
    
    // Try to detect format from prompt and return relevant demo content
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
    
    // Add some variation by mixing in the prompt topic
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
      // Fall back to demo mode on API error
      return DEMO_RESPONSES["story"];
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Gemini API fetch error:", error);
    // Fall back to demo mode on network error
    return DEMO_RESPONSES["story"];
  }
}