// Lightweight shimmer block used by route-level loading.tsx files so
// navigation shows an instant placeholder while the server renders the page.
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-neutral-200/70 dark:bg-neutral-800/70 ${className}`}
    />
  );
}

// Header block shared by the dashboard pages (title + subtitle on the right,
// a primary action on the left).
export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-9 w-28" />
    </div>
  );
}
