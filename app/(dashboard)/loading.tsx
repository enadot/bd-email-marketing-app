import { PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton";

// Group-level fallback: shown instantly on navigation to any dashboard route
// that doesn't define its own loading.tsx (and for the overview page).
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-48" />
    </div>
  );
}
