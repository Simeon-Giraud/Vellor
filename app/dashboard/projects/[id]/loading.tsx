export default function ProjectDetailLoading() {
  const sk = (h: string, w: string) => (
    <div className="rounded-md animate-pulse" style={{ height: h, width: w, background: "var(--color-surface-3)" }} />
  );
  const card = "dash-card rounded-xl";

  return (
    <div className="flex-1">
      <header
        className="sticky top-0 z-20 px-6 md:px-8 py-4 flex items-center justify-between backdrop-blur-xl border-b"
        style={{ background: "var(--color-header-bg)", borderColor: "var(--color-header-border)" }}
      >
        <div className="flex items-center gap-3">
          {sk("32px", "32px")}
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: "var(--color-surface-3)" }} />
            {sk("24px", "144px")}
          </div>
        </div>
        {sk("36px", "80px")}
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`${card} p-5 h-[100px] flex flex-col justify-between`}>
              {sk("14px", "64px")}
              {sk("28px", "48px")}
            </div>
          ))}
        </div>

        <div className={`${card} p-6 h-[300px] flex flex-col justify-between`}>
          {sk("18px", "192px")}
          {sk("200px", "100%")}
        </div>

        <div className={`${card} overflow-hidden`}>
          <div className="px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
            {sk("18px", "160px")}
          </div>
          <div>
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b last:border-b-0" style={{ borderColor: "var(--color-border)" }}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--color-surface-3)" }} />
                <div className="flex-1">
                  {sk("16px", "128px")}
                </div>
                <div className="flex items-center gap-3 w-48 shrink-0">
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--color-surface-2)" }} />
                  {sk("16px", "48px")}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${card} overflow-hidden`}>
          <div className="px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
            {sk("18px", "128px")}
          </div>
          <div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 justify-between border-b last:border-b-0" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex-1">
                  {sk("16px", "33%")}
                </div>
                <div className="flex gap-4 shrink-0">
                  {sk("24px", "64px")}
                  {sk("24px", "64px")}
                  {sk("24px", "64px")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
