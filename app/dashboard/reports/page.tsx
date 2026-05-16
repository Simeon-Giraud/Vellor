import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ReportsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { _count: { select: { projects: true } } },
    });
    if (!user || user._count.projects === 0) {
      redirect("/dashboard?notice=create-project-first");
    }
  } catch {
    redirect("/dashboard?notice=create-project-first");
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white tracking-tight mb-3">Reports</h1>
        <p className="text-[var(--color-fg-muted)] text-sm">Reports coming soon.</p>
      </div>
    </div>
  );
}
