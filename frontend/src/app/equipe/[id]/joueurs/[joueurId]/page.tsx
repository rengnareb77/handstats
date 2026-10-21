import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Target01Icon,
  DartIcon,
  UserGroupIcon,
  FootballPitchIcon,
} from "@hugeicons/core-free-icons";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { playerService } from "@/lib/services/player.services";
import { teamService } from "@/lib/services/team.services";
import { calculatePlayerStats } from "@/lib/player-stats";
import { Match } from "@/types/match.types";
import { PlayerCharts } from "./player-charts";

interface PageProps {
  params: Promise<{ id: string; joueurId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { joueurId } = await params;
  try {
    const player = await playerService.getPlayerById(joueurId);
    if (!player) return { title: "Joueur non trouvé | HandStats+" };
    return {
      title: `${player.fullName} | HandStats+`,
      description: `Fiche joueur et statistiques individuelles de ${player.fullName}`,
    };
  } catch {
    return { title: "Détail du joueur | HandStats+" };
  }
}

// ==========================================
// HELPERS
// ==========================================
function parseDate(dateStr: string) {
  if (!dateStr) return new Date(0);
  const parts = dateStr.split(" ");
  if (parts.length !== 2) return new Date(0);
  const [d, m, y] = parts[0].split("/");
  const [h, min] = parts[1].split(":");
  return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min));
}

