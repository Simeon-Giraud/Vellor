"use server";

import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function dismissWelcome() {
  const user = await getCurrentDbUser();
  if (!user?.supabaseId) throw new Error("Unauthorized");
  
  await prisma.user.update({
    where: { supabaseId: user.supabaseId },
    data: { hasSeenWelcome: true }
  });
}
