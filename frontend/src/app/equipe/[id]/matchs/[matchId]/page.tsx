import { matchService } from "@/lib/services/match.services";
import { teamService } from "@/lib/services/team.services";
import { MatchDetailClient } from "./match-detail-client";

/**
 * Page détail match — Server Component
 */
export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string; matchId: string }>;
}) {
  const { id, matchId } = await params;

  // On récupère les données réelles du match et de l'équipe
  const [match, team] = await Promise.all([
    matchService.getMatchById(matchId, true),
    teamService.getTeamById(id, true),
  ]);

  if (!match) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-dvh">
        <p className="text-muted-foreground">Match introuvable.</p>
      </div>
    );
  }

  return <MatchDetailClient match={match} teamId={id} team={team} />;
}
