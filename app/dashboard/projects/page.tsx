import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";

// SVG icons
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
const IconTrend = ({ up }: { up: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {up
      ? <><path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></>
      : <><path d="m22 17-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/></>
    }
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
  const { userId } = await auth();
  if (!userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user) redirect("/dashboard");

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: {
      prompts: {
        include: {
          results: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex-1">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/5 px-6 md:px-8 py-4 flex items-center justify-between backdrop-blur-xl bg-[rgba(10,10,15,0.8)]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-[var(--color-fg-muted)] text-xs mt-0.5">
            Manage your brand monitoring projects
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-[transform,background-color] duration-[160ms] ease-out active:scale-[0.97] glow-indigo cursor-pointer"
        >
          <IconPlus /> New project
        </Link>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="glass rounded-2xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] animate-fade-in-up">
          {projects.length === 0 ? (
            <div className="p-20 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 mb-4">
                <IconPlus />
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">No projects found</h2>
              <p className="text-slate-400 text-sm mb-6">Create your first project to start tracking visibility.</p>
              <Link
                href="/dashboard/projects/new"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all"
              >
                Create Project
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {projects.map((project) => {
                const allResults = project.prompts.flatMap(p => p.results);
                const mentioned = allResults.filter(r => r.brandMentioned).length;
                const rate = allResults.length > 0 ? Math.round((mentioned / allResults.length) * 100) : 0;
                
                return (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-center gap-4 px-6 py-5 hover:bg-white/[0.03] transition-colors group cursor-pointer"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 pulse-dot shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-white tracking-tight truncate">{project.domain}</p>
                      <p className="text-xs text-[var(--color-fg-muted)] mt-1">
                        {project.brandName} · {project.industry} · {project.competitors.length} competitors
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                       {project.status === 'generating' ? (
                        <span className="text-xs text-indigo-400 font-medium">Setting up...</span>
                       ) : (
                        <>
                          <p className={`text-xl font-bold font-mono ${rate >= 70 ? "text-emerald-400" : rate >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                            {rate}%
                          </p>
                          <p className="text-[10px] text-[var(--color-fg-muted)] font-mono uppercase tracking-widest mt-0.5">
                            Mention Rate
                          </p>
                        </>
                       )}
                    </div>
                    <span className="text-[var(--color-fg-muted)] group-hover:text-white/50 transition-colors">
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
