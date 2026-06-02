export default function ProjectsLoading() {
  return (
    <div className="flex-1 animate-pulse">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-20 border-b border-white/5 px-6 md:px-8 py-4 flex items-center justify-between backdrop-blur-xl bg-[rgba(10,10,15,0.8)]">
        <div>
          <div className="h-6 w-24 bg-white/10 rounded-md mb-2" />
          <div className="h-3.5 w-52 bg-white/5 rounded-md" />
        </div>
        <div className="h-9 w-28 bg-white/10 rounded-lg" />
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="glass rounded-2xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="divide-y divide-white/5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-5 w-1/4 bg-white/10 rounded-md" />
                  <div className="h-3.5 w-1/3 bg-white/5 rounded-md" />
                </div>
                <div className="space-y-1.5 text-right shrink-0">
                  <div className="h-6 w-16 bg-white/10 rounded-md ml-auto" />
                  <div className="h-3 w-20 bg-white/5 rounded-md ml-auto" />
                </div>
                <div className="w-3.5 h-3.5 bg-white/5 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
