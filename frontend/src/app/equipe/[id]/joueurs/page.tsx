"use client";

import { use } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChevronRightIcon,
  Target01Icon,
  DartIcon,
} from "@hugeicons/core-free-icons";

import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

/* ─── Types ─── */
type Position = "Gardien" | "Pivot" | "Ailier G" | "Ailier D" | "Arrière G" | "Arrière D" | "Demi-centre";

interface Player {
  id: string;
  name: string;
  firstName: string;
  stats: {
    goals: number;
    shots: number;
    saves: number;
    yellowCards: number;
    twoMin: number;
    matchesPlayed: number;
  };
}

/* ─── Données factices ─── */
const MOCK_PLAYERS: Player[] = [
  { id: "p1", name: "Dupont", firstName: "Lucas", stats: { goals: 0, shots: 0, saves: 87, yellowCards: 0, twoMin: 0, matchesPlayed: 12 } },
  { id: "p2", name: "Martin", firstName: "Hugo", stats: { goals: 42, shots: 68, saves: 0, yellowCards: 3, twoMin: 1, matchesPlayed: 11 } },
  { id: "p3", name: "Garcia", firstName: "Thomas", stats: { goals: 31, shots: 45, saves: 0, yellowCards: 1, twoMin: 0, matchesPlayed: 12 } },
  { id: "p4", name: "Bernard", firstName: "Nathan", stats: { goals: 28, shots: 39, saves: 0, yellowCards: 4, twoMin: 2, matchesPlayed: 10 } },
  { id: "p5", name: "Petit", firstName: "Léo", stats: { goals: 38, shots: 56, saves: 0, yellowCards: 2, twoMin: 1, matchesPlayed: 12 } },
  { id: "p6", name: "Robert", firstName: "Enzo", stats: { goals: 35, shots: 52, saves: 0, yellowCards: 1, twoMin: 0, matchesPlayed: 11 } },
  { id: "p7", name: "Leroy", firstName: "Raphaël", stats: { goals: 22, shots: 34, saves: 0, yellowCards: 0, twoMin: 0, matchesPlayed: 9 } },
  { id: "p8", name: "Moreau", firstName: "Jules", stats: { goals: 18, shots: 28, saves: 0, yellowCards: 5, twoMin: 3, matchesPlayed: 10 } },
  { id: "p9", name: "Simon", firstName: "Adam", stats: { goals: 15, shots: 24, saves: 0, yellowCards: 1, twoMin: 0, matchesPlayed: 8 } },
  { id: "p10", name: "Laurent", firstName: "Ethan", stats: { goals: 0, shots: 0, saves: 42, yellowCards: 0, twoMin: 0, matchesPlayed: 6 } },
  { id: "p11", name: "Dubois", firstName: "Mathis", stats: { goals: 12, shots: 20, saves: 0, yellowCards: 2, twoMin: 1, matchesPlayed: 7 } },
  { id: "p12", name: "Roux", firstName: "Maxime", stats: { goals: 8, shots: 14, saves: 0, yellowCards: 0, twoMin: 0, matchesPlayed: 5 } },
  { id: "p13", name: "Fournier", firstName: "Axel", stats: { goals: 6, shots: 11, saves: 0, yellowCards: 1, twoMin: 0, matchesPlayed: 6 } },
  { id: "p14", name: "Girard", firstName: "Louis", stats: { goals: 4, shots: 8, saves: 0, yellowCards: 0, twoMin: 0, matchesPlayed: 4 } },
  { id: "p15", name: "Bonnet", firstName: "Sacha", stats: { goals: 5, shots: 9, saves: 0, yellowCards: 2, twoMin: 1, matchesPlayed: 5 } },
  { id: "p16", name: "Lambert", firstName: "Noah", stats: { goals: 3, shots: 7, saves: 0, yellowCards: 0, twoMin: 0, matchesPlayed: 3 } },
];

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

/**
 * Page joueurs — liste de l'effectif d'une équipe.
 */
export default function JoueursPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  /* Trier par nom */
  const sortedPlayers = [...MOCK_PLAYERS].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="flex-1 flex flex-col min-h-dvh">
      {/* ─── Header ─── */}
      <Header backHref={`/equipe/${id}`} title="Joueurs" />

      {/* ─── Content ─── */}
      <section className="flex-1 flex flex-col px-5 pt-6 pb-8">
        {/* Effectif count */}
        <p className="text-sm text-muted-foreground mb-4">
          {MOCK_PLAYERS.length} joueurs dans l&apos;effectif
        </p>

        {/* Player list */}
        <div className="flex flex-col gap-2">
          {sortedPlayers.map((player) => {
            const isGoalkeeper = player.stats.saves > 0 && player.stats.goals === 0;
            const mainStat = isGoalkeeper ? player.stats.saves : player.stats.goals;
            const mainStatLabel = isGoalkeeper ? "arrêts" : "buts";
            const precision = player.stats.shots > 0
              ? Math.round((player.stats.goals / player.stats.shots) * 100)
              : null;

            return (
              <Link key={player.id} href={`/equipe/${id}/joueurs/${player.id}`}>
                <Card
                  size="sm"
                  className="group cursor-pointer transition-all duration-200 hover:bg-muted/50 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Avatar className="h-11 w-11 shrink-0">
                      <AvatarFallback className="bg-muted text-foreground font-heading font-bold text-sm uppercase">
                        {player.firstName[0]}{player.name[0]}
                      </AvatarFallback>
                    </Avatar>

                    {/* Player info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[15px] font-semibold text-card-foreground truncate">
                          {player.firstName} {player.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-muted-foreground">
                          {player.stats.matchesPlayed} matchs
                        </span>
                      </div>
                    </div>

                    {/* Quick stats */}
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

                    <HugeiconsIcon
                      icon={ChevronRightIcon}
                      size={18}
                      className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0"
                    />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
