import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function MatchLoading() {
  return (
    <main className="flex-1 flex flex-col min-h-dvh">
      {/* Sticky header skeleton */}
      <div className="sticky top-0 z-50 bg-background/95 border-b border-border pb-3 pt-3 px-5 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      <section className="flex-1 flex flex-col px-5 pb-8 gap-4">
        {/* Score Card Skeleton */}
        <Card size="sm" className="p-5 flex flex-col items-center gap-3">
          <div className="flex items-center justify-between w-full">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-6 w-28" />
          </div>
        </Card>

        {/* Filters Skeleton */}
        <div className="flex gap-2 py-2 overflow-x-auto">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-full shrink-0" />
          ))}
        </div>

        {/* Events list skeleton */}
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} size="sm" className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-12 rounded-md" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
