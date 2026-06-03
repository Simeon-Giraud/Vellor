import { AIEngine, EngineResult } from "@/types";
import { runOpenAI } from "./ai/openai";
import { runGemini } from "./ai/gemini";
import { runPerplexity } from "./ai/perplexity";
import { generateDemoResults } from "./ai/demoData";
import { UserState } from "./userState";

function checkMention(response: string, domain: string) {
  const brandName = domain.split('.')[0].toLowerCase();
  const domainLower = domain.toLowerCase();
  const resLower = response.toLowerCase();
  return resLower.includes(domainLower) || resLower.includes(brandName);
}

function evaluateMentionPosition(response: string, domain: string) {
  const normalizedResponse = response.toLowerCase();
  const normalizedDomain = domain.toLowerCase();
  const domainName = normalizedDomain.split('.')[0];
  
  const brandMentioned = normalizedResponse.includes(normalizedDomain) || normalizedResponse.includes(domainName);
  
  let mentionPosition = null;
  if (brandMentioned) {
    const lines = response.split('\n');
    let rankCounter = 0;
    
    for (const line of lines) {
      if (/^\s*(\d+\.|-|\*)\s/.test(line)) {
        rankCounter++;
      }
      
      if (line.toLowerCase().includes(normalizedDomain) || line.toLowerCase().includes(domainName)) {
        mentionPosition = rankCounter > 0 ? rankCounter : 1;
        break;
      }
    }
    
    if (!mentionPosition) mentionPosition = 1;
  }
  
  return { brandMentioned, mentionPosition };
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

export async function runPromptOnChatGPT(prompt: string, domain: string, competitors: string[] = []): Promise<EngineResult> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true') {
    return getMockMetrics("CHATGPT", domain, prompt);
  }
  
  let instructionalPrompt = `${prompt}\n\nPlease provide a ranked, numbered list of the top recommendations.`;
  if (competitors && competitors.length > 0) {
     instructionalPrompt += ` Consider mentioning these alternatives if relevant: ${competitors.join(", ")}.`;
  }

  return withTimeout(runOpenAI(instructionalPrompt).then(res => {
    const { brandMentioned, mentionPosition } = evaluateMentionPosition(res, domain);
    return {
      engine: "CHATGPT",
      mentioned: brandMentioned,
      position: mentionPosition,
      snippet: res,
    };
  }));
}

export async function runPromptOnGemini(prompt: string, domain: string, competitors: string[] = []): Promise<EngineResult> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true') {
    return getMockMetrics("GEMINI", domain, prompt);
  }
  
  let instructionalPrompt = `${prompt}\n\nPlease provide a ranked, numbered list of the top recommendations.`;
  if (competitors && competitors.length > 0) {
     instructionalPrompt += ` Consider mentioning these alternatives if relevant: ${competitors.join(", ")}.`;
  }

  return withTimeout(runGemini(instructionalPrompt).then(res => {
    const { brandMentioned, mentionPosition } = evaluateMentionPosition(res, domain);
    return {
      engine: "GEMINI",
      mentioned: brandMentioned,
      position: mentionPosition,
      snippet: res,
    };
  }));
}

export async function runPromptOnPerplexity(prompt: string, domain: string, competitors: string[] = []): Promise<EngineResult> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true') {
    return getMockMetrics("PERPLEXITY", domain, prompt);
  }
  
  let instructionalPrompt = `${prompt}\n\nPlease provide a ranked, numbered list of the top recommendations.`;
  if (competitors && competitors.length > 0) {
     instructionalPrompt += ` Consider mentioning these alternatives if relevant: ${competitors.join(", ")}.`;
  }

  return withTimeout(runPerplexity(instructionalPrompt).then(res => {
    const { brandMentioned, mentionPosition } = evaluateMentionPosition(res, domain);
    return {
      engine: "PERPLEXITY",
      mentioned: brandMentioned,
      position: mentionPosition,
      snippet: res,
    };
  }));
}

export async function runPromptOnAllEngines(
  prompt: string,
  domain: string,
  competitors: string[] = [],
  userState: UserState = 'active'
): Promise<EngineResult[]> {
  if (userState === 'demo') {
    return generateDemoResults(prompt, domain);
  }

  const results = await Promise.allSettled([
    runPromptOnChatGPT(prompt, domain, competitors),
    runPromptOnGemini(prompt, domain, competitors),
    runPromptOnPerplexity(prompt, domain, competitors),
  ]);

  const validResults: EngineResult[] = [];
  
  // To match engines to results from Promise.allSettled
  const engines: ("CHATGPT" | "GEMINI" | "PERPLEXITY")[] = ["CHATGPT", "GEMINI", "PERPLEXITY"];
  
  for (const [index, result] of results.entries()) {
    if (result.status === "fulfilled") {
      validResults.push(result.value);
    } else {
      console.error(`[runPromptOnAllEngines] ${engines[index]} failed:`, result.reason);
      validResults.push({
        engine: engines[index],
        snippet: `Error: Could not retrieve response from ${engines[index]}.`,
        mentioned: false,
        position: null
      });
    }
  }

  return validResults;
}
