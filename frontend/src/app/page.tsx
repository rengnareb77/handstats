"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AddTeamIcon,
  ChevronRightIcon,
} from "@hugeicons/core-free-icons";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

/* ─── Données factices ─── */
const MOCK_TEAMS = [
  { id: "1", name: "INAM SG", shortName: "SG", championship: "Départementale 2" },
];

/**
 * Page d'accueil — Mobile-first.
 * Sélection d'une équipe parmi la liste.
 */
export default function HomePage() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

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
          {MOCK_TEAMS.map((team) => (
            <Card
              key={team.id}
              size="sm"
              className="group relative cursor-pointer transition-all duration-200 ease-out hover:bg-muted/50 hover:ring-border active:scale-[0.98]"
              onClick={() =>
                router.push(`/equipe/${team.shortName.toLowerCase()}`)
              }
            >
              <div className="flex items-center gap-4 px-4 py-1">
                {/* Avatar */}
                <Avatar
                  size="lg"
                  className="transition-transform duration-200 group-hover:scale-105"
                >
                  <AvatarFallback className="rounded-full text-xs font-bold">
                    {team.shortName.slice(0, 3)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold truncate text-card-foreground">
                    {team.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {team.championship}
                  </p>
                </div>

                {/* Chevron */}
                <HugeiconsIcon
                  icon={ChevronRightIcon}
                  size={18}
                  className="shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors"
                />
              </div>
            </Card>
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button
                variant="outline"
                size="lg"
                className="w-full gap-3 border-dashed border-2 text-muted-foreground hover:text-primary hover:border-primary/40 h-14 rounded-2xl"
              >
                <HugeiconsIcon icon={AddTeamIcon} size={22} />
                Ajouter une équipe
              </Button>
            }
          />

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle équipe</DialogTitle>
              <DialogDescription>
                Créez une nouvelle équipe pour suivre ses statistiques.
              </DialogDescription>
            </DialogHeader>

            <form
              className="flex flex-col gap-5 py-4"
              onSubmit={(e) => {
                e.preventDefault();
                setDialogOpen(false);
              }}
            >
              <div className="flex flex-col gap-2.5">
                <Label htmlFor="name">Nom de l'équipe</Label>
                <Input id="name" placeholder="Ex: INAM SG" required />
              </div>
              <div className="flex flex-col gap-2.5">
                <Label htmlFor="championship">Championnat</Label>
                <Input id="championship" placeholder="Ex: Nationale 2" required />
              </div>

              <DialogFooter className="mt-2 sm:mt-4">
                <DialogClose
                  render={
                    <Button type="button" variant="outline" className="w-full sm:w-auto">
                      Annuler
                    </Button>
                  }
                />
                <Button type="submit" className="w-full sm:w-auto">
                  Créer l'équipe
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>
    </main>
  );
}
