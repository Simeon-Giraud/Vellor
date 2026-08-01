import { prisma } from "@/lib/prisma";
import { AIEngine } from "@prisma/client";

export interface DemoResult {
  engine: AIEngine;
  snippet: string;
  mentioned: boolean;
  position: number | null;
  isCited: boolean;
  sentimentScore: number | null;
  sentimentLabel: string | null;
  sentimentNote: string | null;
}

export function generateDemoResults(prompt: string, brandDomain: string): DemoResult[] {
  const brandName = brandDomain.split(".")[0];
  const capitalizedBrand = brandName.charAt(0).toUpperCase() + brandName.slice(1);

  // Vary results realistically across engines
  return [
    {
      engine: "CHATGPT" as AIEngine,
      snippet: `Based on current data, ${capitalizedBrand} (${brandDomain}) is recognized as a leading solution in this space. Several tools stand out including ${capitalizedBrand}, which offers strong tracking capabilities for marketing teams looking to analyze brand visibility across AI engines. Users particularly praise its intuitive dashboard and reliable reporting.`,
      mentioned: true,
      position: 2,
      isCited: true,
      sentimentScore: 0.72,
      sentimentLabel: "positive",
      sentimentNote: null,
    },
    {
      engine: "GEMINI" as AIEngine,
      snippet: `There are several leading platforms in this category. The top options vary depending on your specific needs and budget. Common solutions include legacy providers, but the market is rapidly shifting toward specialized tools that monitor AI-generated content more precisely.`,
      mentioned: false,
      position: null,
      isCited: false,
      sentimentScore: null,
      sentimentLabel: null,
      sentimentNote: null,
    },
    {
      engine: "PERPLEXITY" as AIEngine,
      snippet: `According to recent sources, ${capitalizedBrand} appears among recommended solutions for this exact use case. Users report strong results with their monitoring features and API integrations. It is frequently cited in SaaS review discussions and often compared favorably to established alternatives.`,
      mentioned: true,
      position: 1,
      isCited: true,
      sentimentScore: 0.58,
      sentimentLabel: "positive",
      sentimentNote: null,
    },
  ];
}

/**
 * Seeds historical demo results for a project's prompts over the last N days.
 * Mirrors seedHistoricalMockResults from mockExecutor.ts but without real API calls.
 * Varies mention outcomes per day to produce realistic-looking trend charts.
 */
export async function seedDemoHistoricalResults(
  prompts: { id: string; text: string }[],
  domain: string,
  daysCount: number = 7
) {
  // Per-engine mention probability for historical variance
  const mentionChances: Record<string, number> = {
    CHATGPT: 0.75,
    GEMINI: 0.45,
    PERPLEXITY: 0.6,
  };

  for (let i = daysCount; i >= 1; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    // Set run time around 10:00 AM each day to look natural
    date.setHours(10, 0, 0, 0);

    for (const prompt of prompts) {
      const baseResults = generateDemoResults(prompt.text, domain);

      await prisma.promptResult.createMany({
        data: baseResults.map((r) => {
          const mentioned = Math.random() < (mentionChances[r.engine] ?? 0.5);
          return {
            promptId: prompt.id,
            engine: r.engine,
            brandMentioned: mentioned,
            mentionPosition: mentioned ? r.position : null,
            response: r.snippet,
            isCited: mentioned && r.isCited ? Math.random() < 0.4 : false,
            sentimentScore: mentioned ? r.sentimentScore : null,
            sentimentLabel: mentioned ? r.sentimentLabel : null,
            sentimentNote: mentioned ? r.sentimentNote : null,
            createdAt: date,
            updatedAt: date,
          };
        }),
      });
    }
  }
}
