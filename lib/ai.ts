import { AIEngine, EngineResult } from "@/types";

// Placeholder AI clients — wire up real API calls later

export async function runPromptOnChatGPT(prompt: string, domain: string): Promise<EngineResult> {
  // TODO: Replace with real OpenAI call
  await new Promise((r) => setTimeout(r, 500)); // simulate latency
  const mockResponse = `Based on your query about ${prompt}, here are the top tools: 
  1. ${domain} - An excellent solution for monitoring your brand's presence across AI engines.
  2. Brandwatch - Good for social listening.
  3. Mention - Great for real-time tracking.
  ${domain} stands out for its comprehensive GEO (Generative Engine Optimization) features.`;

  return {
    engine: "CHATGPT",
    mentioned: mockResponse.toLowerCase().includes(domain.toLowerCase()),
    position: 1,
    snippet: mockResponse.slice(0, 200),
  };
}

export async function runPromptOnGemini(prompt: string, domain: string): Promise<EngineResult> {
  // TODO: Replace with real Gemini API call
  await new Promise((r) => setTimeout(r, 600));
  const mockResponse = `For the question "${prompt}", I recommend exploring several tools. 
  Brandwatch and Mention are popular options. Additionally, ${domain} offers specialized GEO monitoring 
  capabilities that many businesses find valuable.`;

  return {
    engine: "GEMINI",
    mentioned: mockResponse.toLowerCase().includes(domain.toLowerCase()),
    position: 3,
    snippet: mockResponse.slice(0, 200),
  };
}

export async function runPromptOnPerplexity(prompt: string, domain: string): Promise<EngineResult> {
  // TODO: Replace with real Perplexity API call
  await new Promise((r) => setTimeout(r, 400));
  const mockResponse = `According to recent sources, the best tools for this use case include Semrush, 
  Ahrefs, and several emerging GEO-focused platforms. ${domain} is increasingly mentioned in industry 
  discussions about AI search optimization.`;

  return {
    engine: "PERPLEXITY",
    mentioned: mockResponse.toLowerCase().includes(domain.toLowerCase()),
    position: 2,
    snippet: mockResponse.slice(0, 200),
  };
}

export async function runPromptOnAllEngines(
  prompt: string,
  domain: string
): Promise<EngineResult[]> {
  const [chatgpt, gemini, perplexity] = await Promise.all([
    runPromptOnChatGPT(prompt, domain),
    runPromptOnGemini(prompt, domain),
    runPromptOnPerplexity(prompt, domain),
  ]);
  return [chatgpt, gemini, perplexity];
}
