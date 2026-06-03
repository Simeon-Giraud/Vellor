import { getCurrentDbUser } from "@/lib/auth";

import { redirect } from "next/navigation";
import { getUserPlan } from "@/lib/usage";
import NewProjectClient from "./NewProjectClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Project — Vellor",
};

export default async function NewProjectPage() {
  const dbUser = await getCurrentDbUser();
  const userId = dbUser?.supabaseId;
  if (!userId) redirect("/");

  const plan = await getUserPlan(userId);

  return <NewProjectClient plan={{ name: plan.name, maxCompetitors: plan.maxCompetitors, maxPromptsPerProject: plan.maxPromptsPerProject }} />;
}
