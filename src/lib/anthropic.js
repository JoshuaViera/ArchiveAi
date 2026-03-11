/**
 * AI client — uses Google Gemini (free tier, no credit card required)
 * 
 * Get your key at: https://aistudio.google.com/apikey
 * Free tier: 15 requests/min, 1M tokens/day on Gemini 2.0 Flash
 */

export async function generateWithClaude({ system, prompt }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

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
    return "";
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}