"use client";

import { use } from "react";
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
import { Badge } from "@/components/ui/badge";

/* ─── Types ─── */
type Position = "Gardien" | "Pivot" | "Ailier G" | "Ailier D" | "Arrière G" | "Arrière D" | "Demi-centre";

interface PlayerStats {
  goals: number;
  shots: number;
  saves: number;
  yellowCards: number;
  twoMin: number;
  redCards: number;
  matchesPlayed: number;
  goalsPerMatch: number;
  savesPerMatch: number;
}

interface PlayerDetail {
  id: string;
  name: string;
  firstName: string;
  stats: PlayerStats;
  recentMatches: {
    id: string;
    opponent: string;
    date: string;
    goals: number;
    shots: number;
    saves: number;
    result: "win" | "loss" | "draw";
  }[];
}

/* ─── Données factices ─── */
const MOCK_PLAYERS: Record<string, PlayerDetail> = {
  p1: {
    id: "p1", name: "Dupont", firstName: "Lucas",
    stats: { goals: 0, shots: 0, saves: 87, yellowCards: 0, twoMin: 0, redCards: 0, matchesPlayed: 12, goalsPerMatch: 0, savesPerMatch: 7.3 },
    recentMatches: [
      { id: "m1", opponent: "US Créteil", date: "2026-09-20", goals: 0, shots: 0, saves: 9, result: "win" },
      { id: "m2", opponent: "Chambéry SMB", date: "2026-09-13", goals: 0, shots: 0, saves: 7, result: "loss" },
      { id: "m3", opponent: "Montpellier HB", date: "2026-09-06", goals: 0, shots: 0, saves: 11, result: "win" },
      { id: "m4", opponent: "PSG Handball", date: "2026-08-30", goals: 0, shots: 0, saves: 5, result: "loss" },
      { id: "m5", opponent: "Nantes HB", date: "2026-08-23", goals: 0, shots: 0, saves: 8, result: "win" },
    ],
  },
  p2: {
    id: "p2", name: "Martin", firstName: "Hugo",
    stats: { goals: 42, shots: 68, saves: 0, yellowCards: 3, twoMin: 1, redCards: 0, matchesPlayed: 11, goalsPerMatch: 3.8, savesPerMatch: 0 },
    recentMatches: [
      { id: "m1", opponent: "US Créteil", date: "2026-09-20", goals: 5, shots: 7, saves: 0, result: "win" },
      { id: "m2", opponent: "Chambéry SMB", date: "2026-09-13", goals: 3, shots: 6, saves: 0, result: "loss" },
      { id: "m3", opponent: "Montpellier HB", date: "2026-09-06", goals: 4, shots: 5, saves: 0, result: "win" },
      { id: "m4", opponent: "PSG Handball", date: "2026-08-30", goals: 2, shots: 5, saves: 0, result: "loss" },
      { id: "m5", opponent: "Nantes HB", date: "2026-08-23", goals: 6, shots: 8, saves: 0, result: "win" },
    ],
  },
  p3: {
    id: "p3", name: "Garcia", firstName: "Thomas",
    stats: { goals: 31, shots: 45, saves: 0, yellowCards: 1, twoMin: 0, redCards: 0, matchesPlayed: 12, goalsPerMatch: 2.6, savesPerMatch: 0 },
    recentMatches: [
      { id: "m1", opponent: "US Créteil", date: "2026-09-20", goals: 3, shots: 4, saves: 0, result: "win" },
      { id: "m2", opponent: "Chambéry SMB", date: "2026-09-13", goals: 2, shots: 3, saves: 0, result: "loss" },
      { id: "m3", opponent: "Montpellier HB", date: "2026-09-06", goals: 4, shots: 5, saves: 0, result: "win" },
    ],
  },
  p4: {
    id: "p4", name: "Bernard", firstName: "Nathan",
    stats: { goals: 28, shots: 39, saves: 0, yellowCards: 4, twoMin: 2, redCards: 0, matchesPlayed: 10, goalsPerMatch: 2.8, savesPerMatch: 0 },
    recentMatches: [
      { id: "m1", opponent: "US Créteil", date: "2026-09-20", goals: 4, shots: 5, saves: 0, result: "win" },
      { id: "m2", opponent: "Chambéry SMB", date: "2026-09-13", goals: 2, shots: 4, saves: 0, result: "loss" },
      { id: "m3", opponent: "Montpellier HB", date: "2026-09-06", goals: 3, shots: 4, saves: 0, result: "win" },
    ],
  },
  p5: {
    id: "p5", name: "Petit", firstName: "Léo",
    stats: { goals: 38, shots: 56, saves: 0, yellowCards: 2, twoMin: 1, redCards: 0, matchesPlayed: 12, goalsPerMatch: 3.2, savesPerMatch: 0 },
    recentMatches: [
      { id: "m1", opponent: "US Créteil", date: "2026-09-20", goals: 4, shots: 6, saves: 0, result: "win" },
      { id: "m2", opponent: "Chambéry SMB", date: "2026-09-13", goals: 3, shots: 5, saves: 0, result: "loss" },
      { id: "m3", opponent: "Montpellier HB", date: "2026-09-06", goals: 5, shots: 7, saves: 0, result: "win" },
    ],
  },
  p6: {
    id: "p6", name: "Robert", firstName: "Enzo",
    stats: { goals: 35, shots: 52, saves: 0, yellowCards: 1, twoMin: 0, redCards: 0, matchesPlayed: 11, goalsPerMatch: 3.2, savesPerMatch: 0 },
    recentMatches: [
      { id: "m1", opponent: "US Créteil", date: "2026-09-20", goals: 3, shots: 5, saves: 0, result: "win" },
      { id: "m2", opponent: "Chambéry SMB", date: "2026-09-13", goals: 4, shots: 6, saves: 0, result: "loss" },
    ],
  },
  p7: {
    id: "p7", name: "Leroy", firstName: "Raphaël",
    stats: { goals: 22, shots: 34, saves: 0, yellowCards: 0, twoMin: 0, redCards: 0, matchesPlayed: 9, goalsPerMatch: 2.4, savesPerMatch: 0 },
    recentMatches: [
      { id: "m1", opponent: "US Créteil", date: "2026-09-20", goals: 2, shots: 3, saves: 0, result: "win" },
      { id: "m2", opponent: "Chambéry SMB", date: "2026-09-13", goals: 3, shots: 4, saves: 0, result: "loss" },
    ],
  },
  p8: {
    id: "p8", name: "Moreau", firstName: "Jules",
    stats: { goals: 18, shots: 28, saves: 0, yellowCards: 5, twoMin: 3, redCards: 0, matchesPlayed: 10, goalsPerMatch: 1.8, savesPerMatch: 0 },
    recentMatches: [
      { id: "m1", opponent: "US Créteil", date: "2026-09-20", goals: 2, shots: 3, saves: 0, result: "win" },
      { id: "m2", opponent: "Chambéry SMB", date: "2026-09-13", goals: 1, shots: 3, saves: 0, result: "loss" },
    ],
  },
  p9: {
    id: "p9", name: "Simon", firstName: "Adam",
    stats: { goals: 15, shots: 24, saves: 0, yellowCards: 1, twoMin: 0, redCards: 0, matchesPlayed: 8, goalsPerMatch: 1.9, savesPerMatch: 0 },
    recentMatches: [
      { id: "m1", opponent: "US Créteil", date: "2026-09-20", goals: 2, shots: 4, saves: 0, result: "win" },
    ],
  },
  p10: {
    id: "p10", name: "Laurent", firstName: "Ethan",
    stats: { goals: 0, shots: 0, saves: 42, yellowCards: 0, twoMin: 0, redCards: 0, matchesPlayed: 6, goalsPerMatch: 0, savesPerMatch: 7.0 },
    recentMatches: [
      { id: "m4", opponent: "PSG Handball", date: "2026-08-30", goals: 0, shots: 0, saves: 6, result: "loss" },
      { id: "m5", opponent: "Nantes HB", date: "2026-08-23", goals: 0, shots: 0, saves: 9, result: "win" },
    ],
  },
  p11: {
    id: "p11", name: "Dubois", firstName: "Mathis",
    stats: { goals: 12, shots: 20, saves: 0, yellowCards: 2, twoMin: 1, redCards: 0, matchesPlayed: 7, goalsPerMatch: 1.7, savesPerMatch: 0 },
    recentMatches: [
      { id: "m1", opponent: "US Créteil", date: "2026-09-20", goals: 1, shots: 2, saves: 0, result: "win" },
    ],
  },
  p12: {
    id: "p12", name: "Roux", firstName: "Maxime",
    stats: { goals: 8, shots: 14, saves: 0, yellowCards: 0, twoMin: 0, redCards: 0, matchesPlayed: 5, goalsPerMatch: 1.6, savesPerMatch: 0 },
    recentMatches: [
      { id: "m3", opponent: "Montpellier HB", date: "2026-09-06", goals: 2, shots: 3, saves: 0, result: "win" },
    ],
  },
  p13: {
    id: "p13", name: "Fournier", firstName: "Axel",
    stats: { goals: 6, shots: 11, saves: 0, yellowCards: 1, twoMin: 0, redCards: 0, matchesPlayed: 6, goalsPerMatch: 1.0, savesPerMatch: 0 },
    recentMatches: [
      { id: "m2", opponent: "Chambéry SMB", date: "2026-09-13", goals: 1, shots: 2, saves: 0, result: "loss" },
    ],
  },
  p14: {
    id: "p14", name: "Girard", firstName: "Louis",
    stats: { goals: 4, shots: 8, saves: 0, yellowCards: 0, twoMin: 0, redCards: 0, matchesPlayed: 4, goalsPerMatch: 1.0, savesPerMatch: 0 },
    recentMatches: [],
  },
  p15: {
    id: "p15", name: "Bonnet", firstName: "Sacha",
    stats: { goals: 5, shots: 9, saves: 0, yellowCards: 2, twoMin: 1, redCards: 0, matchesPlayed: 5, goalsPerMatch: 1.0, savesPerMatch: 0 },
    recentMatches: [],
  },
  p16: {
    id: "p16", name: "Lambert", firstName: "Noah",
    stats: { goals: 3, shots: 7, saves: 0, yellowCards: 0, twoMin: 0, redCards: 0, matchesPlayed: 3, goalsPerMatch: 1.0, savesPerMatch: 0 },
    recentMatches: [],
  },
};

