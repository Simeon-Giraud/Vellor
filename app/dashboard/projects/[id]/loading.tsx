export default function ProjectDetailLoading() {
  return (
    <div className="flex-1 animate-pulse">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-20 border-b border-white/5 px-6 md:px-8 py-4 flex items-center justify-between backdrop-blur-xl bg-[rgba(10,10,15,0.8)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="h-6 w-36 bg-white/10 rounded-md" />
          </div>
        </div>
        <div className="h-9 w-20 bg-white/10 rounded-lg" />
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-8">
        {/* KPI Row Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass rounded-2xl p-5 h-[100px] flex flex-col justify-between">
              <div className="h-3.5 w-16 bg-white/5 rounded-md" />
              <div className="h-7 w-12 bg-white/10 rounded-md" />
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="glass rounded-2xl p-6 h-[300px] flex flex-col justify-between">
          <div className="h-4.5 w-48 bg-white/10 rounded-md" />
          <div className="h-[200px] w-full bg-white/5 rounded-lg" />
        </div>

        {/* Competitors List Skeleton */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <div className="h-4.5 w-40 bg-white/10 rounded-md" />
          </div>
          <div className="divide-y divide-white/5">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="w-2 h-2 rounded-full bg-white/10 shrink-0" />
                <div className="h-4 w-32 bg-white/10 rounded-md flex-1" />
                <div className="flex items-center gap-3 w-48 shrink-0">
                  <div className="flex-1 h-1.5 rounded-full bg-white/5" />
                  <div className="h-4 w-12 bg-white/10 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prompts Table Skeleton */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <div className="h-4.5 w-32 bg-white/10 rounded-md" />
          </div>
          <div className="divide-y divide-white/5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 justify-between">
                <div className="h-4 w-1/3 bg-white/10 rounded-md" />
                <div className="flex gap-4 shrink-0">
                  <div className="h-6 w-16 bg-white/5 rounded-full" />
                  <div className="h-6 w-16 bg-white/5 rounded-full" />
                  <div className="h-6 w-16 bg-white/5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
