"use client";

import { useState, use } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Sun02Icon,
  Moon02Icon,
  Target01Icon,
  DartIcon,
  UserGroupIcon,
  Add01Icon,
  Delete02Icon,
  Edit02Icon,
  UnfoldMoreIcon,
  Tick02Icon,
  ChevronRightIcon,
} from "@hugeicons/core-free-icons";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/* ─── Types ─── */
type EventType = "tir" | "but" | "arret" | "jaune" | "2min" | "rouge";

interface GameEvent {
  id: string;
  type: EventType;
  player: string;
  time: string;
  shotPosition?: string;
  shotType?: string;
}

const EVENT_CONFIG: Record<
  EventType,
  { label: string; emoji: string; className: string }
> = {
  tir: {
    label: "Tir",
    emoji: "🎯",
    className: "bg-primary/15 text-primary",
  },
  but: {
    label: "But",
    emoji: "⚽",
    className: "bg-chart-1/15 text-chart-1",
  },
  arret: {
    label: "Arrêt",
    emoji: "🧤",
    className: "bg-chart-3/15 text-chart-3",
  },
  jaune: {
    label: "Jaune",
    emoji: "🟡",
    className: "bg-chart-4/15 text-chart-4",
  },
  "2min": {
    label: "2 min",
    emoji: "⏱️",
    className: "bg-chart-5/15 text-chart-5",
  },
  rouge: {
    label: "Rouge",
    emoji: "🔴",
    className: "bg-destructive/15 text-destructive",
  },
};

/* ─── Données factices ─── */
const MOCK_MATCH = {
  id: "m1",
  opponent: "US Créteil",
  date: "2026-09-20",
  score: { home: 32, away: 28 },
  location: "Domicile",
};

const MOCK_PLAYERS = [
  { id: "p1", name: "Dupont" },
  { id: "p2", name: "Martin" },
  { id: "p3", name: "Garcia" },
  { id: "p4", name: "Bernard" },
  { id: "p5", name: "Petit" },
  { id: "p6", name: "Robert" },
  { id: "p7", name: "Leroy" },
  { id: "p8", name: "Moreau" },
  { id: "p9", name: "Simon" },
  { id: "p10", name: "Laurent" },
];
const MOCK_TYPES: EventType[] = ["tir", "but", "arret", "jaune", "2min", "rouge"];
const MOCK_TYPES_WEIGHTS = [0.3, 0.4, 0.2, 0.05, 0.04, 0.01]; // Probabilities for each type

function getTypeForIndex(i: number): EventType {
  const mod = i % 100;
  if (mod < 40) return "but"; // 40%
  if (mod < 70) return "tir"; // 30%
  if (mod < 90) return "arret"; // 20%
  if (mod < 95) return "jaune"; // 5%
  if (mod < 99) return "2min"; // 4%
  return "rouge"; // 1%
}

const INITIAL_EVENTS: GameEvent[] = Array.from({ length: 115 }, (_, i) => {
  const min = Math.floor((i / 115) * 60).toString().padStart(2, '0');
  const sec = (i % 60).toString().padStart(2, '0');
  return {
    id: `e${i + 1}`,
    type: getTypeForIndex(i),
    player: MOCK_PLAYERS[i % MOCK_PLAYERS.length].name,
    time: `${min}:${sec}`,
  };
}).sort((a, b) => a.time.localeCompare(b.time));

let nextId = 116;

/**
 * Page détail match — stats + faits de jeu modifiables.
 */