/* ─── Helpers ─── */
const POSITION_COLORS: Record<Position, string> = {
  "Gardien": "bg-chart-5/15 text-chart-5",
  "Pivot": "bg-chart-4/15 text-chart-4",
  "Ailier G": "bg-chart-1/15 text-chart-1",
  "Ailier D": "bg-chart-1/15 text-chart-1",
  "Arrière G": "bg-chart-2/15 text-chart-2",
  "Arrière D": "bg-chart-2/15 text-chart-2",
  "Demi-centre": "bg-primary/15 text-primary",
};

const RESULT_COLORS = {
  win: "text-chart-1",
  loss: "text-destructive",
  draw: "text-muted-foreground",
};

/**
 * Page détail joueur — statistiques individuelles.
 */
export default function JoueurDetailPage({
  params,
}: {
  params: Promise<{ id: string; joueurId: string }>;
}) {
  const { id, joueurId } = use(params);
  const player = MOCK_PLAYERS[joueurId];

  if (!player) {
    return (
      <main className="flex-1 flex flex-col min-h-dvh">
        <Header backHref={`/equipe/${id}/joueurs`} title="Joueur introuvable" />
        <section className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Ce joueur n&apos;existe pas.</p>
        </section>
      </main>
    );
  }

  const isGoalkeeper = player.stats.saves > 0 && player.stats.goals === 0;
  const precision = player.stats.shots > 0
    ? Math.round((player.stats.goals / player.stats.shots) * 100)
    : null;

  return (
    <main className="flex-1 flex flex-col min-h-dvh">
      {/* ─── Header ─── */}
      <Header
        backHref={`/equipe/${id}/joueurs`}
        title={`${player.firstName} ${player.name}`}
      />

      {/* ─── Content ─── */}
      <section className="flex-1 flex flex-col px-5 pt-6 pb-8 gap-6">
        {/* ─── Player Identity ─── */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarFallback className="bg-muted text-foreground font-heading font-bold text-xl uppercase">
              {player.firstName[0]}{player.name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-foreground font-heading">
              {player.firstName} {player.name}
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
                  {player.stats.matchesPlayed}
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
                  {isGoalkeeper ? player.stats.saves : player.stats.goals}
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
                    ? player.stats.savesPerMatch.toFixed(1)
                    : player.stats.goalsPerMatch.toFixed(1)}
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
                    <HugeiconsIcon icon={UserGroupIcon} size={20} className="text-chart-3" />
                  </div>
                  <span className="text-2xl font-bold text-foreground font-heading">
                    {player.stats.saves}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Arrêts totaux
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
                    {player.stats.yellowCards}
                  </span>
                  <p className="text-[11px] text-muted-foreground">🟡 Jaunes</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <span className="text-lg font-bold text-foreground font-heading">
                    {player.stats.twoMin}
                  </span>
                  <p className="text-[11px] text-muted-foreground">⏱️ 2 min</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <span className="text-lg font-bold text-foreground font-heading">
                    {player.stats.redCards}
                  </span>
                  <p className="text-[11px] text-muted-foreground">🔴 Rouges</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Recent Matches ─── */}
        {player.recentMatches.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Derniers matchs
            </h3>
            <Card size="sm">
              <div className="divide-y divide-border">
                {player.recentMatches.map((match) => {
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
                          {new Date(match.date).toLocaleDateString("fr-FR", {
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
