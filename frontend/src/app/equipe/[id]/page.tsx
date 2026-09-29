"use client";

import Link from "next/link";
import { use } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
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

/* ─── Données factices ─── */
const MOCK_STATS = {
  matches: 12,
  players: 16,
  totalGoals: 247,
  precision: 62,
};

/**
 * Page équipe — route dynamique /equipe/[id].
 * Affiche les statistiques brutes et la navigation vers matchs/joueurs.
 */
export default function EquipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <main className="flex-1 flex flex-col min-h-dvh">
      {/* ─── Header ─── */}
      <Header backHref="/" title={<span className="uppercase">{id}</span>} />

      {/* ─── Content ─── */}
      <section className="flex-1 flex flex-col px-5 pt-6 pb-8 gap-6">
        {/* ─── Stats Grid ─── */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Statistiques
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Matchs */}
            <Card size="sm">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <HugeiconsIcon
                    icon={FootballPitchIcon}
                    size={20}
                    className="text-primary"
                  />
                </div>
                <span className="text-2xl font-bold text-foreground font-heading">
                  {MOCK_STATS.matches}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Matchs
                </span>
              </CardContent>
            </Card>

            {/* Joueurs */}
            <Card size="sm">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <HugeiconsIcon
                    icon={UserGroupIcon}
                    size={20}
                    className="text-primary"
                  />
                </div>
                <span className="text-2xl font-bold text-foreground font-heading">
                  {MOCK_STATS.players}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Joueurs
                </span>
              </CardContent>
            </Card>

            {/* Total buts */}
            <Card size="sm">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-chart-2/10">
                  <HugeiconsIcon
                    icon={Target01Icon}
                    size={20}
                    className="text-chart-2"
                  />
                </div>
                <span className="text-2xl font-bold text-foreground font-heading">
                  {MOCK_STATS.totalGoals}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Buts
                </span>
              </CardContent>
            </Card>

            {/* Précision */}
            <Card size="sm">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-chart-2/10">
                  <HugeiconsIcon
                    icon={DartIcon}
                    size={20}
                    className="text-chart-2"
                  />
                </div>
                <span className="text-2xl font-bold text-foreground font-heading">
                  {MOCK_STATS.precision}%
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Précision
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Voir plus */}
          <Link href={`/equipe/${id}/stats`} className="mt-3">
            <Button
              variant="ghost"
              className="w-full gap-2 text-muted-foreground hover:text-foreground"
            >
              <HugeiconsIcon icon={ChartColumnIncreasingIcon} size={16} />
              Voir plus de stats
              <HugeiconsIcon icon={ChevronRightIcon} size={14} />
            </Button>
          </Link>
        </div>

        {/* ─── Navigation ─── */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Navigation
          </h2>
          <div className="flex flex-col gap-3">
            {/* Matchs */}
            <Link href={`/equipe/${id}/matchs`}>
              <Card
                size="sm"
                className="group cursor-pointer transition-all duration-200 hover:bg-muted/50"
              >
                <div className="flex items-center gap-4 px-4 py-2">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10">
                    <HugeiconsIcon
                      icon={FootballPitchIcon}
                      size={22}
                      className="text-primary"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-card-foreground">
                      Matchs
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Historique et détails des rencontres
                    </p>
                  </div>
                  <HugeiconsIcon
                    icon={ChevronRightIcon}
                    size={18}
                    className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors"
                  />
                </div>
              </Card>
            </Link>

            {/* Joueurs */}
            <Link href={`/equipe/${id}/joueurs`}>
              <Card
                size="sm"
                className="group cursor-pointer transition-all duration-200 hover:bg-muted/50"
              >
                <div className="flex items-center gap-4 px-4 py-2">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-chart-2/10">
                    <HugeiconsIcon
                      icon={UserMultipleIcon}
                      size={22}
                      className="text-chart-2"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-card-foreground">
                      Joueurs
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Effectif et statistiques individuelles
                    </p>
                  </div>
                  <HugeiconsIcon
                    icon={ChevronRightIcon}
                    size={18}
                    className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors"
                  />
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