export default async function JoueurDetailPage({ params }: PageProps) {
  const { id, joueurId } = await params;
  let player;
  let teamMatches: Match[] = [];
  try {
    const [fetchedPlayer, fetchedMatches] = await Promise.all([
      playerService.getPlayerById(joueurId),
      teamService.getTeamMatch(id).catch(() => []),
    ]);
    player = fetchedPlayer;
    teamMatches = fetchedMatches || [];
  } catch {
    notFound();
  }

  if (!player) {
    notFound();
  }

  // Unified and robust calculation of player stats & matches
  const {
    playerMatches,
    matchesPlayed,
    totalGoals,
    totalShots,
    totalSaves,
    goalsPerMatch,
    savesPerMatch,
    isGoalkeeper,
    precision,
  } = calculatePlayerStats(player, teamMatches);

  const names = player.fullName.split(" ");
  const firstName = names[0];
  const name = names.slice(1).join(" ") || "";
  const initials = player.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  // For recentMatches, sort by date descending
  const sortedMatches = [...playerMatches].sort(
    (a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime()
  );

  const recentMatches = sortedMatches.map(match => {
    const isHomePlayer = match.homeTeamPlayers.some(p => p.licenseNumber === player.licenseNumber);
    const isHome = isHomePlayer; 
    
    const opponent = isHome ? match.awayTeamName : match.homeTeamName;
    const teamScore = isHome ? match.homeScore?.finalScore : match.awayScore?.finalScore;
    const opponentScore = isHome ? match.awayScore?.finalScore : match.homeScore?.finalScore;
    
    let resultKey: "win" | "loss" | "draw" = "draw";
    if (teamScore !== undefined && opponentScore !== undefined) {
      if (teamScore > opponentScore) resultKey = "win";
      else if (teamScore < opponentScore) resultKey = "loss";
    }
    
    const matchPlayer = isHome ? match.homeTeamPlayers.find(p => p.licenseNumber === player.licenseNumber) : match.awayTeamPlayers.find(p => p.licenseNumber === player.licenseNumber);
    
    const mGoals = matchPlayer ? matchPlayer.goal : 0;
    const mShots = matchPlayer ? Math.max(matchPlayer.shot, mGoals) : 0;
    const mSaves = matchPlayer ? matchPlayer.save : 0;
    
    return {
      id: match.codeRencontre,
      opponent,
      date: match.date,
      goals: mGoals,
      shots: mShots,
      saves: mSaves,
      result: resultKey,
    }
  });

  return (
    <main className="flex-1 flex flex-col min-h-dvh">
      {/* ─── Header ─── */}
      <Header
        backHref={`/equipe/${id}?tab=joueurs`}
        title={`${firstName} ${name}`}
      />

      {/* ─── Content ─── */}
      <section className="flex-1 flex flex-col px-5 pt-6 pb-8 gap-6">
        {/* ─── Player Identity ─── */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarFallback className="bg-muted text-foreground font-heading font-bold text-xl uppercase">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-foreground font-heading">
              {firstName} {name}
            </h2>
          </div>
        </div>

        {/* ─── Stats Grid ─── */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Statistiques saison
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Matchs joués */}
            <Card size="sm">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <HugeiconsIcon icon={FootballPitchIcon} size={20} className="text-primary" />
                </div>
                <span className="text-2xl font-bold text-foreground font-heading">
                  {matchesPlayed}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Matchs joués
                </span>
              </CardContent>
            </Card>

            {/* Main stat: Goals or Saves */}
            <Card size="sm">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-chart-1/10">
                  <HugeiconsIcon icon={Target01Icon} size={20} className="text-chart-1" />
                </div>
                <span className="text-2xl font-bold text-foreground font-heading">
                  {isGoalkeeper ? totalSaves : totalGoals}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {isGoalkeeper ? "Arrêts" : "Buts"}
                </span>
              </CardContent>
            </Card>

            {/* Per match */}
            <Card size="sm">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-chart-2/10">
                  <HugeiconsIcon icon={DartIcon} size={20} className="text-chart-2" />
                </div>
                <span className="text-2xl font-bold text-foreground font-heading">
                  {isGoalkeeper
                    ? savesPerMatch.toFixed(1)
                    : goalsPerMatch.toFixed(1)}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {isGoalkeeper ? "Arrêts/match" : "Buts/match"}
                </span>
              </CardContent>
            </Card>

            {/* Precision or Saves rate */}
            {!isGoalkeeper && precision !== null ? (
              <Card size="sm">
                <CardContent className="flex flex-col items-center gap-2 py-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-chart-3/10">
                    <HugeiconsIcon icon={DartIcon} size={20} className="text-chart-3" />
                  </div>
                  <span className="text-2xl font-bold text-foreground font-heading">
                    {precision}%
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Précision
                  </span>
                </CardContent>
              </Card>
            ) : (
              <Card size="sm">
                <CardContent className="flex flex-col items-center gap-2 py-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-chart-3/10">
                    <HugeiconsIcon icon={Target01Icon} size={20} className="text-chart-3" />
                  </div>
                  <span className="text-2xl font-bold text-foreground font-heading">
                    {totalGoals}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Buts marqués
                  </span>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* ─── Sanctions ─── */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Sanctions
          </h3>
          <Card size="sm">
            <CardContent className="py-3">
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <span className="text-lg font-bold text-foreground font-heading">
                    {player.stats?.avertissement || 0}
                  </span>
                  <p className="text-[11px] text-muted-foreground">🟡 Jaunes</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <span className="text-lg font-bold text-foreground font-heading">
                    {player.stats?.twoMinutes || 0}
                  </span>
                  <p className="text-[11px] text-muted-foreground">⏱️ 2 min</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <span className="text-lg font-bold text-foreground font-heading">
                    {player.stats?.redCard || 0}
                  </span>
                  <p className="text-[11px] text-muted-foreground">🔴 Rouges</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Graphiques d'évolution ─── */}
        <PlayerCharts matches={recentMatches} isGoalkeeper={isGoalkeeper} />

        {/* ─── Recent Matches ─── */}
        {recentMatches.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Derniers matchs
            </h3>
            <Card size="sm">
              <div className="divide-y divide-border">
                {recentMatches.map((match) => {
                  const matchPrecision = match.shots > 0
                    ? Math.round((match.goals / match.shots) * 100)
                    : null;

                  return (
                    <div key={match.id} className="flex items-center gap-3 px-4 py-3">
                      {/* Result indicator */}
                      <div className={`w-1 h-8 rounded-full ${
                        match.result === "win"
                          ? "bg-chart-1"
                          : match.result === "loss"
                          ? "bg-destructive"
                          : "bg-muted-foreground"
                      }`} />

                      {/* Match info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground truncate">
                          vs {match.opponent}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {parseDate(match.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>

                      {/* Match stats */}
                      <div className="shrink-0 flex items-center gap-4 text-right">
                        {isGoalkeeper ? (
                          <div>
                            <p className="text-sm font-bold text-foreground font-heading tabular-nums">
                              {match.saves}
                            </p>
                            <p className="text-[10px] text-muted-foreground">arrêts</p>
                          </div>
                        ) : (
                          <>
                            <div>
                              <p className="text-sm font-bold text-foreground font-heading tabular-nums">
                                {match.goals}/{match.shots}
                              </p>
                              <p className="text-[10px] text-muted-foreground">buts/tirs</p>
                            </div>
                            {matchPrecision !== null && (
                              <div>
                                <p className="text-sm font-bold text-foreground font-heading tabular-nums">
                                  {matchPrecision}%
                                </p>
                                <p className="text-[10px] text-muted-foreground">précision</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </section>
    </main>
  );
}
