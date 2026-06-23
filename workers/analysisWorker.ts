import { Worker, Job } from "bullmq";
import { connection } from "@/lib/queue";
import { prisma } from "@/lib/prisma";
import * as cheerio from "cheerio";
import { openai } from "@/lib/ai/openai";

interface AnalysisJobData {
  promptResultId: string;
  competitorDomain: string;
  promptText: string;
}

const fetchWebsiteContent = async (domain: string): Promise<string> => {
  let url = domain;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${domain}`;
  }
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: AbortSignal.timeout(10000) // 10s timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Remove unnecessary tags
    $('script, style, nav, footer, iframe, noscript').remove();
    
    // Extract text and clean up whitespace
    let text = $('body').text();
    text = text.replace(/\s+/g, ' ').trim();
    
    return text.substring(0, 15000); // Limit to ~15k chars to fit in context window comfortably
  } catch (err: any) {
    console.error(`[Worker] Failed to fetch content from ${url}:`, err.message);
    throw err;
  }
};

const analyzeWithOpenAI = async (domain: string, prompt: string, websiteContent: string) => {
  const systemPrompt = `You are an AEO (AI Engine Optimization) expert. The competitor website '${domain}' was highly ranked by an AI for the prompt '${prompt}'.
  
Analyze WHY the AI preferred this site based on their website content. Then, provide 3 actionable steps my client can take to update their own site to beat this competitor.
Respond in JSON format with the following schema:
{
  "reasoning": "Detailed explanation of why the AI likely favored this content...",
  "actionableAdvice": "1. Step one\\n2. Step two\\n3. Step three"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Website content from ${domain}:\n\n${websiteContent}` }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      reasoning: result.reasoning || "Could not generate reasoning.",
      actionableAdvice: result.actionableAdvice || "Could not generate advice."
    };
  } catch (err) {
    console.error(`[Worker] Failed to analyze with OpenAI for ${domain}:`, err);
    throw err;
  }
};

const analysisWorker = new Worker<AnalysisJobData>(
  "analysis-runs",
  async (job: Job<AnalysisJobData>) => {
    const { promptResultId, competitorDomain, promptText } = job.data;
    
    console.log(`[Worker] Analyzing competitor ${competitorDomain} for prompt result ${promptResultId}`);
    
    try {
      // 1. Scrape the website
      let websiteContent = "Content unavailable.";
      try {
        websiteContent = await fetchWebsiteContent(competitorDomain);
      } catch (e) {
        console.warn(`[Worker] Skipping analysis for ${competitorDomain} due to fetch error.`);
        return { promptResultId, status: "skipped", reason: "fetch_failed" };
      }
      
      // 2. Analyze with OpenAI
      let reasoning = "";
      let actionableAdvice = "";
      
      if (process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true') {
         // Mock analysis for testing
         reasoning = `The website ${competitorDomain} has excellent keyword density and clear structure targeting the prompt.`;
         actionableAdvice = `1. Add more comprehensive FAQ sections.\n2. Optimize your H1 tags.\n3. Increase backlink profile.`;
      } else {
         const analysis = await analyzeWithOpenAI(competitorDomain, promptText, websiteContent);
         reasoning = analysis.reasoning;
         actionableAdvice = analysis.actionableAdvice;
      }
      
      // 3. Save to database
      await prisma.competitorAnalysis.create({
        data: {
          promptResultId,
          competitorDomain,
          reasoning,
          actionableAdvice
        }
      });
      
      console.log(`[Worker] Completed analysis for ${competitorDomain}`);
      return { promptResultId, status: "completed" };
    } catch (err: any) {
      console.error(`[Worker] Job processing error for analysis ${promptResultId}:`, err);
      throw err;
    }
  },
  {
    connection,
    concurrency: 2, // Limit concurrency to avoid IP bans when scraping
    limiter: {
      max: 5,
      duration: 1000,
    }
  }
);

analysisWorker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} (analysis) completed`);
});

analysisWorker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} (analysis) failed:`, err.message);
});

export default analysisWorker;
