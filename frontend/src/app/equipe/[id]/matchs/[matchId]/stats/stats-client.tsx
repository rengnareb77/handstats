"use client";

import { useState } from "react";
import { Match } from "@/types/match.types";
import { Team } from "@/types/team.types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BackButton } from "@/components/back-button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LabelList, PieChart, Pie, Cell, Label, LineChart, Line, ReferenceLine } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function StatsClient({ match, teamId, team, matchId }: { match: Match; teamId: string; team: Team; matchId: string }) {
  const isHome = match.isHome !== undefined ? match.isHome : match.homeTeamName === team.name;
  const [teamFilter, setTeamFilter] = useState<"HOME" | "AWAY">(isHome ? "HOME" : "AWAY");

  const players = teamFilter === "HOME" ? match.homeTeamPlayers : match.awayTeamPlayers;

  // Préparation des données pour le graphique : Joueurs avec au moins 1 tir ou 1 but
  const chartData = players
    .filter(p => p.shot > 0 || p.goal > 0 || p.sevenMeter > 0)
    .map(p => {
      const buts = p.goal;
      // p.shot est le total de tirs, donc les ratés = total - buts
      const totalTirs = Math.max(p.shot, buts);
      const rates = totalTirs - buts;

      return {
        fullName: p.fullName,
        name: p.fullName,
        Buts: buts,
        Ratés: rates,
        total: totalTirs,
      };
    })
    .sort((a, b) => b.total - a.total); // Trier par nombre de tirs totaux

  const chartConfig = {
    Buts: {
      label: "Buts",
      color: "var(--color-chart-3)",
    },
    Ratés: {
      label: "Tirs ratés",
      color: "var(--color-chart-5)",
    },
  };

  // --- Répartition des BUTS par joueur ---
  const teamTotalGoals = players.reduce((acc, p) => acc + p.goal, 0);
  const goalsPieDataRaw = players
    .filter(p => p.goal > 0)
    .map(p => ({
      name: p.fullName,
      count: p.goal,
      percentage: teamTotalGoals > 0 ? Number((p.goal / teamTotalGoals * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.count - a.count);

  type PieData = { name: string; count: number; percentage: number; shortName?: string; fill?: string };
  let goalsPieData: PieData[] = goalsPieDataRaw.length > 5 ? goalsPieDataRaw.slice(0, 5) : [...goalsPieDataRaw];
  if (goalsPieDataRaw.length > 5) {
    const othersCount = goalsPieDataRaw.slice(5).reduce((sum, p) => sum + p.count, 0);
    if (othersCount > 0) {
      goalsPieData.push({
        name: "Autres",
        count: othersCount,
        percentage: teamTotalGoals > 0 ? Number(((othersCount / teamTotalGoals) * 100).toFixed(1)) : 0
      });
    }
  }
  goalsPieData = goalsPieData.map((d, i) => ({
    ...d,
    shortName: d.name === "Autres" ? "Autres" : d.name.split(" ").pop(),
    fill: d.name === "Autres" ? "var(--muted)" : `var(--chart-${(i % 5) + 1})`
  }));
  const goalsPieConfig = goalsPieData.reduce((acc, curr) => {
    acc[curr.name] = { label: curr.name };
    return acc;
  }, {} as Record<string, { label: string }>);

  // --- Répartition des TIRS par joueur ---
  const teamTotalShots = players.reduce((acc, p) => acc + Math.max(p.shot, p.goal), 0);
  const shotsPieDataRaw = players
    .filter(p => Math.max(p.shot, p.goal) > 0)
    .map(p => {
      const totalTirs = Math.max(p.shot, p.goal);
      return {
        name: p.fullName,
        count: totalTirs,
        percentage: teamTotalShots > 0 ? Number(((totalTirs / teamTotalShots) * 100).toFixed(1)) : 0
      };
    })
    .sort((a, b) => b.count - a.count);

  let shotsPieData: PieData[] = shotsPieDataRaw.length > 5 ? shotsPieDataRaw.slice(0, 5) : [...shotsPieDataRaw];
  if (shotsPieDataRaw.length > 5) {
    const othersCount = shotsPieDataRaw.slice(5).reduce((sum, p) => sum + p.count, 0);
    if (othersCount > 0) {
      shotsPieData.push({
        name: "Autres",
        count: othersCount,
        percentage: teamTotalShots > 0 ? Number(((othersCount / teamTotalShots) * 100).toFixed(1)) : 0
      });
    }
  }
  shotsPieData = shotsPieData.map((d, i) => ({
    ...d,
    shortName: d.name === "Autres" ? "Autres" : d.name.split(" ").pop(),
    fill: d.name === "Autres" ? "var(--muted)" : `var(--chart-${(i % 5) + 1})`
  }));
  const shotsPieConfig = shotsPieData.reduce((acc, curr) => {
    acc[curr.name] = { label: curr.name };
    return acc;
  }, {} as Record<string, { label: string }>);

  // --- Données pour la Timeline (Évolution du score) ---
  const timelineData = [{
    timeStr: "00:00",
    minute: 0,
    [match.homeTeamName]: 0,
    [match.awayTeamName]: 0
  }];
  let runningHome = 0;
  let runningAway = 0;

  const sortedEvents = [...match.events].sort((a, b) => {
    const [aM, aS] = (a.time || "00:00").split(":").map(Number);
    const [bM, bS] = (b.time || "00:00").split(":").map(Number);
    return (aM * 60 + aS) - (bM * 60 + bS);
  });

  sortedEvents.forEach(e => {
    if (e.type === "GOAL" || e.type === "SEVEN_METER") {
      if (e.team === "HOME") runningHome++;
      else runningAway++;

      const [m, s] = (e.time || "00:00").split(":");
      timelineData.push({
        timeStr: e.time,
        minute: Number(m) + Number(s) / 60,
        [match.homeTeamName]: runningHome,
        [match.awayTeamName]: runningAway,
      });
    }
  });

  const timeouts = sortedEvents.filter(e => e.type === "TIMEOUT").map(e => {
    const [m, s] = (e.time || "00:00").split(":");
    return {
      minute: Number(m) + Number(s) / 60,
      team: e.team,
      timeStr: e.time
    };
  });

  const timelineConfig = {
    [match.homeTeamName]: { label: match.homeTeamName, color: "var(--color-primary)" },
    [match.awayTeamName]: { label: match.awayTeamName, color: "var(--color-chart-5)" }
  };

  return (
    <Tabs defaultValue="players" urlParam="tab" className="flex-1 flex flex-col">
      {/* HEADER COMPACT ET COLLANT */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border pb-3 pt-3 px-5 mb-4 flex flex-col gap-4">

        {/* Ligne du haut: Retour, Titres et Filtre équipes */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

          {/* Retour et Titre */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <BackButton href={`/equipe/${teamId}/matchs/${matchId}?tab=stats`} />
            <div className="leading-tight min-w-0 flex-1">
              <h1 className="text-lg font-bold tracking-tight font-heading truncate">Statistiques</h1>
              <p className="text-[11px] text-muted-foreground truncate">{match.homeTeamName} - {match.awayTeamName}</p>
            </div>
          </div>

          {/* Filtre des équipes */}
          <div className="flex bg-muted/50 p-1 rounded-xl shrink-0">
            <button
              className={`flex-1 md:flex-none md:px-6 text-[11px] py-1.5 rounded-lg font-bold uppercase transition-all truncate px-2 ${teamFilter === "HOME" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setTeamFilter("HOME")}
            >
              {match.homeTeamName}
            </button>
            <button
              className={`flex-1 md:flex-none md:px-6 text-[11px] py-1.5 rounded-lg font-bold uppercase transition-all truncate px-2 ${teamFilter === "AWAY" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setTeamFilter("AWAY")}
            >
              {match.awayTeamName}
            </button>
          </div>
        </div>

        {/* Onglets intégrés dans le header */}
        <TabsList className="w-full h-9">
          <TabsTrigger value="players" className="flex-1 text-xs">Joueurs</TabsTrigger>
          <TabsTrigger value="timeline" className="flex-1 text-xs">Timeline</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="players" className="flex-1 px-2 md:px-4 pb-4 md:pb-6 mt-0">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Colonne gauche (2/3 de l'espace sur desktop) : Graphique en barres */}
          <div className="xl:col-span-2">
            <Card className="xl:h-full">
              <CardHeader className="">
                <CardTitle>Efficacité aux tirs</CardTitle>
                <CardDescription>Répartition des buts et tirs ratés par joueur</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full">
                  <ChartContainer config={chartConfig} className="w-full aspect-auto" style={{ height: `${Math.max(400, chartData.length * 45 + 80)}px` }}>
                    <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-border)" />
                      <XAxis
                        type="number"
                        tickLine={false}
                        axisLine={false}
                        fontSize={10}
                        tick={{ fill: 'var(--color-muted-foreground)' }}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        width={110}
                        fontSize={11}
                        tick={{ fill: 'var(--color-foreground)', fontWeight: 600 }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Bar dataKey="Buts" stackId="a" fill="var(--color-Buts)" radius={[0, 0, 0, 0]} barSize={24}>
                        <LabelList
                          dataKey="total"
                          content={(props: any) => {
                            const { x, y, width, height, value, index } = props;
                            if (chartData[index]?.Ratés > 0) return null;
                            return (
                              <text x={x + width + 10} y={y + height / 2} fill="var(--color-foreground)" fontSize={11} fontWeight={600} dominantBaseline="central">
                                {value}
                              </text>
                            );
                          }}
                        />
                      </Bar>
                      <Bar dataKey="Ratés" stackId="a" fill="var(--color-Ratés)" radius={[0, 4, 4, 0]} barSize={24}>
                        <LabelList dataKey="total" position="right" fill="var(--color-foreground)" fontSize={11} fontWeight={600} offset={10} />
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite (1/3 de l'espace sur desktop) : Camemberts empilés */}
          <div className="flex flex-col gap-4">
            <Card className="h-full flex flex-col">
              <CardHeader >
                <CardTitle>Impact offensif</CardTitle>
                <CardDescription>Volume de buts et tirs par joueur</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col sm:flex-row xl:flex-col xl:justify-center">

                <div className="w-full sm:w-1/2 xl:w-full">
                  <h4 className="text-xs font-semibold text-center text-foreground mb-3 uppercase tracking-wider">Répartition des Buts</h4>
                  <ChartContainer config={goalsPieConfig} className="min-h-[200px] w-full">
                    <PieChart margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                      <Pie
                        data={goalsPieData}
                        dataKey="percentage"
                        nameKey="name"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={2}
                        strokeWidth={0}
                        label={({ cx, cy, midAngle = 0, outerRadius = 0, value, index }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = Number(outerRadius) * 1.35;
                          const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
                          const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);
                          return (
                            <text x={x} y={y} fill="var(--color-foreground)" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight={500}>
                              {goalsPieData[index].shortName} ({value.toFixed(0)}%)
                            </text>
                          );
                        }}
                      >
                        {goalsPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold font-heading">
                                    {teamTotalGoals}
                                  </tspan>
                                  <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-[10px] font-medium uppercase tracking-wider">
                                    Buts
                                  </tspan>
                                </text>
                              )
                            }
                          }}
                        />
                      </Pie>
                      <ChartTooltip
                        content={<ChartTooltipContent formatter={(value: any, name: any, item: any) => (
                          <>
                            <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: item.payload.fill }} />
                            <div className="flex flex-1 justify-between items-center leading-none gap-4">
                              <span className="text-muted-foreground">{name}</span>
                              <span className="font-mono font-medium text-foreground tabular-nums">{value}%</span>
                            </div>
                          </>
                        )} />}
                      />
                    </PieChart>
                  </ChartContainer>
                </div>

                <div className="w-full sm:w-1/2 xl:w-full sm:mt-0 xl:mt-4">
                  <h4 className="text-xs font-semibold text-center text-foreground uppercase tracking-wider">Volume de Tirs</h4>
                  <ChartContainer config={shotsPieConfig} className="min-h-[200px] w-full">
                    <PieChart margin={{ top: 30, right: 30, left: 30, bottom: 0 }}>
                      <Pie
                        data={shotsPieData}
                        dataKey="percentage"
                        nameKey="name"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={2}
                        strokeWidth={0}
                        label={({ cx, cy, midAngle = 0, outerRadius = 0, value, index }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = Number(outerRadius) * 1.35;
                          const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
                          const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);
                          return (
                            <text x={x} y={y} fill="var(--color-foreground)" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight={500}>
                              {shotsPieData[index].shortName} ({value.toFixed(0)}%)
                            </text>
                          );
                        }}
                      >
                        {shotsPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold font-heading">
                                    {teamTotalShots}
                                  </tspan>
                                  <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-[10px] font-medium uppercase tracking-wider">
                                    Tirs
                                  </tspan>
                                </text>
                              )
                            }
                          }}
                        />
                      </Pie>
                      <ChartTooltip
                        content={<ChartTooltipContent formatter={(value: any, name: any, item: any) => (
                          <>
                            <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: item.payload.fill }} />
                            <div className="flex flex-1 justify-between items-center leading-none gap-4">
                              <span className="text-muted-foreground">{name}</span>
                              <span className="font-mono font-medium text-foreground tabular-nums">{value}%</span>
                            </div>
                          </>
                        )} />}
                      />
                    </PieChart>
                  </ChartContainer>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="timeline" className="flex-1 px-2 md:px-4 pb-4 md:pb-6 mt-0">
        <Card>
          <CardHeader className="p-3 md:p-5 pb-0">
            <CardTitle>Évolution du score</CardTitle>
            <CardDescription>Progression du match en fonction du temps</CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-4 pt-0">
            <div className="w-full sm:max-w-4xl mx-auto">
              <ChartContainer config={timelineConfig} className="min-h-[400px] w-full">
                <LineChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <ReferenceLine
                    x={30}
                    stroke="var(--color-muted-foreground)"
                    strokeDasharray="3 3"
                    opacity={0.5}
                    label={{
                      position: 'insideTopLeft',
                      value: 'Mi-temps',
                      fill: 'var(--color-muted-foreground)',
                      fontSize: 10,
                      offset: 10
                    }}
                  />
                  {timeouts.map((t, idx) => (
                    <ReferenceLine
                      key={`timeout-${idx}`}
                      x={t.minute}
                      stroke={t.team === "HOME" ? "var(--color-primary)" : "var(--color-chart-5)"}
                      strokeDasharray="3 3"
                      opacity={0.6}
                      label={{
                        position: t.team === "HOME" ? 'insideTopLeft' : 'insideTopRight',
                        value: t.team === "HOME" ? 'Temps Mort Rec.' : 'Temps Mort Vis.',
                        fill: t.team === "HOME" ? "var(--color-primary)" : "var(--color-chart-5)",
                        fontSize: 9,
                        offset: 10,
                        dy: t.team === "HOME" ? 15 : 28
                      }}
                    />
                  ))}
                  <XAxis
                    dataKey="minute"
                    type="number"
                    domain={[0, 60]} // Assumes a standard 60-minute match
                    ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]}
                    tickLine={false}
                    axisLine={false}
                    fontSize={10}
                    tick={{ fill: 'var(--color-muted-foreground)' }}
                    tickFormatter={(value) => `${value}'`}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={10}
                    tick={{ fill: 'var(--color-muted-foreground)' }}
                    width={30}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                          return payload[0].payload.timeStr;
                        }
                        return label;
                      }}
                    />}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line
                    type="stepAfter"
                    dataKey={match.homeTeamName}
                    stroke="var(--color-primary)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="stepAfter"
                    dataKey={match.awayTeamName}
                    stroke="var(--color-chart-5)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
