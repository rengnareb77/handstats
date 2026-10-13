import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamLoading() {
  return (
    <main className="flex-1 flex flex-col min-h-dvh">
      <Header
        backHref="/"
        title={
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        }
        bottomContent={
          <div className="w-full grid grid-cols-3 gap-1 h-9 bg-muted/40 p-1 rounded-xl">
            <Skeleton className="h-full rounded-lg" />
            <Skeleton className="h-full rounded-lg" />
            <Skeleton className="h-full rounded-lg" />
          </div>
        }
      />

      <section className="flex-1 flex flex-col px-5 pt-6 pb-8 gap-6">
        <div>
          <Skeleton className="h-4 w-40 mb-3" />
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
          <Skeleton className="h-9 w-full rounded-xl mt-3" />
        </div>
      </section>
    </main>
  );
}
