import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlayerLoading() {
  return (
    <main className="flex-1 flex flex-col min-h-dvh">
      <Header
        backHref="/"
        title={
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-20" />
          </div>
        }
      />

      <section className="flex-1 flex flex-col px-5 pt-6 pb-8 gap-6">
        {/* Player Profile Header Card */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} size="sm">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <Card size="sm" className="p-4">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </Card>
      </section>
    </main>
  );
}