export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string; matchId: string }>;
}) {
  const { id } = use(params);
  const [events, setEvents] = useState<GameEvent[]>(INITIAL_EVENTS);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GameEvent | null>(null);

  // Form state
  const [formType, setFormType] = useState<EventType>("but");
  const [formPlayer, setFormPlayer] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formShotPosition, setFormShotPosition] = useState("");
  const [formShotType, setFormShotType] = useState("");

  /* ─── Handlers ─── */
  function handleAdd() {
    if (!formPlayer || !formTime) return;
    const isShotOrGoal = formType === "tir" || formType === "but";
    const newEvent: GameEvent = {
      id: `e${nextId++}`,
      type: formType,
      player: formPlayer,
      time: formTime,
      ...(isShotOrGoal ? { shotPosition: formShotPosition, shotType: formShotType } : {}),
    };
    setEvents((prev) =>
      [...prev, newEvent].sort((a, b) => a.time.localeCompare(b.time))
    );
    resetForm();
    setAddDialogOpen(false);
  }

  function handleEdit() {
    if (!editingEvent || !formPlayer || !formTime) return;
    const isShotOrGoal = formType === "tir" || formType === "but";
    setEvents((prev) =>
      prev
        .map((e) =>
          e.id === editingEvent.id
            ? { 
                ...e, 
                type: formType, 
                player: formPlayer, 
                time: formTime,
                shotPosition: isShotOrGoal ? formShotPosition : undefined,
                shotType: isShotOrGoal ? formShotType : undefined,
              }
            : e
        )
        .sort((a, b) => a.time.localeCompare(b.time))
    );
    resetForm();
    setEditDialogOpen(false);
  }

  function handleDelete(eventId: string) {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  }

  function openEditDialog(event: GameEvent) {
    setEditingEvent(event);
    setFormType(event.type);
    setFormPlayer(event.player);
    setFormTime(event.time);
    setFormShotPosition(event.shotPosition || "");
    setFormShotType(event.shotType || "");
    setEditDialogOpen(true);
  }

  function resetForm() {
    setFormType("but");
    setFormPlayer("");
    setFormTime("");
    setFormShotPosition("");
    setFormShotType("");
    setEditingEvent(null);
  }

  /* ─── Computed stats ─── */
  const stats = {
    buts: events.filter((e) => e.type === "but").length,
    tirs: events.filter((e) => e.type === "tir" || e.type === "but").length,
    arrets: events.filter((e) => e.type === "arret").length,
    cartons: events.filter(
      (e) => e.type === "jaune" || e.type === "2min" || e.type === "rouge"
    ).length,
  };
  const precision = stats.tirs > 0 ? Math.round((stats.buts / stats.tirs) * 100) : 0;

  return (
    <main className="flex-1 flex flex-col min-h-dvh">
      {/* ─── Header ─── */}
      <Header
        backHref={`/equipe/${id}/matchs`}
        title={<span className="text-sm font-bold tracking-tight font-heading text-foreground">vs {MOCK_MATCH.opponent}</span>}
        subtitle={`${new Date(MOCK_MATCH.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} · ${MOCK_MATCH.location}`}
      />

      {/* ─── Content avec Tabs ─── */}
      <Tabs defaultValue="stats" className="flex-1 flex flex-col">
        <div className="px-5 pt-4">
          <TabsList className="w-full">
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="events">Faits de jeu</TabsTrigger>
          </TabsList>
        </div>

        {/* ─── Tab Stats ─── */}
        <TabsContent value="stats" className="flex-1 px-5 pt-4 pb-8">
          {/* Score banner */}
          <Card className="mb-5">
            <CardContent className="flex items-center justify-center gap-6 py-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  {MOCK_MATCH.location === "Domicile" ? "Nous" : MOCK_MATCH.opponent}
                </p>
                <span className="text-4xl font-bold font-heading text-foreground">
                  {MOCK_MATCH.score.home}
                </span>
              </div>
              <span className="text-lg text-muted-foreground/40 font-light">—</span>
              <div className="text-center">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  {MOCK_MATCH.location === "Domicile" ? MOCK_MATCH.opponent : "Nous"}
                </p>
                <span className="text-4xl font-bold font-heading text-foreground">
                  {MOCK_MATCH.score.away}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card size="sm">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-chart-1/10">
                  <HugeiconsIcon icon={Target01Icon} size={20} className="text-chart-1" />
                </div>
                <span className="text-2xl font-bold text-foreground font-heading">
                  {stats.buts}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Buts
                </span>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <HugeiconsIcon icon={DartIcon} size={20} className="text-primary" />
                </div>
                <span className="text-2xl font-bold text-foreground font-heading">
                  {precision}%
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Précision
                </span>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <HugeiconsIcon icon={UserGroupIcon} size={20} className="text-primary" />
                </div>
                <span className="text-2xl font-bold text-foreground font-heading">
                  {stats.arrets}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Arrêts
                </span>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-destructive/10">
                  <span className="text-lg">🟨</span>
                </div>
                <span className="text-2xl font-bold text-foreground font-heading">
                  {stats.cartons}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Sanctions
                </span>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Tab Faits de jeu ─── */}
        <TabsContent value="events" className="flex-1 px-5 pt-4 pb-8">
          {/* Add event button */}
          <Button
            variant="outline"
            className="w-full gap-2 border-dashed border-2 text-muted-foreground hover:text-primary hover:border-primary/40 h-11 rounded-2xl mb-4"
            onClick={() => {
              resetForm();
              setAddDialogOpen(true);
            }}
          >
            <HugeiconsIcon icon={Add01Icon} size={16} />
            Ajouter un fait de jeu
          </Button>

          {/* Event list */}
          <Card size="sm">
            <div className="divide-y divide-border">
              {events.map((event) => {
                const config = EVENT_CONFIG[event.type];
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 px-3 py-2 border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer active:scale-[0.98] transition-all select-none"
                    onClick={() => openEditDialog(event)}
                  >
                    {/* Time */}
                    <span className="shrink-0 w-11 text-[11px] font-bold text-muted-foreground tabular-nums text-right">
                      {event.time}
                    </span>

                    {/* Type badge */}
                    <Badge
                      variant="secondary"
                      className={`shrink-0 ${config.className}`}
                    >
                      {config.emoji} {config.label}
                    </Badge>

                    {/* Player name & position */}
                    <span className="flex-1 text-xs font-medium text-card-foreground truncate">
                      {event.player}
                      {(event.shotPosition || event.shotType) && (
                        <span className="text-[10px] text-muted-foreground ml-1.5 font-normal">
                          ({[event.shotPosition, event.shotType].filter(Boolean).filter(s => s !== "Aucun").join(" - ")})
                        </span>
                      )}
                    </span>

                    <HugeiconsIcon icon={ChevronRightIcon} size={16} className="text-muted-foreground/50 shrink-0" />
                  </div>
                );
              })}
            </div>
          </Card>

          {events.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Aucun fait de jeu enregistré.
            </p>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── Dialog: Ajouter un fait de jeu ─── */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un fait de jeu</DialogTitle>
          </DialogHeader>
          <EventForm
            formType={formType}
            setFormType={setFormType}
            formPlayer={formPlayer}
            setFormPlayer={setFormPlayer}
            formTime={formTime}
            setFormTime={setFormTime}
            formShotPosition={formShotPosition}
            setFormShotPosition={setFormShotPosition}
            formShotType={formShotType}
            setFormShotType={setFormShotType}
            onSubmit={handleAdd}
            submitLabel="Ajouter"
            onCancel={() => setAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* ─── Dialog: Modifier un fait de jeu ─── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le fait de jeu</DialogTitle>
          </DialogHeader>
          <EventForm
            formType={formType}
            setFormType={setFormType}
            formPlayer={formPlayer}
            setFormPlayer={setFormPlayer}
            formTime={formTime}
            setFormTime={setFormTime}
            formShotPosition={formShotPosition}
            setFormShotPosition={setFormShotPosition}
            formShotType={formShotType}
            setFormShotType={setFormShotType}
            onSubmit={handleEdit}
            submitLabel="Enregistrer"
            onCancel={() => setEditDialogOpen(false)}
            onDelete={() => {
              if (editingEvent) handleDelete(editingEvent.id);
              setEditDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}

/* ─── Sous-composant: Formulaire d'événement ─── */
function EventForm({
  formType,
  setFormType,
  formPlayer,
  setFormPlayer,
  formTime,
  setFormTime,
  formShotPosition,
  setFormShotPosition,
  formShotType,
  setFormShotType,
  onSubmit,
  submitLabel,
  onCancel,
  onDelete,
}: {
  formType: EventType;
  setFormType: (t: EventType) => void;
  formPlayer: string;
  setFormPlayer: (v: string) => void;
  formTime: string;
  setFormTime: (v: string) => void;
  formShotPosition: string;
  setFormShotPosition: (v: string) => void;
  formShotType: string;
  setFormShotType: (v: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const types: EventType[] = ["tir", "but", "arret", "jaune", "2min", "rouge"];
  const [playerOpen, setPlayerOpen] = useState(false);

  return (
    <form
      className="flex flex-col gap-5 py-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {/* Type selector */}
      <div className="flex flex-col gap-2.5">
        <Label>Type</Label>
        <div className="grid grid-cols-3 gap-2">
          {types.map((t) => {
            const config = EVENT_CONFIG[t];
            const isActive = formType === t;
            return (
              <Button
                key={t}
                type="button"
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`gap-1.5 text-xs ${isActive ? "" : "text-muted-foreground"}`}
                onClick={() => setFormType(t)}
              >
                {config.emoji} {config.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Player */}
      <div className="flex flex-col gap-2.5">
        <Label>Joueur</Label>
        <Popover open={playerOpen} onOpenChange={setPlayerOpen}>
          <PopoverTrigger
            className="flex w-full items-center justify-between gap-1.5 rounded-4xl border border-input bg-input/30 px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px]"
          >
            {formPlayer ? (
              <span className="text-foreground">{formPlayer}</span>
            ) : (
              <span className="text-muted-foreground">Sélectionner un joueur...</span>
            )}
            <HugeiconsIcon icon={UnfoldMoreIcon} strokeWidth={2} className="pointer-events-none size-4 text-muted-foreground shrink-0" />
          </PopoverTrigger>
          <PopoverContent className="p-1 w-[--anchor-width]" align="start">
            <Command>
              <CommandInput placeholder="Rechercher..." />
              <CommandList>
                <CommandEmpty>Aucun joueur trouvé.</CommandEmpty>
                <CommandGroup>
                  {MOCK_PLAYERS.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={p.name}
                      onSelect={() => {
                        setFormPlayer(p.name);
                        setPlayerOpen(false);
                      }}
                    >
                      {p.name}
                      {formPlayer === p.name && (
                        <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="ml-auto pointer-events-none size-4 text-foreground" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Position and Type (Tir/But only) */}
      {(formType === "tir" || formType === "but") && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2.5">
            <Label>Poste</Label>
            <Select value={formShotPosition} onValueChange={(val) => setFormShotPosition(val || "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aucun">Aucun</SelectItem>
                <SelectItem value="Aile gauche">Aile gauche</SelectItem>
                <SelectItem value="Arrière gauche">Arrière gauche</SelectItem>
                <SelectItem value="Demi-centre">Demi-centre</SelectItem>
                <SelectItem value="Pivot">Pivot</SelectItem>
                <SelectItem value="Arrière droit">Arrière droit</SelectItem>
                <SelectItem value="Aile droite">Aile droite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2.5">
            <Label>Type</Label>
            <Select value={formShotType} onValueChange={(val) => setFormShotType(val || "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aucun">Aucun</SelectItem>
                <SelectItem value="7m">7m</SelectItem>
                <SelectItem value="1c1">1c1</SelectItem>
                <SelectItem value="Contre attaque">Contre attaque</SelectItem>
                <SelectItem value="9m">9m</SelectItem>
                <SelectItem value="Intervalle">Intervalle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Time */}
      <div className="flex flex-col gap-2.5">
        <Label htmlFor="event-time">Temps (MM:SS)</Label>
        <Input
          id="event-time"
          type="text"
          inputMode="numeric"
          placeholder="Ex: 05:30"
          pattern="^\d{2}:\d{2}$"
          value={formTime}
          onChange={(e) => {
            let val = e.target.value;
            let digits = val.replace(/\D/g, "");
            digits = digits.slice(0, 4);
            let formatted = digits;
            if (digits.length >= 2) {
              if (formTime.length > val.length && formTime === digits + ":") {
                formatted = digits.slice(0, 1);
              } else {
                formatted = digits.slice(0, 2) + (digits.length > 2 ? ":" + digits.slice(2) : ":");
              }
            }
            setFormTime(formatted);
          }}
          required
        />
      </div>

      <DialogFooter className="mt-2 flex-col sm:flex-row gap-2">
        {onDelete && (
          <Button
            type="button"
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={onDelete}
          >
            Supprimer
          </Button>
        )}
        <DialogClose
          render={
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={onCancel}
            >
              Annuler
            </Button>
          }
        />
        <Button type="submit" className="w-full sm:w-auto">
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
