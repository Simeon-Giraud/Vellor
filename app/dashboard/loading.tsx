export default function DashboardLoading() {
  const sk = (h: string, w: string) => (
    <div className="rounded-md animate-pulse" style={{ height: h, width: w, background: "var(--color-surface-3)" }} />
  );
  const card = "dash-card rounded-xl";

  return (
    <div className="flex-1">
      {/* Header skeleton */}
      <header
        className="sticky top-0 z-20 px-6 md:px-8 py-4 flex items-center justify-between backdrop-blur-xl border-b"
        style={{ background: "var(--color-header-bg)", borderColor: "var(--color-header-border)" }}
      >
        <div className="space-y-2">
          {sk("24px", "128px")}
          {sk("14px", "192px")}
        </div>
        {sk("36px", "112px")}
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-8">
        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className={`md:col-span-3 ${card} p-7 h-[200px] flex flex-col justify-between`}>
            <div className="space-y-3">
              {sk("12px", "112px")}
              {sk("40px", "144px")}
            </div>
            {sk("60px", "100%")}
          </div>
          <div className={`md:col-span-2 ${card} p-7 h-[200px] flex flex-col justify-between`}>
            <div className="space-y-3">
              {sk("12px", "128px")}
              {sk("40px", "96px")}
            </div>
            {sk("12px", "160px")}
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className={`${card} p-5 h-[100px] flex flex-col justify-between`}>
              {sk("14px", "80px")}
              {sk("28px", "48px")}
            </div>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div className={`${card} overflow-hidden`}>
            <div className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
              {sk("18px", "80px")}
              {sk("16px", "96px")}
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b last:border-b-0" style={{ borderColor: "var(--color-border)" }}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--color-surface-3)" }} />
                <div className="flex-1 space-y-2">
                  {sk("18px", "33%")}
                  {sk("14px", "50%")}
                </div>
                <div className="space-y-1 text-right">
                  {sk("20px", "48px")}
                  {sk("14px", "56px")}
                </div>
              </div>
            ))}
          </div>

          <div className={`${card} overflow-hidden`}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
              {sk("18px", "96px")}
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-5 py-4 space-y-3 border-b last:border-b-0" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-start gap-3">
                  {sk("18px", "75%")}
                  <div className="w-5 h-5 rounded-full shrink-0" style={{ background: "var(--color-surface-3)" }} />
                </div>
                <div className="flex justify-between">
                  {sk("18px", "64px")}
                  {sk("14px", "80px")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
