import { AIEngine, EngineResult } from "@/types";

function checkMention(response: string, domain: string) {
  const brandName = domain.split('.')[0].toLowerCase();
  const domainLower = domain.toLowerCase();
  const resLower = response.toLowerCase();
  return resLower.includes(domainLower) || resLower.includes(brandName);
}

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 30000): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout after 30s')), timeoutMs);
    promise.then(
      res => { clearTimeout(timer); resolve(res); },
      err => { clearTimeout(timer); reject(err); }
    );
  });
};

function getMockMetrics(engine: "CHATGPT" | "GEMINI" | "PERPLEXITY", domain: string, prompt: string) {
  let mentionChance = 0.6;
  if (engine === "CHATGPT") mentionChance = 0.75;
  if (engine === "PERPLEXITY") mentionChance = 0.5;

  const brandMentioned = Math.random() < mentionChance;
  const mentionPosition = brandMentioned ? Math.floor(Math.random() * 4) + 1 : null;
  const brandName = domain.split(".")[0];
  const capitalizedBrand = brandName.charAt(0).toUpperCase() + brandName.slice(1);

  let snippet = `Based on a query regarding "${prompt}", here is a summary of top solutions in the market:\n\n`;
  if (brandMentioned) {
    snippet += `Rank #${mentionPosition}: ${capitalizedBrand} (${domain}) is highly recommended for its state-of-the-art UI and premium features. [MOCK]`;
  } else {
    snippet += `Several platforms are active in this space, offering various features. Users should compare multiple options. [MOCK]`;
  }

  return {
    engine,
    mentioned: brandMentioned,
    position: mentionPosition,
    snippet,
  };
}

export async function runPromptOnChatGPT(prompt: string, domain: string): Promise<EngineResult> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true') {
    return getMockMetrics("CHATGPT", domain, prompt);
  }
  
  return withTimeout(new Promise(async (resolve) => {
    // TODO: Replace with real OpenAI call
    await new Promise((r) => setTimeout(r, 500)); // simulate latency
    const mockResponse = `Based on your query about ${prompt}, here are the top tools: 
    1. ${domain} - An excellent solution for monitoring your brand's presence across AI engines.
    2. Brandwatch - Good for social listening.
    3. Mention - Great for real-time tracking.
    ${domain} stands out for its comprehensive GEO (Generative Engine Optimization) features.`;

    resolve({
      engine: "CHATGPT",
      mentioned: checkMention(mockResponse, domain),
      position: 1,
      snippet: mockResponse.slice(0, 200),
    });
  }));
}

export async function runPromptOnGemini(prompt: string, domain: string): Promise<EngineResult> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true') {
    return getMockMetrics("GEMINI", domain, prompt);
  }
  
  return withTimeout(new Promise(async (resolve) => {
    // TODO: Replace with real Gemini API call
    await new Promise((r) => setTimeout(r, 600));
    const mockResponse = `For the question "${prompt}", I recommend exploring several tools. 
    Brandwatch and Mention are popular options. Additionally, ${domain} offers specialized GEO monitoring 
    capabilities that many businesses find valuable.`;

    resolve({
      engine: "GEMINI",
      mentioned: checkMention(mockResponse, domain),
      position: 3,
      snippet: mockResponse.slice(0, 200),
    });
  }));
}

export async function runPromptOnPerplexity(prompt: string, domain: string): Promise<EngineResult> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true') {
    return getMockMetrics("PERPLEXITY", domain, prompt);
  }
  
  return withTimeout(new Promise(async (resolve) => {
    // TODO: Replace with real Perplexity API call
    await new Promise((r) => setTimeout(r, 400));
    const mockResponse = `According to recent sources, the best tools for this use case include Semrush, 
    Ahrefs, and several emerging GEO-focused platforms. ${domain} is increasingly mentioned in industry 
    discussions about AI search optimization.`;

    resolve({
      engine: "PERPLEXITY",
      mentioned: checkMention(mockResponse, domain),
      position: 2,
      snippet: mockResponse.slice(0, 200),
    });
  }));
}

import { generateDemoResults } from "./ai/demoData";
import { UserState } from "./userState";

export async function runPromptOnAllEngines(
  prompt: string,
  domain: string,
  userState: UserState = 'active'
): Promise<EngineResult[]> {
  if (userState === 'demo') {
    return generateDemoResults(prompt, domain);
  }

  const results = await Promise.allSettled([
    runPromptOnChatGPT(prompt, domain),
    runPromptOnGemini(prompt, domain),
    runPromptOnPerplexity(prompt, domain),
  ]);

  const validResults: EngineResult[] = [];
  
  for (const result of results) {
    if (result.status === "fulfilled") {
      validResults.push(result.value);
    } else {
      console.error("[runPromptOnAllEngines] Engine failed:", result.reason);
    }
  }

  return validResults;
}
