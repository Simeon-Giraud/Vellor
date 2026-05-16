import { Worker, Job } from "bullmq";
import { connection, promptQueue } from "@/lib/queue";
import { prisma } from "@/lib/prisma";
import { generatePrompts } from "@/lib/ai/generatePrompts";

interface GenerateJobData {
  projectId: string;
  domain: string;
  brandName: string;
  industry: string;
  userId: string;
}

const generateWorker = new Worker<GenerateJobData>(
  "generate-prompts",
  async (job: Job<GenerateJobData>) => {
    const { projectId, domain, brandName, industry, userId } = job.data;

    console.log(`[Worker] Generating prompts for project ${projectId}`);

    try {
      const generatedTexts = await generatePrompts(domain, brandName, industry);

      // Save each prompt
      const prompts = await Promise.all(
        generatedTexts.map(async (text) => {
          return prisma.prompt.create({
            data: {
              projectId,
              text,
            },
          });
        })
      );

      // Queue the run for each prompt
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { competitors: true }
      });
      const competitors = project?.competitors || [];

      for (const prompt of prompts) {
        await promptQueue.add("run-prompt", {
          promptId: prompt.id,
          promptText: prompt.text,
          projectId,
          domain,
          competitors,
        });
      }

      // Update project status to active
      await prisma.project.update({
        where: { id: projectId },
        data: { status: "active" },
      });

      console.log(`[Worker] Completed generation for project ${projectId}, queued ${prompts.length} runs`);
      return { projectId, promptsCount: prompts.length };
    } catch (err: any) {
      console.error(`[Worker] Error generating prompts for project ${projectId}:`, err);
      await prisma.project.update({
        where: { id: projectId },
        data: { status: "error" },
      });
      throw err;
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

generateWorker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} (generate) completed`);
});

generateWorker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} (generate) failed:`, err.message);
});

export default generateWorker;
