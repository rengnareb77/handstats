import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronRightIcon } from "@hugeicons/core-free-icons";

import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { teamService } from "@/lib/services/team.services";
import { AddTeamDialog } from "@/components/add-team-dialog";
import { Team } from "@/types/team.types";

export const metadata: Metadata = {
  title: "Mes équipes | HandStats+",
  description: "Sélectionnez ou créez une équipe pour suivre ses statistiques de handball.",
};

/**
 * Page d'accueil — Mobile-first.
 * Sélection d'une équipe parmi la liste.
 * (Server Component)
 */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  let teams: Team[] = [];

  // Récupération des équipes côté serveur
  try {
    const fetchedTeams = await teamService.getAll();
    if (fetchedTeams && fetchedTeams.length > 0) {
      teams = fetchedTeams;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des équipes (SSR):", error);
  }

  return (
    <main className="flex-1 flex flex-col min-h-dvh">
      {/* ─── Header ─── */}
      <Header
        className="py-5"
        leftContent={
          <h1 className="text-xl font-bold tracking-tight font-heading">
            <span className="text-primary">Hand</span>
            <span className="text-foreground">Stats</span>
            <span className="text-muted-foreground text-sm font-normal ml-0.5">
              +
            </span>
          </h1>
        }
      />

      {/* ─── Content ─── */}
      <section className="flex-1 flex flex-col px-5 pb-8">
        {/* Title */}
        <div className="mb-6 mt-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
            Mes équipes
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            Sélectionnez une équipe.
          </p>
        </div>

        {/* ─── Team List ─── */}
        <div className="flex flex-col gap-3">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/equipe/${team.id}`}
              className="outline-none ring-primary focus-visible:ring-2 rounded-2xl"
            >
              <Card
                size="sm"
                className="group relative cursor-pointer transition-all duration-200 ease-out hover:bg-muted/50 hover:ring-border active:scale-[0.98]"
              >
                <div className="flex items-center gap-4 px-5 py-3">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold truncate text-card-foreground tracking-tight">
                      {team.name}
                    </p>
                    <p className="text-[13px] text-muted-foreground mt-0.5 font-medium">
                      {team.championship}
                    </p>
                  </div>

                  {/* Chevron */}
                  <HugeiconsIcon
                    icon={ChevronRightIcon}
                    size={18}
                    className="shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors"
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* ─── Divider ─── */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] text-muted-foreground/60 uppercase tracking-widest font-medium">
            ou
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* ─── Add Team Button + Dialog ─── */}
        <AddTeamDialog />
      </section>
    </main>
  );
}
