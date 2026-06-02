export default function DashboardLoading() {
  return (
    <div className="flex-1 animate-pulse">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-20 border-b border-white/5 px-6 md:px-8 py-4 flex items-center justify-between backdrop-blur-xl bg-[rgba(10,10,15,0.8)]">
        <div>
          <div className="h-6 w-32 bg-white/10 rounded-md mb-2" />
          <div className="h-3.5 w-48 bg-white/5 rounded-md" />
        </div>
        <div className="h-9 w-28 bg-white/10 rounded-lg" />
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-8">
        {/* Stats Bento Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Main KPI */}
          <div className="md:col-span-3 glass rounded-2xl p-7 h-[200px] flex flex-col justify-between">
            <div>
              <div className="h-3 w-28 bg-white/5 rounded-md mb-3" />
              <div className="h-10 w-36 bg-white/10 rounded-md" />
            </div>
            <div className="h-[60px] w-full bg-white/5 rounded-lg mt-4" />
          </div>

          {/* Secondary KPI */}
          <div className="md:col-span-2 glass rounded-2xl p-7 h-[200px] flex flex-col justify-between">
            <div>
              <div className="h-3 w-32 bg-white/5 rounded-md mb-3" />
              <div className="h-10 w-24 bg-white/10 rounded-md" />
            </div>
            <div className="h-3 w-40 bg-white/5 rounded-md" />
          </div>

          {/* Smaller KPI Cards */}
          <div className="glass rounded-2xl p-5 h-[100px] flex flex-col justify-between">
            <div className="h-3.5 w-20 bg-white/5 rounded-md" />
            <div className="h-7 w-12 bg-white/10 rounded-md" />
          </div>
          <div className="glass rounded-2xl p-5 h-[100px] flex flex-col justify-between">
            <div className="h-3.5 w-20 bg-white/5 rounded-md" />
            <div className="h-7 w-12 bg-white/10 rounded-md" />
          </div>
          <div className="glass rounded-2xl p-5 h-[100px] flex flex-col justify-between">
            <div className="h-3.5 w-20 bg-white/5 rounded-md" />
            <div className="h-7 w-12 bg-white/10 rounded-md" />
          </div>
        </div>

        {/* Content Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Projects Table Skeleton */}
          <div className="glass rounded-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
              <div className="h-4.5 w-20 bg-white/10 rounded-md" />
              <div className="h-4 w-24 bg-white/5 rounded-md" />
            </div>
            <div className="divide-y divide-white/5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-2 h-2 rounded-full bg-white/10 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4.5 w-1/3 bg-white/10 rounded-md" />
                    <div className="h-3.5 w-1/2 bg-white/5 rounded-md" />
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="h-5 w-12 bg-white/10 rounded-md ml-auto" />
                    <div className="h-3.5 w-14 bg-white/5 rounded-md ml-auto" />
                  </div>
                  <div className="w-3.5 h-3.5 bg-white/5 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Runs Skeleton */}
          <div className="glass rounded-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-white/5">
              <div className="h-4.5 w-24 bg-white/10 rounded-md" />
            </div>
            <div className="divide-y divide-white/5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="px-5 py-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-4.5 w-3/4 bg-white/10 rounded-md" />
                    <div className="w-5 h-5 bg-white/5 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-4.5 w-16 bg-white/10 rounded-md" />
                    <div className="h-3.5 w-20 bg-white/5 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
