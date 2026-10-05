import { teamService } from "@/lib/services/team.services";
import { Header } from "@/components/header";
import { TeamStatsClient } from "./team-stats-client";
import { notFound } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function TeamStatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const team = await teamService.getTeamById(resolvedParams.id, true);

  if (!team) {
    notFound();
  }

  // S'assurer que le tableau de matchs est bien là (même vide)
  const matchs = team.matchs || [];

  return (
    <main className="flex-1 flex flex-col min-h-dvh">
      {/* HEADER COMPACT ET COLLANT */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border pb-3 pt-3 px-5 mb-4 flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link href={`/equipe/${team.id}`} className="shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-muted/50">
                <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
              </Button>
            </Link>
            <div className="leading-tight min-w-0 flex-1">
              <h1 className="text-lg font-bold tracking-tight font-heading text-foreground truncate">
                Tableau de bord : {team.name}
              </h1>
              <p className="text-[11px] text-muted-foreground truncate">
                Statistiques globales de la saison
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-2 md:px-4 pb-4 md:pb-6">
        <TeamStatsClient team={team} matchs={matchs} />
      </div>
    </main>
  );
}
