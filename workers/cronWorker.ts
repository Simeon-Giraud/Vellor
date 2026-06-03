import { Worker, Job } from "bullmq";
import { connection } from "@/lib/queue";
import { prisma } from "@/lib/prisma";
import { sendTrialExpiryEmail, sendWeeklyDigestEmail } from "@/lib/email";

const worker = new Worker(
  "cron-jobs",
  async (job: Job) => {
    console.log(`[CronWorker] Processing job ${job.id} of type ${job.name}`);

    if (job.name === "daily-checks") {
      await processTrialExpiries();
      
      // If today is Monday, send weekly digests
      const today = new Date();
      if (today.getDay() === 1) { // 1 = Monday
        await processWeeklyDigests();
      }
    }
  },
  { connection }
);

async function processTrialExpiries() {
  const users = await prisma.user.findMany({
    where: {
      stripeSubscriptionId: { not: null },
    }
  });
  
  const now = new Date();
  
  for (const user of users) {
    if (!user.trialEndsAt) continue;
    
    const timeDiff = user.trialEndsAt.getTime() - now.getTime();
    const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysUntilExpiry === 3 || daysUntilExpiry === 1) {
       if (user.email) {
         await sendTrialExpiryEmail(user.email, daysUntilExpiry);
       }
    }
  }
}

async function processWeeklyDigests() {
  const projects = await prisma.project.findMany({
    include: {
      user: true,
      prompts: {
        include: { results: { take: 1, orderBy: { createdAt: "desc" } } }
      }
    }
  });

  for (const project of projects) {
    if (!project.user.email) continue;
    
    const summaryHtml = `<p>Your project has ${project.prompts.length} tracked prompts.</p>`;
    const projectName = project.brandName || project.domain;
    await sendWeeklyDigestEmail(project.user.email, projectName, summaryHtml);
  }
}

worker.on("completed", (job) => {
  console.log(`[CronWorker] Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`[CronWorker] Job ${job?.id} failed with error:`, err);
});

export default worker;
