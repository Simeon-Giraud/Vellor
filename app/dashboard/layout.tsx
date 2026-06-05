import { getCurrentDbUser } from "@/lib/auth";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TrialBanner from "@/components/TrialBanner";
import DemoBanner from "@/components/DemoBanner";
import { getUserState } from "@/lib/userState";

import DashboardLayoutWrapper from "@/components/DashboardLayoutWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dbUser = await getCurrentDbUser();
  const userId = dbUser?.supabaseId;
  if (!userId) redirect("/");

  const userState = await getUserState(userId);

  // Fetch user data for sidebar + trial banner
  let usageCount = 0;
  let usageLimit = 500;
  let planName = "Starter";
  let trialEnd: string | null = null;
  let projectCount = 0;

  try {
    const user = await prisma.user.findUnique({
      where: { supabaseId: userId },
      select: {
        subscriptionStatus: true,
        stripePriceId: true,
        trialEndsAt: true,
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    if (user) {
      trialEnd = user.trialEndsAt ? user.trialEndsAt.toISOString() : null;
      projectCount = user._count.projects;

      // Determine plan name from price ID
      const priceId = user.stripePriceId;
      if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
        planName = "Pro";
        usageLimit = 5000;
      } else if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) {
        planName = "Growth";
        usageLimit = 2000;
      } else {
        planName = "Starter";
        usageLimit = 500;
      }

      // Count this month's prompt results as usage
      const resultCount = await prisma.promptResult.count({
        where: {
          prompt: {
            project: {
              user: { supabaseId: userId },
            },
          },
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      });
      usageCount = resultCount;
    }
  } catch {
    // Database not connected — use defaults
  }

  return (
    <DashboardLayoutWrapper
      usageCount={usageCount}
      usageLimit={usageLimit}
      planName={planName}
      projectCount={projectCount}
      userState={userState}
      trialEnd={trialEnd}
    >
      {children}
    </DashboardLayoutWrapper>
  );
}
