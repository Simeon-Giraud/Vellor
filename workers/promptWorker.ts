import { Worker, Job } from "bullmq";
import { connection } from "@/lib/queue";
import { prisma } from "@/lib/prisma";
import { runPromptOnAllEngines } from "@/lib/ai";

interface PromptJobData {
  promptId: string;
  promptText: string;
  domain: string;
}

const promptWorker = new Worker<PromptJobData>(
  "prompt-runs",
  async (job: Job<PromptJobData>) => {
    const { promptId, promptText, domain } = job.data;

    console.log(`[Worker] Running prompt ${promptId} for domain ${domain}`);

    const results = await runPromptOnAllEngines(promptText, domain);

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

    console.log(`[Worker] Completed prompt ${promptId}, saved ${results.length} results`);
    return { promptId, resultsCount: results.length };
  },
  {
    connection,
    concurrency: 5,
  }
);

promptWorker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

promptWorker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

export default promptWorker;
