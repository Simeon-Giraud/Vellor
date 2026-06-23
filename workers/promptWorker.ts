import { Worker, Job } from "bullmq";
import { connection, analysisQueue } from "@/lib/queue";
import { prisma } from "@/lib/prisma";
import { runPromptOnAllEngines } from "@/lib/ai";

interface PromptJobData {
  promptId: string;
  promptText: string;
  projectId: string;
  domain: string;
  competitors?: string[];
}

const promptWorker = new Worker<PromptJobData>(
  "prompt-runs",
  async (job: Job<PromptJobData>) => {
    const { promptId, promptText, projectId, domain, competitors = [] } = job.data;

    console.log(`[Worker] Running prompt ${promptId} for domain ${domain}`);

    try {
      const results = await runPromptOnAllEngines(promptText, domain, competitors);

      // Persist results to DB
      for (const result of results) {
        const promptResult = await prisma.promptResult.create({
          data: {
            promptId,
            engine: result.engine,
            response: result.snippet,
            brandMentioned: result.mentioned,
            mentionPosition: result.position,
          },
        });

        // Trigger competitor analysis if a competitor was mentioned
        // and its position is in the top 3 to save LLM costs
        const resultDomain = result.mentioned ? domain : null; // In real logic this could identify specific competitors
        // Since the current logic evaluates if *domain* or *brandName* is mentioned,
        // we'll simulate analyzing a generic competitor or if a specific competitor was detected.
        // For MVP, let's just queue analysis for all competitors passed in if the position is top 3.
        // Note: `runPromptOnAllEngines` currently only returns whether the main `domain` was mentioned.
        // Let's iterate over competitors to queue them if we are doing a competitor analysis.
        // To accurately detect WHICH competitor was mentioned, we'd need to update checkMention.
        // For now, let's queue an analysis for the first competitor if any were passed, 
        // just to demonstrate the flow.
        
        if (competitors && competitors.length > 0 && result.position && result.position <= 3) {
          // In a fully built out version, we would check which specific competitor ranked top 3.
          // For now, we take the top 3 ranked competitor (mocked as the first competitor here).
          const topCompetitor = competitors[0];
          
          await analysisQueue.add("analyze-competitor", {
            promptResultId: promptResult.id,
            competitorDomain: topCompetitor,
            promptText: promptText
          });
          
          console.log(`[Worker] Queued analysis for competitor ${topCompetitor} on result ${promptResult.id}`);
        }
      }

      // Update project lastRunAt
      if (projectId) {
        await prisma.project.update({
          where: { id: projectId },
          data: { lastRunAt: new Date() },
        });
      }

      console.log(`[Worker] Completed prompt ${promptId}, saved ${results.length} results`);
      return { promptId, resultsCount: results.length };
    } catch (err: any) {
      console.error(`[Worker] Job processing error for prompt ${promptId}:`, err);
      throw err; // Let BullMQ handle the failure state
    }
  },
  {
    connection,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000,
    }
  }
);

promptWorker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

promptWorker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

export default promptWorker;
