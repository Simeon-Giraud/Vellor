export default function SettingsLoading() {
  return (
    <div className="flex-1 animate-pulse">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-20 border-b border-white/5 px-6 md:px-8 py-4 flex items-center justify-between backdrop-blur-xl bg-[rgba(10,10,15,0.8)]">
        <div>
          <div className="h-6 w-24 bg-white/10 rounded-md mb-2" />
          <div className="h-3.5 w-40 bg-white/5 rounded-md" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 md:px-8 py-8 space-y-8">
        {/* Navigation Tabs Skeleton */}
        <div className="flex gap-2 border-b border-white/5 pb-px overflow-x-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-24 bg-white/5 rounded-lg shrink-0" />
          ))}
        </div>

        {/* Settings Content Card Skeleton */}
        <div className="glass rounded-2xl p-6 md:p-8 space-y-6">
          <div className="border-b border-white/5 pb-4">
            <div className="h-5.5 w-32 bg-white/10 rounded-md mb-2" />
            <div className="h-3.5 w-64 bg-white/5 rounded-md" />
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3.5 w-24 bg-white/5 rounded-md" />
                <div className="h-10 w-full bg-white/10 rounded-lg" />
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <div className="h-10 w-28 bg-white/10 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
