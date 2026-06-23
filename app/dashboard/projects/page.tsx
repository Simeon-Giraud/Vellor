import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";

const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

function getRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function ProjectsPage() {
  const dbUser = await getCurrentDbUser();
  const userId = dbUser?.supabaseId;
  if (!userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { supabaseId: userId },
    select: { id: true, stripePriceId: true, subscriptionStatus: true },
  });

  if (!user) redirect("/dashboard");

  let plan: typeof PLANS[keyof typeof PLANS] = PLANS.starter;
  if (user.subscriptionStatus !== "inactive") {
    if (user.stripePriceId === process.env.STRIPE_PRO_PRICE_ID) plan = PLANS.pro;
    else if (user.stripePriceId === process.env.STRIPE_GROWTH_PRICE_ID) plan = PLANS.growth;
  }
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - plan.dataHistoryDays);

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: {
      prompts: {
        include: {
          results: {
            where: { createdAt: { gte: cutoff } },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex-1">
      {/* Header */}
      <header
        className="sticky top-0 z-20 px-6 md:px-8 py-4 flex items-center justify-between backdrop-blur-xl border-b"
        style={{ background: "var(--color-header-bg)", borderColor: "var(--color-header-border)" }}
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--color-fg)" }}>Projects</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-fg-muted)" }}>
            Manage your brand monitoring projects
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-[transform,background-color] duration-[160ms] ease-out active:scale-[0.97] cursor-pointer"
          style={{ background: "var(--color-btn-primary-bg)", color: "var(--color-btn-primary-text)" }}
        >
          <IconPlus /> New project
        </Link>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="dash-card overflow-hidden animate-fade-in-up">
          {projects.length === 0 ? (
            <div className="p-20 text-center">
              <div
                className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "var(--color-surface-3)", color: "var(--color-fg-muted)" }}
              >
                <IconPlus />
              </div>
              <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--color-fg)" }}>No projects found</h2>
              <p className="text-sm mb-6" style={{ color: "var(--color-fg-muted)" }}>
                Create your first project to start tracking visibility.
              </p>
              <Link
                href="/dashboard/projects/new"
                className="inline-flex px-6 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
                style={{ background: "var(--color-btn-primary-bg)", color: "var(--color-btn-primary-text)" }}
              >
                Create Project
              </Link>
            </div>
          ) : (
            <div>
              {projects.map((project) => {
                const allResults = project.prompts.flatMap(p => p.results);
                const mentioned = allResults.filter(r => r.brandMentioned).length;
                const rate = allResults.length > 0 ? Math.round((mentioned / allResults.length) * 1000) / 10 : 0;
                const lastResult = allResults.sort((a, b) =>
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )[0];

                return (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-center gap-4 px-6 py-5 border-b last:border-b-0 transition-[background-color] duration-[160ms] group cursor-pointer hover:bg-[var(--color-sidebar-hover-bg)]"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    {/* Status dot */}
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${project.status === "generating" ? "pulse-dot-yellow" : "pulse-dot-green"}`}
                      style={{ background: project.status === "generating" ? "#f59e0b" : "#10b981" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold tracking-tight truncate" style={{ color: "var(--color-fg)" }}>
                        {project.domain}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>
                        {project.brandName} · {project.industry} · {project.competitors.length} competitors
                        {lastResult ? ` · ${getRelativeTime(lastResult.createdAt)}` : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {project.status === "generating" ? (
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          <span className="text-xs font-medium" style={{ color: "var(--color-fg-muted)" }}>Setting up…</span>
                        </div>
                      ) : (
                        <>
                          <p
                            className="text-xl font-bold font-mono"
                            style={{ color: rate >= 70 ? "#10b981" : rate >= 40 ? "#f59e0b" : "#ef4444" }}
                          >
                            {rate}%
                          </p>
                          <p className="text-[10px] uppercase tracking-widest mt-0.5 font-mono" style={{ color: "var(--color-fg-muted)" }}>
                            Mention rate
                          </p>
                        </>
                      )}
                    </div>
                    <span style={{ color: "var(--color-fg-muted)" }}>
                      <IconChevronRight />
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
