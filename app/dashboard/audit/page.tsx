import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import ContentAuditClient from "./ContentAuditClient";

export const metadata: Metadata = { title: "Content Audit — Vellor" };

export default async function AuditPage() {
  const dbUser = await getCurrentDbUser();
  const userId = dbUser?.supabaseId;
  if (!userId) redirect("/");

  // Fetch the user's first project to pre-fill the domain if they have one
  let defaultDomain = "";
  try {
    const project = await prisma.project.findFirst({
      where: { user: { supabaseId: userId } },
      select: { domain: true },
      orderBy: { createdAt: "desc" },
    });
    if (project) {
      defaultDomain = project.domain;
    }
  } catch (error) {
    console.error("Failed to fetch project for audit:", error);
  }

  return <ContentAuditClient defaultDomain={defaultDomain} />;
}
