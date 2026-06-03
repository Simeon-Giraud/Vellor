import { Worker, Job } from "bullmq";
import { connection } from "@/lib/queue";
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
        await prisma.promptResult.create({
          data: {
            promptId,
            engine: result.engine,
            response: result.snippet,
            brandMentioned: result.mentioned,
            mentionPosition: result.position,
          },
        });
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
