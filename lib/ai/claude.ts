import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY || "";
const anthropic = new Anthropic({ apiKey });

export interface GeoRewrite {
  originalText: string;
  suggestedText: string;
  reasoning: string;
}

export async function generateRewrites(url: string, textContent: string, geoScore: any): Promise<GeoRewrite[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === "true" || !apiKey) {
    return [
      {
        originalText: "Welcome to our product. We offer a CRM.",
        suggestedText: "Our CRM solution increases sales efficiency by 40% (Source: 2025 Study). What is the best CRM? Ours provides direct answers to your data needs.",
        reasoning: "Added a direct answer, improved fact density, and incorporated Q&A structure."
      }
    ];
  }

  const prompt = `You are a Generative Engine Optimization (GEO) expert. The following web page content was scored for GEO factors.
URL: ${url}
Current GEO Scores:
${JSON.stringify(geoScore, null, 2)}

Content:
${textContent.substring(0, 10000)}

Provide 3 specific line-level or paragraph-level rewrite suggestions to improve the content's visibility in AI search engines like ChatGPT, Gemini, and Perplexity.
Focus on fixing the factors that scored false (e.g. adding direct answers, improving fact density, adding Q&A structure).

Return ONLY a JSON array of objects with the following format, no other text or markdown blocks:
[
  {
    "originalText": "exact snippet from the original content to replace",
    "suggestedText": "the new rewritten text optimized for AI engines",
    "reasoning": "brief explanation of why this improves the GEO score"
  }
]`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1500,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        }
      ]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const match = responseText.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array found");
    const rewrites = JSON.parse(match[0]);
    return rewrites as GeoRewrite[];
  } catch (error) {
    console.error("Claude rewrite error:", error);
    return [];
  }
}

export async function analyzeSentiment(brandName: string, textContent: string): Promise<{ score: number; label: string; note: string | null }> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === "true" || !apiKey) {
    return {
      score: 0.8,
      label: "positive",
      note: null
    };
  }

  const prompt = `You are a sentiment analysis agent. Analyze the sentiment of references to the brand "${brandName}" in the following AI response text.
  
Response Text:
${textContent.substring(0, 10000)}

Grade the sentiment of "${brandName}" on a scale from -1.0 (highly negative/critical) to 1.0 (highly positive/recommending).
Provide a label: "positive", "neutral", or "negative".
If there are caveats (e.g. "but it's expensive", "lacks features"), summarize them in a brief note (max 15 words). Otherwise set note to null.

Return ONLY a JSON object with this format, do not include markdown or other text:
{
  "score": 0.85,
  "label": "positive",
  "note": null
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 300,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: prompt,
        }
      ]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const match = responseText.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found");
    const sentiment = JSON.parse(match[0]);
    return {
      score: typeof sentiment.score === "number" ? sentiment.score : 0,
      label: sentiment.label || "neutral",
      note: sentiment.note || null
    };
  } catch (error) {
    console.error("Claude sentiment grading error:", error);
    return {
      score: 0,
      label: "neutral",
      note: "Failed to grade sentiment."
    };
  }
}
