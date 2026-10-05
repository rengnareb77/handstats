import { matchService } from "@/lib/services/match.services";
import { teamService } from "@/lib/services/team.services";
import { StatsClient } from "./stats-client";

export default async function MatchStatsPage({
  params,
}: {
  params: Promise<{ id: string; matchId: string }>;
}) {
  const { id, matchId } = await params;

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

  return (
    <main className="flex-1 flex flex-col min-h-dvh">
      <StatsClient match={match} teamId={id} team={team} matchId={matchId} />
    </main>
  );
}
