import { getCurrentDbUser } from "@/lib/auth";

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";
import { getUserState } from "@/lib/userState";
import { getUserUsage } from "@/lib/usage";

export const metadata: Metadata = { title: "Settings — Vellor" };

export default async function SettingsPage() {
  const dbUser = await getCurrentDbUser();
  const userId = dbUser?.supabaseId;
  if (!userId) redirect("/");

  const userState = await getUserState(userId);

  // Fetch user data
  let planName = "Starter";
  let usageCount = 0;
  let usageLimit = 5;
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
      } else if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) {
        planName = "Growth";
      }

      if (user.preferences) {
        preferences = user.preferences;
      }

      const usage = await getUserUsage(userId);
      usageCount = usage.usageCount;
      usageLimit = usage.usageLimit;
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
        userState,
      }}
      preferences={preferences}
    />
  );
}
