export default function SettingsLoading() {
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
          {sk("14px", "160px")}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 md:px-8 py-8 space-y-8">
        <div className="flex gap-2 border-b pb-px overflow-x-auto" style={{ borderColor: "var(--color-border)" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-lg shrink-0" style={{ height: "36px", width: "96px", background: "var(--color-surface-2)" }} />
          ))}
        </div>

        <div className="dash-card rounded-xl p-5 md:p-6 space-y-6">
          <div className="border-b pb-4" style={{ borderColor: "var(--color-border)" }}>
            <div className="mb-2">
              {sk("22px", "128px")}
            </div>
            {sk("14px", "256px")}
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                {sk("14px", "96px")}
                {sk("40px", "100%")}
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            {sk("40px", "112px")}
          </div>
        </div>
      </div>
    </div>
  );
}
