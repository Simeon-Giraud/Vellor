import { Worker, Job } from "bullmq";
import { connection } from "@/lib/queue";
import { prisma } from "@/lib/prisma";
import { sendTrialExpiryEmail, sendWeeklyDigestEmail } from "@/lib/email";
import { getUserPlan } from "@/lib/usage";


const worker = new Worker(
  "cron-jobs",
  async (job: Job) => {
    console.log(`[CronWorker] Processing job ${job.id} of type ${job.name}`);

    if (job.name === "daily-checks") {
      await processTrialExpiries();
      await processScheduledPromptRuns();
      
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
    },
    include: {
      preferences: true,
    }
  });
  
  const now = new Date();
  
  for (const user of users) {
    if (!user.trialEndsAt) continue;
    
    // Respect email alert preference
    if (user.preferences && !user.preferences.emailAlerts) {
      console.log(`[CronWorker] Skipping trial expiry email for ${user.email} (disabled in preferences)`);
      continue;
    }
    
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
      user: {
        include: {
          preferences: true,
        }
      },
      prompts: {
        include: { results: { take: 1, orderBy: { createdAt: "desc" } } }
      }
    }
  });

  for (const project of projects) {
    if (!project.user.email) continue;
    
    // Respect weekly summary preference
    const preferences = project.user.preferences;
    if (preferences && !preferences.weeklySummary) {
      console.log(`[CronWorker] Skipping weekly digest email for ${project.user.email} (disabled in preferences)`);
      continue;
    }
    
    const summaryHtml = `<p>Your project has ${project.prompts.length} tracked prompts.</p>`;
    const projectName = project.brandName || project.domain;
    await sendWeeklyDigestEmail(project.user.email, projectName, summaryHtml);
  }
}

async function processScheduledPromptRuns() {
  console.log("[CronWorker] Starting scheduled prompt runs check...");
  
  try {
    const projects = await prisma.project.findMany({
      include: {
        user: true,
        prompts: {
          select: { id: true, text: true }
        }
      }
    });

    const now = new Date();

    for (const project of projects) {
      const user = project.user;
      if (!user) continue;

      const plan = await getUserPlan(user.supabaseId);
      const runIntervalDays = plan.runIntervalDays;

      const lastRun = project.lastRunAt;
      let shouldRun = false;

      if (!lastRun) {
        shouldRun = true;
      } else {
        const timeDiff = now.getTime() - lastRun.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        if (daysDiff >= runIntervalDays) {
          shouldRun = true;
        }
      }

      if (shouldRun) {
        console.log(`[CronWorker] Project ${project.id} is due for a scheduled run. Last run: ${lastRun}. Plan interval: ${runIntervalDays} days.`);
        
        const userState = user.subscriptionStatus || "demo";
        const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_AI === "true" || userState === "demo";

        // Create the ProjectRun record for the scheduled run
        await prisma.projectRun.create({
          data: {
            projectId: project.id,
            runType: "scheduled",
          },
        });

        if (isMockMode) {
          console.log(`[CronWorker] Running mock results for project ${project.id}`);
          const { executeAndSaveMockResults } = await import("@/lib/ai/mockExecutor");
          for (const prompt of project.prompts) {
            await executeAndSaveMockResults(
              prompt.id,
              prompt.text,
              project.domain,
              project.competitors
            );
          }
          await prisma.project.update({
            where: { id: project.id },
            data: { lastRunAt: new Date() },
          });
        } else {
          console.log(`[CronWorker] Queueing real prompt runs for project ${project.id}`);
          try {
            const { promptQueue } = await import("@/lib/queue");
            for (const prompt of project.prompts) {
              await promptQueue.add("run-prompt", {
                promptId: prompt.id,
                promptText: prompt.text,
                projectId: project.id,
                domain: project.domain,
                competitors: project.competitors,
              });
            }
          } catch (queueErr) {
            console.error(`[CronWorker] Failed to queue jobs for project ${project.id}:`, queueErr);
          }
        }
      }
    }
  } catch (err) {
    console.error("[CronWorker] Error in processScheduledPromptRuns:", err);
  }
}


worker.on("completed", (job) => {
  console.log(`[CronWorker] Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`[CronWorker] Job ${job?.id} failed with error:`, err);
});

export default worker;
