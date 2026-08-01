import { getCurrentDbUser } from "@/lib/auth";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";

import { getUserState } from "@/lib/userState";
import { getUserUsage } from "@/lib/usage";
import { Suspense } from "react";
import DashboardNotice from "@/components/DashboardNotice";

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
  let usageLimit = 5;
  let planName = "Starter";
  let trialEnd: string | null = null;
  let projectCount = 0;
  let hasSeenWelcome = true;

  try {
    const user = await prisma.user.findUnique({
      where: { supabaseId: userId },
      select: {
        stripePriceId: true,
        trialEndsAt: true,
        hasSeenWelcome: true,
        _count: {
          select: { projects: true },
        },
      },
    });

    if (user) {
      trialEnd = user.trialEndsAt ? user.trialEndsAt.toISOString() : null;
      projectCount = user._count.projects;
      hasSeenWelcome = user.hasSeenWelcome;

      // Determine plan name from price ID
      const priceId = user.stripePriceId;
      if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
        planName = "Pro";
      } else if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) {
        planName = "Growth";
      } else {
        planName = "Starter";
      }

      const usage = await getUserUsage(userId);
      usageCount = usage.usageCount;
      usageLimit = usage.usageLimit;
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
      hasSeenWelcome={hasSeenWelcome}
    >
      <Suspense><DashboardNotice /></Suspense>
      {children}
    </DashboardLayoutWrapper>
  );
}
