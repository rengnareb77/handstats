import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  Target01Icon,
  DartIcon,
  FootballPitchIcon,
  UserMultipleIcon,
  ChevronRightIcon,
  ChartColumnIncreasingIcon,
} from "@hugeicons/core-free-icons";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AddMatchDialog } from "@/components/add-match-dialog";
import { EditTeamDialog } from "@/components/edit-team-dialog";
import { teamService } from "@/lib/services/team.services";
import { calculatePlayerStats } from "@/lib/player-stats";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const team = await teamService.getTeamById(id);
    if (!team) return { title: "Équipe non trouvée | HandStats+" };
    return {
      title: `${team.name} | HandStats+`,
      description: `Statistiques, matchs et effectif de ${team.name} (${team.championship || "Sans championnat"})`,
    };
  } catch {
    return { title: "Détail de l'équipe | HandStats+" };
  }
}

// ==========================================
// CONFIGS
// ==========================================
const RESULT_CONFIG = {
  win: { dotClass: "bg-emerald-500" },
  loss: { dotClass: "bg-rose-500" },
  draw: { dotClass: "bg-muted-foreground" },
};

function parseDate(dateStr: string) {
  if (!dateStr) return new Date(0);
  const parts = dateStr.split(" ");
  if (parts.length !== 2) return new Date(0);
  const [d, m, y] = parts[0].split("/");
  const [h, min] = parts[1].split(":");
  return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min));
}

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================
export default async function EquipePage({ params }: PageProps) {
  const { id } = await params;

  let team;
  let matches;
  try {
    [team, matches] = await Promise.all([
      teamService.getTeamById(id),
      teamService.getTeamMatch(id),
    ]);
  } catch {
    notFound();
  }

  if (!team) {
    notFound();
  }

  // Préparation Matchs
  const sortedMatches = [...(matches || [])].sort(
    (a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime()
  );

  // Préparation Joueurs
  const sortedPlayers = [...(team.players || [])].sort((a, b) => a.fullName.localeCompare(b.fullName));

  // Calcul Statistiques Globales Réelles
  const realTotalGoals = team.players?.reduce((acc, p) => acc + (p.stats?.goal || 0) + (p.stats?.sevenMeter || 0), 0) || 0;
  const realTotalShots = team.players?.reduce((acc, p) => acc + Math.max(p.stats?.shot || 0, (p.stats?.goal || 0) + (p.stats?.sevenMeter || 0)), 0) || 0;
  const realPrecision = realTotalShots > 0 ? Math.round((realTotalGoals / realTotalShots) * 100) : 0;

  return (
    <main className="flex-1 flex flex-col min-h-dvh">
      <Tabs defaultValue="stats" className="flex-1 flex flex-col">
        {/* ─── Header avec Onglets Intégrés ─── */}
        <Header
          backHref="/"
          title={
            <div className="flex-shrink-0">
              <h1 className="text-lg font-bold tracking-tight font-heading text-foreground uppercase truncate">{team.name}</h1>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{team.championship || "Sans championnat"}</p>
            </div>
          }
          rightContent={<EditTeamDialog team={team} />}
          bottomContent={
            <TabsList className="w-full grid grid-cols-3 h-9">
              <TabsTrigger value="stats" className="text-xs">Statistique</TabsTrigger>
              <TabsTrigger value="matchs" className="text-xs">Match</TabsTrigger>
              <TabsTrigger value="joueurs" className="text-xs">Joueurs</TabsTrigger>
            </TabsList>
          }
        />

        {/* ======================= TABS CONTENT: STATS ======================= */}
        <TabsContent value="stats" className="flex-1 flex flex-col px-5 pt-6 pb-8 gap-6">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Statistiques Globales
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Card size="sm">
                <CardContent className="flex flex-col items-center gap-2 py-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                    <HugeiconsIcon icon={FootballPitchIcon} size={20} className="text-primary" />
                  </div>
                  <span className="text-2xl font-bold text-foreground font-heading">
                    {matches?.length || 0}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">Matchs</span>
                </CardContent>
              </Card>

              <Card size="sm">
                <CardContent className="flex flex-col items-center gap-2 py-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                    <HugeiconsIcon icon={UserGroupIcon} size={20} className="text-primary" />
                  </div>
                  <span className="text-2xl font-bold text-foreground font-heading">
                    {team.players?.length || 0}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">Joueurs</span>
                </CardContent>
              </Card>

              <Card size="sm">
                <CardContent className="flex flex-col items-center gap-2 py-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-chart-2/10">
                    <HugeiconsIcon icon={Target01Icon} size={20} className="text-chart-2" />
                  </div>
                  <span className="text-2xl font-bold text-foreground font-heading">
                    {realTotalGoals}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">Buts</span>
                </CardContent>
              </Card>

              <Card size="sm">
                <CardContent className="flex flex-col items-center gap-2 py-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-chart-2/10">
                    <HugeiconsIcon icon={DartIcon} size={20} className="text-chart-2" />
                  </div>
                  <span className="text-2xl font-bold text-foreground font-heading">
                    {realPrecision}%
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">Précision</span>
                </CardContent>
              </Card>
            </div>

            <Link href={`/equipe/${id}/stats`} className="mt-3 block">
              <Button variant="ghost" className="w-full gap-2 text-muted-foreground hover:text-foreground">
                <HugeiconsIcon icon={ChartColumnIncreasingIcon} size={16} />
                Voir plus de stats
                <HugeiconsIcon icon={ChevronRightIcon} size={14} />
              </Button>
            </Link>
          </div>
        </TabsContent>

        {/* ======================= TABS CONTENT: MATCHS ======================= */}
        <TabsContent value="matchs" className="flex-1 flex flex-col px-5 pt-6 pb-8 gap-3">
          <AddMatchDialog teamId={id} />
          <div className="flex flex-col gap-3">
            {sortedMatches.map((match) => {
              const isHome = match.isHome ?? false;
              const opponent = isHome ? match.awayTeamName : match.homeTeamName;
              const teamScore = isHome ? match.homeScore.finalScore : match.awayScore.finalScore;
              const opponentScore = isHome ? match.awayScore.finalScore : match.homeScore.finalScore;

              let resultKey: "win" | "loss" | "draw";
              if (teamScore > opponentScore) resultKey = "win";
              else if (teamScore < opponentScore) resultKey = "loss";
              else resultKey = "draw";

              const result = RESULT_CONFIG[resultKey];
              const location = isHome ? "Domicile" : "Extérieur";

              return (
                <Link key={match.codeRencontre} href={`/equipe/${id}/matchs/${match.codeRencontre}`}>
                  <Card size="sm" className="group cursor-pointer transition-all duration-200 hover:bg-muted/50">
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${result.dotClass}`} />
                          <span className="text-[15px] font-bold text-card-foreground truncate pr-6">
                            {opponent}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 pl-4 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {match.date ? `${match.date} • ` : ""}{location}
                          </span>
                        </div>
                      </div>

                      <span className="shrink-0 text-base font-bold font-heading text-foreground tabular-nums tracking-tight mr-2">
                        {teamScore} - {opponentScore}
                      </span>

                      <HugeiconsIcon icon={ChevronRightIcon} size={16} className="shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </TabsContent>

        {/* ======================= TABS CONTENT: JOUEURS ======================= */}
        <TabsContent value="joueurs" className="flex-1 flex flex-col px-5 pt-6 pb-8">
          <p className="text-sm text-muted-foreground mb-4">
            {team.players?.length || 0} joueurs dans l&apos;effectif
          </p>

          <div className="flex flex-col gap-2">
            {sortedPlayers.map((player) => {
              const playerStats = calculatePlayerStats(player, matches || []);
              const mainStat = playerStats.isGoalkeeper ? playerStats.totalSaves : playerStats.totalGoals;
              const mainStatLabel = playerStats.isGoalkeeper ? "arrêts" : "buts";
              const precision = playerStats.precision;
              const matchesCount = playerStats.matchesPlayed;

              const initials = player.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

              return (
                <Link key={player.licenseNumber} href={`/equipe/${id}/joueurs/${player.licenseNumber}`}>
                  <Card size="sm" className="group cursor-pointer transition-all duration-200 hover:bg-muted/50 active:scale-[0.98]">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Avatar className="h-11 w-11 shrink-0">
                        <AvatarFallback className="bg-muted text-foreground font-heading font-bold text-sm uppercase">
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[15px] font-semibold text-card-foreground truncate">
                            {player.fullName}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-muted-foreground">
                            {matchesCount} match{matchesCount > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-3 mr-1">
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground font-heading tabular-nums">
                            {mainStat}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {mainStatLabel}
                          </p>
                        </div>
                        {precision !== null && (
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground font-heading tabular-nums">
                              {precision}%
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              précision
                            </p>
                          </div>
                        )}
                      </div>

                      <HugeiconsIcon icon={ChevronRightIcon} size={18} className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
