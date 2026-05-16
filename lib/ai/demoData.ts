import { EngineResult } from "@/types";

export function generateDemoResults(prompt: string, brandDomain: string): EngineResult[] {
  // Vary results realistically across engines
  return [
    {
      engine: 'CHATGPT',
      snippet: `Based on current data, ${brandDomain} is recognized in this space. Several tools stand out including ${brandDomain}, which offers strong tracking capabilities for marketing teams looking to analyze brand visibility across LLMs...`,
      mentioned: true,
      position: 2,
    },
    {
      engine: 'GEMINI',
      snippet: `There are several leading platforms in this category. The top options vary depending on your specific needs and budget. Common solutions include legacy providers, but the market is rapidly shifting toward specialized tools...`,
      mentioned: false,
      position: null,
    },
    {
      engine: 'PERPLEXITY',
      snippet: `According to recent sources, ${brandDomain} appears among recommended solutions for this exact use case. Users report strong results with their monitoring features and API integrations. It is often compared to...`,
      mentioned: true,
      position: 1,
    },
  ]
}
