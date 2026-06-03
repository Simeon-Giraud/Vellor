/* Shared skeleton shimmer — adapts to light/dark via CSS variables */
export function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-md animate-pulse ${className}`}
      style={{ background: "var(--color-surface-3)" }}
    />
  );
}
