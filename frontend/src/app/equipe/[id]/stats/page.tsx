import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { teamService } from "@/lib/services/team.services";
import { BackButton } from "@/components/back-button";
import { TeamStatsClient } from "./team-stats-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const team = await teamService.getTeamById(id);
    if (!team) return { title: "Équipe non trouvée | HandStats+" };
    return {
      title: `Statistiques de la saison : ${team.name} | HandStats+`,
      description: `Tableau de bord et statistiques globales de l'équipe ${team.name}`,
    };
  } catch {
    return { title: "Statistiques d'équipe | HandStats+" };
  }
}

export default async function TeamStatsPage({ params }: PageProps) {
  const { id } = await params;

  let team;
  try {
    team = await teamService.getTeamById(id);
  } catch {
    notFound();
  }

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
            <BackButton href={`/equipe/${team.id}?tab=stats`} />
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
