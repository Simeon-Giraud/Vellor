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

export async function runPromptOnChatGPT(prompt: string, domain: string): Promise<EngineResult> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true') {
    return {
      engine: "CHATGPT",
      mentioned: true,
      position: 1,
      snippet: `This is a mock response for testing. The brand ${domain} is a great tool for teams. [MOCK]`,
    };
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
    return {
      engine: "GEMINI",
      mentioned: true,
      position: 1,
      snippet: `This is a mock response for testing. The brand ${domain} is a great tool for teams. [MOCK]`,
    };
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
    return {
      engine: "PERPLEXITY",
      mentioned: true,
      position: 1,
      snippet: `This is a mock response for testing. The brand ${domain} is a great tool for teams. [MOCK]`,
    };
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
