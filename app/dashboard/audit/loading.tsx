export default function AuditLoading() {
  return (
    <div className="flex-1 animate-pulse">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-20 border-b border-white/5 px-6 md:px-8 py-4 flex items-center justify-between backdrop-blur-xl bg-[rgba(10,10,15,0.8)]">
        <div>
          <div className="h-6 w-20 bg-white/10 rounded-md mb-2" />
          <div className="h-3.5 w-48 bg-white/5 rounded-md" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="glass rounded-2xl p-12 flex flex-col items-center justify-center h-[300px] space-y-4">
          <div className="h-6 w-28 bg-white/10 rounded-md" />
          <div className="h-4.5 w-64 bg-white/5 rounded-md" />
        </div>
      </div>
    </div>
  );
}
