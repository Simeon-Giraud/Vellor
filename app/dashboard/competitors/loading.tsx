export default function CompetitorsLoading() {
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
          {sk("24px", "128px")}
          {sk("14px", "192px")}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="dash-card rounded-xl p-8 flex flex-col items-center justify-center h-[300px] space-y-4">
          {sk("24px", "144px")}
          {sk("18px", "256px")}
        </div>
      </div>
    </div>
  );
}
