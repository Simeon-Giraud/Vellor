import { getCurrentDbUser } from "@/lib/auth";

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = { title: "Settings — Vellor" };

export default async function SettingsPage() {
  const dbUser = await getCurrentDbUser();
  const userId = dbUser?.supabaseId;
  if (!userId) redirect("/");



  // Fetch user data
  let planName = "Starter";
  let usageCount = 0;
  let usageLimit = 500;
  let subscriptionStatus: string | null = null;
  let hasStripeCustomer = false;
  let preferences = { emailAlerts: true, weeklySummary: true, mentionDropAlert: true };

  try {
    const user = await prisma.user.findUnique({
      where: { supabaseId: userId },
      select: {
        subscriptionStatus: true,
        stripePriceId: true,
        stripeCustomerId: true,
        preferences: {
          select: {
            emailAlerts: true,
            weeklySummary: true,
            mentionDropAlert: true,
          },
        },
      },
    });

    if (user) {
      subscriptionStatus = user.subscriptionStatus;
      hasStripeCustomer = !!user.stripeCustomerId;

      const priceId = user.stripePriceId;
      if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
        planName = "Pro";
        usageLimit = 5000;
      } else if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) {
        planName = "Growth";
        usageLimit = 2000;
      }

      if (user.preferences) {
        preferences = user.preferences;
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
    // DB not connected — use defaults
  }

  return (
    <SettingsClient
      profile={{
        name: dbUser?.fullName || "User",
        email: dbUser?.email || "",
        avatarUrl: dbUser?.avatarUrl || "",
      }}
      plan={{
        name: planName,
        usageCount,
        usageLimit,
        subscriptionStatus,
        hasStripeCustomer,
        isTrial: subscriptionStatus === "trialing",
      }}
      preferences={preferences}
    />
  );
}
