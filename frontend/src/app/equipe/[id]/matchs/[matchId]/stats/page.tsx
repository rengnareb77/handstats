import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { matchService } from "@/lib/services/match.services";
import { teamService } from "@/lib/services/team.services";
import { StatsClient } from "./stats-client";

interface PageProps {
  params: Promise<{ id: string; matchId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { matchId } = await params;
  try {
    const match = await matchService.getMatchById(matchId);
    if (!match) return { title: "Match non trouvé | HandStats+" };
    return {
      title: `Statistiques : ${match.homeTeamName} vs ${match.awayTeamName} | HandStats+`,
      description: `Statistiques avancées de la rencontre ${match.homeTeamName} contre ${match.awayTeamName}`,
    };
  } catch {
    return { title: "Statistiques du match | HandStats+" };
  }
}

export default async function MatchStatsPage({ params }: PageProps) {
  const { id, matchId } = await params;

  let match;
  let team;
  try {
    [match, team] = await Promise.all([
      matchService.getMatchById(matchId),
      teamService.getTeamById(id),
    ]);
  } catch {
    notFound();
  }

  if (!match || !team) {
    notFound();
  }

  return (
    <main className="flex-1 flex flex-col min-h-dvh">
      <StatsClient match={match} teamId={id} team={team} matchId={matchId} />
    </main>
  );
}
