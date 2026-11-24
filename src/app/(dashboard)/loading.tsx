import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <Skeleton className="h-7 w-40 sm:h-8 sm:w-56" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-2xl sm:h-80 lg:col-span-2" />
        <Skeleton className="h-64 rounded-2xl sm:h-80" />
      </div>
      <Skeleton className="h-56 rounded-2xl sm:h-64" />
    </div>
  );
}
