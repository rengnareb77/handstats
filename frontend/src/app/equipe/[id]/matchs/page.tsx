"use client";

import { useState, use } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Add01Icon,
  Calendar01Icon,
  ChevronRightIcon,
  Sun02Icon,
  Moon02Icon,
  Home01Icon,
  AirplaneTakeOff01Icon,
  CloudUploadIcon,
  Link04Icon,
} from "@hugeicons/core-free-icons";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTheme } from "@/components/theme-provider";

/* ─── Données factices ─── */
const MOCK_MATCHES = [
  {
    id: "m1",
    opponent: "US Créteil",
    date: "2026-09-20",
    score: { home: 32, away: 28 },
    result: "win" as const,
    location: "Domicile",
  },
  {
    id: "m2",
    opponent: "Chambéry SMB",
    date: "2026-09-13",
    score: { home: 25, away: 27 },
    result: "loss" as const,
    location: "Extérieur",
  },
  {
    id: "m3",
    opponent: "Limoges Hand 87",
    date: "2026-09-06",
    score: { home: 30, away: 30 },
    result: "draw" as const,
    location: "Domicile",
  },
  {
    id: "m4",
    opponent: "HBC Nantes",
    date: "2026-08-30",
    score: { home: 34, away: 29 },
    result: "win" as const,
    location: "Domicile",
  },
  {
    id: "m5",
    opponent: "Montpellier HB",
    date: "2026-08-23",
    score: { home: 26, away: 31 },
    result: "loss" as const,
    location: "Extérieur",
  },
];

const RESULT_CONFIG = {
  win: { label: "V", className: "bg-chart-1/15 text-chart-1" },
  loss: { label: "D", className: "bg-destructive/15 text-destructive" },
  draw: { label: "N", className: "bg-chart-2/15 text-chart-2" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Page matchs — liste des matchs d'une équipe.
 */
export default function MatchsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [location, setLocation] = useState<"home" | "away">("home");

  return (
    <main className="flex-1 flex flex-col min-h-dvh">
      {/* ─── Header ─── */}
      <Header backHref={`/equipe/${id}`} title="Matchs" />

      {/* ─── Content ─── */}
      <section className="flex-1 flex flex-col px-5 pt-6 pb-8">
        {/* ─── Add Match Button ─── */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button
                variant="outline"
                className="w-full gap-2 border-dashed border-2 text-muted-foreground hover:text-primary hover:border-primary/40 h-12 rounded-2xl mb-5"
              >
                <HugeiconsIcon icon={Add01Icon} size={18} />
                Ajouter un match
              </Button>
            }
          />

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau match</DialogTitle>
              <DialogDescription>
                Importez la feuille de match pour ajouter une rencontre.
              </DialogDescription>
            </DialogHeader>

            <form
              className="flex flex-col gap-5 py-4"
              onSubmit={(e) => {
                e.preventDefault();
                setDialogOpen(false);
              }}
            >
              {/* Nom adversaire */}
              <div className="flex flex-col gap-2.5">
                <Label htmlFor="opponent">Équipe adverse</Label>
                <Input
                  id="opponent"
                  placeholder="Ex: US Créteil"
                  required
                />
              </div>

              {/* Domicile / Extérieur */}
              <div className="flex flex-col gap-2.5">
                <Label>Lieu du match</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={location === "home" ? "default" : "outline"}
                    className="gap-2"
                    onClick={() => setLocation("home")}
                  >
                    <HugeiconsIcon icon={Home01Icon} size={16} />
                    Domicile
                  </Button>
                  <Button
                    type="button"
                    variant={location === "away" ? "default" : "outline"}
                    className="gap-2"
                    onClick={() => setLocation("away")}
                  >
                    <HugeiconsIcon icon={AirplaneTakeOff01Icon} size={16} />
                    Extérieur
                  </Button>
                </div>
              </div>

              {/* Feuille de match — Upload ou Lien */}
              <div className="flex flex-col gap-2.5">
                <Label>Feuille de match (PDF)</Label>
                <Tabs defaultValue="upload">
                  <TabsList className="w-full">
                    <TabsTrigger value="upload" className="gap-1.5">
                      <HugeiconsIcon icon={CloudUploadIcon} size={14} />
                      Importer
                    </TabsTrigger>
                    <TabsTrigger value="link" className="gap-1.5">
                      <HugeiconsIcon icon={Link04Icon} size={14} />
                      Lien
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload">
                    <label
                      htmlFor="pdf-upload"
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-6 cursor-pointer transition-colors hover:border-primary/40 hover:bg-muted/30"
                    >
                      <HugeiconsIcon
                        icon={CloudUploadIcon}
                        size={28}
                        className="text-muted-foreground/60"
                      />
                      <span className="text-sm text-muted-foreground">
                        Cliquez ou glissez un fichier PDF
                      </span>
                      <input
                        id="pdf-upload"
                        type="file"
                        accept=".pdf"
                        className="sr-only"
                      />
                    </label>
                  </TabsContent>
                  <TabsContent value="link">
                    <Input
                      type="url"
                      placeholder="https://exemple.com/feuille-de-match.pdf"
                    />
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter className="mt-2 sm:mt-4">
                <DialogClose
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      Annuler
                    </Button>
                  }
                />
                <Button type="submit" className="w-full sm:w-auto">
                  Ajouter le match
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ─── Match List ─── */}
        <div className="flex flex-col gap-3">
          {MOCK_MATCHES.map((match) => {
            const result = RESULT_CONFIG[match.result];

            return (
              <Link key={match.id} href={`/equipe/${id}/matchs/${match.id}`}>
                <Card
                  size="sm"
                  className="group cursor-pointer transition-all duration-200 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 px-4 py-2">
                    {/* Result badge */}
                    <div
                      className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold ${result.className}`}
                    >
                      {result.label}
                    </div>

                    {/* Match info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-card-foreground truncate">
                        {match.opponent}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <HugeiconsIcon
                          icon={Calendar01Icon}
                          size={12}
                          className="text-muted-foreground/60"
                        />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(match.date)}
                        </span>
                        <span className="text-muted-foreground/30">·</span>
                        <span className="text-xs text-muted-foreground">
                          {match.location}
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    <span className="shrink-0 text-sm font-bold font-heading text-foreground tabular-nums">
                      {match.score.home} - {match.score.away}
                    </span>

                    {/* Chevron */}
                    <HugeiconsIcon
                      icon={ChevronRightIcon}
                      size={16}
                      className="shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors"
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
