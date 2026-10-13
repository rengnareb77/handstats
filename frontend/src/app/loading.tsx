import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex-1 flex flex-col min-h-dvh">
      <Header
        className="py-5"
        leftContent={
          <div className="flex items-center gap-1">
            <Skeleton className="h-6 w-28" />
          </div>
        }
      />

      <section className="flex-1 flex flex-col px-5 pb-8">
        <div className="mb-6 mt-6">
          <Skeleton className="h-8 w-44 mb-2" />
          <Skeleton className="h-4 w-60" />
        </div>

        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} size="sm" className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3.5 w-24" />
                </div>
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            </Card>
          ))}
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] text-muted-foreground/60 uppercase tracking-widest font-medium">
            ou
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Skeleton className="h-14 w-full rounded-2xl" />
      </section>
    </main>
  );
}
