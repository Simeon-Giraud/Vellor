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
