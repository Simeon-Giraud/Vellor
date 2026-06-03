export default function ProjectsLoading() {
  const sk = (h: string, w: string) => (
    <div className="rounded-md animate-pulse" style={{ height: h, width: w, background: "var(--color-surface-3)" }} />
  );
  return (
    <div className="flex-1">
      <header
        className="sticky top-0 z-20 px-6 md:px-8 py-4 flex items-center justify-between backdrop-blur-xl border-b"
        style={{ background: "var(--color-header-bg)", borderColor: "var(--color-header-border)" }}
      >
        <div className="space-y-2">
          {sk("24px", "96px")}
          {sk("14px", "208px")}
        </div>
        {sk("36px", "112px")}
      </header>
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="dash-card overflow-hidden animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-5 border-b last:border-b-0" style={{ borderColor: "var(--color-border)" }}>
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: "var(--color-surface-3)" }} />
              <div className="flex-1 space-y-2.5">
                {sk("20px", "25%")}
                {sk("14px", "33%")}
              </div>
              <div className="space-y-1.5 text-right shrink-0">
                {sk("24px", "64px")}
                {sk("12px", "80px")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
