import { getCurrentDbUser } from "@/lib/auth";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const dbUser = await getCurrentDbUser();
  const userId = dbUser?.supabaseId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = await req.json();

    const prefs = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: {
        emailAlerts: data.emailAlerts,
        weeklySummary: data.weeklySummary,
        mentionDropAlert: data.mentionDropAlert,
      },
      create: {
        userId: user.id,
        emailAlerts: data.emailAlerts,
        weeklySummary: data.weeklySummary,
        mentionDropAlert: data.mentionDropAlert,
      },
    });

    return NextResponse.json({ success: true, prefs });
  } catch (error) {
    console.error("[SETTINGS_PREFS_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
