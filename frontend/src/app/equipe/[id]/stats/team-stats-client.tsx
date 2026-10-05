"use client";

import { useMemo } from "react";
import { Team } from "@/types/team.types";
import { Match } from "@/types/match.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { TrophyIcon, Target01Icon, DartIcon, Alert01Icon, ChartColumnIncreasingIcon } from "@hugeicons/core-free-icons";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  LabelList
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export function TeamStatsClient({ team, matchs }: { team: Team, matchs: Match[] }) {
  
  // --- 1. Compteurs globaux (Matchs) ---
  const matchStats = useMemo(() => {
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsScored = 0;
    let goalsConceded = 0;

    // Trier les matchs par date pour les graphiques d'évolution
    // Format de date: "DD/MM/YYYY HH:mm"
    const sortedMatchs = [...matchs].sort((a, b) => {
      const parseDate = (d: string) => {
        if (!d) return 0;
        const [datePart, timePart] = d.split(' ');
        if (!datePart || !timePart) return 0;
        const [day, month, year] = datePart.split('/');
        const [hour, minute] = timePart.split(':');
        return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)).getTime();
      };
      return parseDate(a.date) - parseDate(b.date);
    });

    const evolutionData = sortedMatchs.map((m, index) => {
      const isHome = m.isHome !== undefined ? m.isHome : m.homeTeamName === team.name;
      const scored = isHome ? m.homeScore?.finalScore || 0 : m.awayScore?.finalScore || 0;
      const conceded = isHome ? m.awayScore?.finalScore || 0 : m.homeScore?.finalScore || 0;
      const opponent = isHome ? m.awayTeamName : m.homeTeamName;

      if (scored > conceded) wins++;
      else if (scored === conceded) draws++;
      else losses++;

      goalsScored += scored;
      goalsConceded += conceded;

      const teamPlayers = isHome ? m.homeTeamPlayers : m.awayTeamPlayers;
      const teamShots = teamPlayers ? teamPlayers.reduce((acc, p) => acc + Math.max(p.shot || 0, p.goal || 0), 0) : 0;

      return {
        matchName: `J${index + 1} vs ${opponent}`,
        Buts: scored,
        Tirs: teamShots,
        Résultat: scored > conceded ? "V" : scored === conceded ? "N" : "D"
      };
    });

    return {
      total: matchs.length,
      wins,
      draws,
      losses,
      goalsScored,
      goalsConceded,
      avgScored: matchs.length ? (goalsScored / matchs.length).toFixed(1) : "0",
      avgConceded: matchs.length ? (goalsConceded / matchs.length).toFixed(1) : "0",
      winRate: matchs.length ? Math.round((wins / matchs.length) * 100) : 0,
      evolutionData
    };
  }, [matchs, team.name]);

  // --- 2. Top Joueurs (Buteurs & Sanctions) ---
  const playerStats = useMemo(() => {
    const playersData = team.players.map(p => {
      const totalGoals = p.stats?.goal || 0;
      const totalShots = Math.max(p.stats?.shot || 0, totalGoals);
      const yellow = p.stats?.avertissement || 0;
      const twoMin = p.stats?.twoMinutes || 0;
      const red = p.stats?.redCard || 0;
      const totalSanctions = yellow + twoMin + red;

      return {
        name: p.fullName,
        goals: totalGoals,
        shots: totalShots,
        precision: totalShots > 0 ? Math.round((totalGoals / totalShots) * 100) : 0,
        sanctions: totalSanctions
      };
    });

    const topScorers = [...playersData].sort((a, b) => b.goals - a.goals).slice(0, 10);
    const topSanctions = [...playersData].sort((a, b) => b.sanctions - a.sanctions).slice(0, 5);

    return { topScorers, topSanctions };
  }, [team.players]);

  const chartConfigEvolution = {
    Buts: { label: "Buts", color: "var(--color-chart-3)" },
    Tirs: { label: "Tirs", color: "var(--color-chart-5)" },
  };

  const chartConfigScorers = {
    goals: { label: "Buts", color: "var(--color-chart-3)" },
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* SECTION 1 : KPI GLOBALES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Victoires */}
        <Card className="bg-gradient-to-br from-chart-2/10 to-transparent border-chart-2/20">
          <CardContent className="flex flex-col items-center justify-center p-4 md:p-6 text-center h-full">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-chart-2/20 mb-3">
              <HugeiconsIcon icon={TrophyIcon} size={24} className="text-chart-2" />
            </div>
            <div className="text-2xl md:text-3xl font-bold font-heading text-foreground">{matchStats.wins}</div>
            <div className="text-xs md:text-sm text-muted-foreground font-medium mt-1">Victoires</div>
            <div className="text-[10px] text-muted-foreground mt-1 opacity-80">sur {matchStats.total} matchs</div>
          </CardContent>
        </Card>

        {/* Buts Moyens Marqués */}
        <Card className="bg-gradient-to-br from-chart-3/10 to-transparent border-chart-3/20">
          <CardContent className="flex flex-col items-center justify-center p-4 md:p-6 text-center h-full">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-chart-3/20 mb-3">
              <HugeiconsIcon icon={Target01Icon} size={24} className="text-chart-3" />
            </div>
            <div className="text-2xl md:text-3xl font-bold font-heading text-foreground">{matchStats.avgScored}</div>
            <div className="text-xs md:text-sm text-muted-foreground font-medium mt-1">Buts / match</div>
            <div className="text-[10px] text-muted-foreground mt-1 opacity-80">{matchStats.goalsScored} buts au total</div>
          </CardContent>
        </Card>

        {/* Buts Moyens Encaissés */}
        <Card className="bg-gradient-to-br from-chart-5/10 to-transparent border-chart-5/20">
          <CardContent className="flex flex-col items-center justify-center p-4 md:p-6 text-center h-full">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-chart-5/20 mb-3">
              <HugeiconsIcon icon={Alert01Icon} size={24} className="text-chart-5" />
            </div>
            <div className="text-2xl md:text-3xl font-bold font-heading text-foreground">{matchStats.avgConceded}</div>
            <div className="text-xs md:text-sm text-muted-foreground font-medium mt-1">Encaissés / match</div>
            <div className="text-[10px] text-muted-foreground mt-1 opacity-80">{matchStats.goalsConceded} buts au total</div>
          </CardContent>
        </Card>

        {/* Bilan global (V-N-D) */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4 md:p-6 text-center h-full">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 mb-3">
              <HugeiconsIcon icon={ChartColumnIncreasingIcon} size={24} className="text-primary" />
            </div>
            <div className="flex gap-2 items-center text-lg md:text-xl font-bold font-heading text-foreground">
              <span className="text-chart-2">{matchStats.wins}V</span> - 
              <span className="text-muted-foreground">{matchStats.draws}N</span> - 
              <span className="text-chart-5">{matchStats.losses}D</span>
            </div>
            <div className="text-xs md:text-sm text-muted-foreground font-medium mt-1">Bilan saison</div>
            <div className="text-[10px] text-muted-foreground mt-1 opacity-80">{matchStats.winRate}% de victoires</div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 2 : GRAPHIQUES */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        
        {/* Evolution des buts */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution de l'efficacité</CardTitle>
            <CardDescription>Tirs et buts marqués au fil de la saison</CardDescription>
          </CardHeader>
          <CardContent>
            {matchStats.evolutionData.length > 0 ? (
              <ChartContainer config={chartConfigEvolution} className="h-[300px] w-full">
                <LineChart data={matchStats.evolutionData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="matchName" 
                    tickLine={false} 
                    axisLine={false} 
                    fontSize={10} 
                    tickFormatter={(value) => value.split(' ')[0]} // Affiche juste "J1", "J2"
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={10} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line 
                    type="linear" 
                    dataKey="Tirs" 
                    stroke="var(--color-chart-5)" 
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--color-chart-5)", strokeWidth: 0 }}
                  />
                  <Line 
                    type="linear" 
                    dataKey="Buts" 
                    stroke="var(--color-chart-3)" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: "var(--color-chart-3)", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                Aucun match enregistré.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Buteurs */}
        <Card>
          <CardHeader>
            <CardTitle>Meilleurs buteurs</CardTitle>
            <CardDescription>Top 10 des buteurs de l'équipe</CardDescription>
          </CardHeader>
          <CardContent>
            {playerStats.topScorers.length > 0 && playerStats.topScorers[0].goals > 0 ? (
              <ChartContainer config={chartConfigScorers} className="w-full aspect-auto" style={{ height: `${Math.max(300, playerStats.topScorers.length * 40 + 50)}px` }}>
                <BarChart data={playerStats.topScorers} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-border)" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tickLine={false} 
                    axisLine={false} 
                    width={100} 
                    fontSize={11} 
                    tick={{ fill: 'var(--color-foreground)' }} 
                  />
                  <ChartTooltip cursor={{ fill: 'var(--color-muted)', opacity: 0.2 }} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="goals" fill="var(--color-chart-3)" radius={[0, 4, 4, 0]} barSize={24}>
                    <LabelList dataKey="goals" position="right" fill="var(--color-foreground)" fontSize={11} fontWeight={600} />
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                Aucun buteur enregistré.
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
