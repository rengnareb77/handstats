import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { matchService } from "@/lib/services/match.services";
import { teamService } from "@/lib/services/team.services";
import { MatchDetailClient } from "./match-detail-client";

interface PageProps {
  params: Promise<{ id: string; matchId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { matchId } = await params;
  try {
    const match = await matchService.getMatchById(matchId);
    if (!match) return { title: "Match non trouvé | HandStats+" };
    return {
      title: `${match.homeTeamName} vs ${match.awayTeamName} | HandStats+`,
      description: `Détails et analyse de la rencontre ${match.homeTeamName} contre ${match.awayTeamName}`,
    };
  } catch {
    return { title: "Détail du match | HandStats+" };
  }
}

/**
 * Page détail match — Server Component
 */
export default async function MatchDetailPage({ params }: PageProps) {
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

  return <MatchDetailClient match={match} teamId={id} team={team} />;
}
