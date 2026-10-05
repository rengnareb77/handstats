"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Target01Icon,
  DartIcon,
  UserGroupIcon,
  Add01Icon,
  UnfoldMoreIcon,
  Tick02Icon,
  ChevronRightIcon,
  Shield01Icon,
  Alert01Icon,
  Timer02Icon,
  PauseIcon,
  ChartColumnIncreasingIcon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";

import { Header } from "@/components/header";
import { EditMatchDialog } from "@/components/edit-match-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Match, MatchEvent } from "@/types/match.types";
import { Team } from "@/types/team.types";
import { matchService } from "@/lib/services/match.services";

/* ─── Types locaux ─── */
type LocalMatchEvent = MatchEvent & { id: string };

const EVENT_CONFIG: Record<MatchEvent["type"], { label: string; icon: any; className: string }> = {
  SHOT: { label: "Tir", icon: DartIcon, className: "text-muted-foreground" },
  GOAL: { label: "But", icon: Target01Icon, className: "text-emerald-500" },
  SEVEN_METER: { label: "7m", icon: Target01Icon, className: "text-emerald-500" },
  SAVE: { label: "Arrêt", icon: Shield01Icon, className: "text-blue-500" },
  YELLOW_CARD: { label: "Jaune", icon: Alert01Icon, className: "text-amber-500" },
  TWO_MINUTE: { label: "2 min", icon: Timer02Icon, className: "text-orange-500" },
  RED_CARD: { label: "Rouge", icon: Alert01Icon, className: "text-rose-500" },
  TIMEOUT: { label: "Temps mort", icon: PauseIcon, className: "text-purple-500" },
};

const SECTOR_LABELS: Record<string, string> = {
  WING_L: "Aile gauche",
  BACK_L: "Arrière gauche",
  CENTER: "Demi-centre",
  PIVOT: "Pivot",
  BACK_R: "Arrière droit",
  WING_R: "Aile droite",
  GOALKEEPER: "Gardien",
};

export function MatchDetailClient({ match, teamId, team }: { match: Match; teamId: string, team: Team }) {
  const isHome = match.isHome !== undefined ? match.isHome : match.homeTeamName === team.name;
  const opponent = isHome ? match.awayTeamName : match.homeTeamName;
  const location = isHome ? "Domicile" : "Extérieur";

  const players = isHome ? match.homeTeamPlayers : match.awayTeamPlayers;

  // On utilise les événements de l'API en ajoutant un ID
  const initialEvents: LocalMatchEvent[] = (match.events || []).map((e, idx) => ({
    ...e,
    id: `api-e${idx}`,
    matchPlayerName: e.matchPlayerName || "Inconnu",
  })).sort((a, b) => a.time.localeCompare(b.time));

  const [events, setEvents] = useState<LocalMatchEvent[]>(initialEvents);
  const [teamFilter, setTeamFilter] = useState<"ALL" | "HOME" | "AWAY">("ALL");
  const [actionFilter, setActionFilter] = useState<MatchEvent["type"][]>([]);
  let nextId = events.length + 1;

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LocalMatchEvent | null>(null);

  // Form state
  const [formType, setFormType] = useState<MatchEvent["type"]>("GOAL");
  const [formTeam, setFormTeam] = useState<"HOME" | "AWAY">("HOME");
  const [formPlayer, setFormPlayer] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formShotPosition, setFormShotPosition] = useState<MatchEvent["sector"] | "" | "none">("");
  const [formShotType, setFormShotType] = useState("");

  async function handleAdd() {
    if ((!formPlayer && formType !== "TIMEOUT") || !formTime) return;
    const isShotOrGoal = formType === "SHOT" || formType === "GOAL" || formType === "SEVEN_METER";
    const newEventData: MatchEvent = {
      type: formType,
      matchPlayerName: formType === "TIMEOUT" ? "Équipe" : formPlayer,
      time: formTime,
      team: formTeam,
      sector: (isShotOrGoal && formShotPosition && formShotPosition !== "none") ? (formShotPosition as MatchEvent["sector"]) : null,
      goalType: (isShotOrGoal && formShotType && formShotType !== "Aucun") ? formShotType : undefined,
    };

    try {
      await matchService.addEventToMatch(match.codeRencontre, newEventData);
      const newEvent: LocalMatchEvent = {
        ...newEventData,
        id: `local-e${nextId++}`,
      };
      setEvents((prev) => [...prev, newEvent].sort((a, b) => a.time.localeCompare(b.time)));
      resetForm();
      setAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add event", error);
    }
  }

  async function handleEdit() {
    if (!editingEvent || (!formPlayer && formType !== "TIMEOUT") || !formTime) return;
    const isShotOrGoal = formType === "SHOT" || formType === "GOAL" || formType === "SEVEN_METER";

    const updatedEvent: LocalMatchEvent = {
      ...editingEvent,
      type: formType,
      matchPlayerName: formType === "TIMEOUT" ? "Équipe" : formPlayer,
      time: formTime,
      team: formTeam,
      sector: (isShotOrGoal && formShotPosition && formShotPosition !== "none") ? (formShotPosition as MatchEvent["sector"]) : null,
      goalType: (isShotOrGoal && formShotType && formShotType !== "Aucun") ? formShotType : undefined,
    };

    const newEvents = events
      .map((e) => (e.id === editingEvent.id ? updatedEvent : e))
      .sort((a, b) => a.time.localeCompare(b.time));

    try {
      // Map back to MatchEvent by removing the local `id`
      const { id: oldId, ...oldEventPayload } = editingEvent;
      const { id: newId, ...newEventPayload } = updatedEvent;
      
      const payload: MatchEvent[] = [oldEventPayload, newEventPayload];
      await matchService.updateEventToMatch(match.codeRencontre, payload);
      
      setEvents(newEvents);
      resetForm();
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update events", error);
    }
  }

  function handleDelete(eventId: string) {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  }

  function openEditDialog(event: LocalMatchEvent) {
    setEditingEvent(event);
    setFormType(event.type);
    setFormTeam(event.team || "HOME");
    setFormPlayer(event.matchPlayerName);
    setFormTime(event.time);
    setFormShotPosition(event.sector || "");
    setFormShotType(event.goalType || "");
    setEditDialogOpen(true);
  }

  function resetForm() {
    setFormType("GOAL");
    setFormTeam("HOME");
    setFormPlayer("");
    setFormTime("");
    setFormShotPosition("");
    setFormShotType("");
    setEditingEvent(null);
  }

  function toggleActionFilter(type: MatchEvent["type"]) {
    setActionFilter(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  }

  const teamFilteredEvents = events.filter(e => teamFilter === "ALL" || e.team === teamFilter);
  const filteredEvents = teamFilteredEvents.filter(e => actionFilter.length === 0 || actionFilter.includes(e.type));

  const stats = {
    buts: teamFilteredEvents.filter((e) => e.type === "GOAL" || e.type === "SEVEN_METER").length,
    tirs: teamFilteredEvents.filter((e) => e.type === "SHOT" || e.type === "GOAL" || e.type === "SEVEN_METER").length,
    arrets: teamFilteredEvents.filter((e) => e.type === "SAVE").length,
    cartons: teamFilteredEvents.filter((e) => e.type === "YELLOW_CARD" || e.type === "TWO_MINUTE" || e.type === "RED_CARD").length,
    sevenMeters: teamFilteredEvents.filter((e) => e.type === "SEVEN_METER").length,
  };
  const precision = stats.tirs > 0 ? Math.round((stats.buts / stats.tirs) * 100) : 0;

  return (
    <main className="flex-1 flex flex-col min-h-dvh">
      <Tabs defaultValue="stats" className="flex-1 flex flex-col">
        {/* HEADER COMPACT ET COLLANT */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border pb-3 pt-3 px-5 mb-4 flex flex-col gap-4">
          <div className="flex flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Link href={`/equipe/${teamId}`} className="shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-muted/50">
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
                </Button>
              </Link>
              <div className="leading-tight min-w-0 flex-1">
                <h1 className="text-lg font-bold tracking-tight font-heading text-foreground truncate">
                  {match.homeTeamName} - {match.awayTeamName}
                </h1>
                <p className="text-[11px] text-muted-foreground truncate">{location}</p>
              </div>
            </div>

            <div className="flex items-center shrink-0">
              <EditMatchDialog match={match} />
            </div>
          </div>

          <TabsList className="w-full h-9">
            <TabsTrigger value="stats" className="flex-1 text-xs">Statistiques</TabsTrigger>
            <TabsTrigger value="events" className="flex-1 text-xs">Faits de jeu</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="stats" className="flex-1 px-5 pt-4 pb-8">
          <Card className="mb-4 border-none shadow-sm bg-gradient-to-br from-card to-muted/30">
            <CardContent className="p-3 relative overflow-hidden">
              <div className="flex items-center justify-center w-full z-10 gap-4 sm:gap-8 px-2">
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider truncate w-full text-center max-w-[140px]">
                    {match.homeTeamName}
                  </p>
                  <span className="text-3xl font-black font-heading text-foreground leading-none mt-0.5">
                    {match.homeScore.finalScore}
                  </span>
                </div>

                <div className="flex flex-col items-center shrink-0">
                  <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1 rounded-full border border-border/50 shadow-sm">
                    <span className="text-[11px] font-bold text-foreground/80">{match.homeScore.halfScore}</span>
                    <span className="text-[9px] font-bold uppercase text-muted-foreground mx-1">Mi-temps</span>
                    <span className="text-[11px] font-bold text-foreground/80">{match.awayScore.halfScore}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider truncate w-full text-center max-w-[140px]">
                    {match.awayTeamName}
                  </p>
                  <span className="text-3xl font-black font-heading text-foreground leading-none mt-0.5">
                    {match.awayScore.finalScore}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex bg-muted/50 p-1 rounded-xl mb-4">
            <button className={`flex-1 text-[11px] py-1.5 rounded-lg font-bold uppercase transition-all truncate px-1 ${teamFilter === "HOME" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setTeamFilter("HOME")}>{match.homeTeamName}</button>
            <button className={`flex-[0.5] shrink-0 text-[11px] py-1.5 rounded-lg font-bold uppercase transition-all px-2 ${teamFilter === "ALL" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setTeamFilter("ALL")}>Tous</button>
            <button className={`flex-1 text-[11px] py-1.5 rounded-lg font-bold uppercase transition-all truncate px-1 ${teamFilter === "AWAY" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setTeamFilter("AWAY")}>{match.awayTeamName}</button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Card size="sm">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-chart-1/10">
                  <HugeiconsIcon icon={Target01Icon} size={16} className="text-chart-1" />
                </div>
                <span className="text-xl font-bold text-foreground font-heading leading-none">{stats.tirs}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Tirs</span>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/10">
                  <HugeiconsIcon icon={Tick02Icon} size={16} className="text-emerald-500" />
                </div>
                <span className="text-xl font-bold text-foreground font-heading leading-none">{stats.buts}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Buts</span>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10">
                  <HugeiconsIcon icon={DartIcon} size={16} className="text-primary" />
                </div>
                <span className="text-xl font-bold text-foreground font-heading leading-none">{precision}%</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Précision</span>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10">
                  <HugeiconsIcon icon={Shield01Icon} size={16} className="text-primary" />
                </div>
                <span className="text-xl font-bold text-foreground font-heading leading-none">{stats.arrets}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Arrêts</span>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-chart-1/10">
                  <span className="text-xs font-bold text-chart-1">7m</span>
                </div>
                <span className="text-xl font-bold text-foreground font-heading leading-none">{stats.sevenMeters}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">7 mètres</span>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-destructive/10">
                  <span className="text-sm leading-none">🟨</span>
                </div>
                <span className="text-xl font-bold text-foreground font-heading leading-none">{stats.cartons}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Sanctions</span>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex justify-center">
            <Link href={`/equipe/${teamId}/matchs/${match.codeRencontre}/stats`}>
              <Button className="rounded-full shadow-md bg-primary hover:bg-primary/90 text-primary-foreground px-6 h-10 font-semibold gap-2 transition-all">
                <HugeiconsIcon icon={ChartColumnIncreasingIcon} size={18} />
                Statistiques détaillées
              </Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="events" className="flex-1 px-5 pt-4 pb-8">
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex bg-muted/50 p-1 rounded-xl">
              <button className={`flex-1 text-[11px] py-1.5 rounded-lg font-bold uppercase transition-all truncate px-1 ${teamFilter === "HOME" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setTeamFilter("HOME")}>{match.homeTeamName}</button>
              <button className={`flex-[0.5] shrink-0 text-[11px] py-1.5 rounded-lg font-bold uppercase transition-all px-2 ${teamFilter === "ALL" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setTeamFilter("ALL")}>Tous</button>
              <button className={`flex-1 text-[11px] py-1.5 rounded-lg font-bold uppercase transition-all truncate px-1 ${teamFilter === "AWAY" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setTeamFilter("AWAY")}>{match.awayTeamName}</button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <button
                className={`flex items-center justify-center rounded-full text-xs font-medium h-8 px-4 shrink-0 transition-all ${actionFilter.length === 0 ? "bg-primary text-primary-foreground shadow-sm" : "bg-destructive/10 text-destructive hover:bg-destructive/20"}`}
                onClick={() => setActionFilter([])}
              >
                {actionFilter.length === 0 ? "Tout" : "Réinitialiser"}
              </button>
              {(Object.keys(EVENT_CONFIG) as MatchEvent["type"][]).map(t => (
                <button
                  key={t}
                  className={`flex items-center justify-center rounded-full text-xs font-medium h-8 px-4 shrink-0 transition-all ${actionFilter.includes(t) ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                  onClick={() => toggleActionFilter(t)}
                >
                  {EVENT_CONFIG[t].label}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full gap-2 border-dashed border-2 text-muted-foreground hover:text-primary hover:border-primary/40 h-11 rounded-2xl mb-4"
            onClick={() => { resetForm(); setAddDialogOpen(true); }}
          >
            <HugeiconsIcon icon={Add01Icon} size={16} /> Ajouter un fait de jeu
          </Button>

          <Card size="sm">
            <div className="divide-y divide-border">
              {filteredEvents.map((event) => {
                const config = EVENT_CONFIG[event.type];
                const isHomeEvent = event.team === "HOME";
                return (
                  <div key={event.id} className="flex items-center gap-3.5 px-3 py-3 border-b border-border hover:bg-muted/50 cursor-pointer active:scale-[0.98] transition-all select-none relative overflow-hidden" onClick={() => openEditDialog(event)}>
                    {/* Bande de couleur latérale */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isHomeEvent ? "bg-emerald-500" : "bg-rose-500"}`} />

                    <span className="shrink-0 w-10 text-xs font-semibold text-muted-foreground tabular-nums text-right ml-1">{event.time}</span>

                    <div className="flex-1 flex flex-col min-w-0 py-0.5 ml-2">
                      <div className="flex items-baseline gap-1.5 truncate">
                        <span className="text-sm font-bold text-card-foreground shrink-0">
                          {config.label}
                        </span>
                        {event.matchPlayerName !== "Équipe" && (
                          <span className="text-sm font-medium text-muted-foreground truncate">
                            • {event.matchPlayerName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5 truncate">
                        <span className={`text-[10px] font-bold tracking-wider uppercase ${isHomeEvent ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-500"}`}>
                          {isHomeEvent ? match.homeTeamName : match.awayTeamName}
                        </span>
                        {(event.sector || event.goalType) && (
                          <>
                            <span className="text-muted-foreground/40 text-[9px]">•</span>
                            <span className="text-[10px] text-muted-foreground font-normal truncate">
                              {[event.sector ? SECTOR_LABELS[event.sector] || event.sector : null, event.goalType].filter(Boolean).filter(s => s !== "none").join(" - ")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <HugeiconsIcon icon={ChevronRightIcon} size={16} className="text-muted-foreground/50 shrink-0" />
                  </div>
                );
              })}
            </div>
          </Card>
          {filteredEvents.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">Aucun fait de jeu enregistré.</p>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajouter un fait de jeu</DialogTitle></DialogHeader>
          <EventForm
            match={match}
            formType={formType} setFormType={setFormType}
            formTeam={formTeam} setFormTeam={setFormTeam}
            formPlayer={formPlayer} setFormPlayer={setFormPlayer}
            formTime={formTime} setFormTime={setFormTime}
            formShotPosition={formShotPosition} setFormShotPosition={setFormShotPosition}
            formShotType={formShotType} setFormShotType={setFormShotType}
            onSubmit={handleAdd} submitLabel="Ajouter" onCancel={() => setAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier le fait de jeu</DialogTitle></DialogHeader>
          <EventForm
            match={match}
            formType={formType} setFormType={setFormType}
            formTeam={formTeam} setFormTeam={setFormTeam}
            formPlayer={formPlayer} setFormPlayer={setFormPlayer}
            formTime={formTime} setFormTime={setFormTime}
            formShotPosition={formShotPosition} setFormShotPosition={setFormShotPosition}
            formShotType={formShotType} setFormShotType={setFormShotType}
            onSubmit={handleEdit} submitLabel="Enregistrer" onCancel={() => setEditDialogOpen(false)}
            onDelete={() => { if (editingEvent) handleDelete(editingEvent.id); setEditDialogOpen(false); }}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}

function EventForm({
  match, formType, setFormType, formTeam, setFormTeam, formPlayer, setFormPlayer, formTime, setFormTime, formShotPosition, setFormShotPosition, formShotType, setFormShotType, onSubmit, submitLabel, onCancel, onDelete,
}: any) {
  const types: MatchEvent["type"][] = ["SHOT", "GOAL", "SEVEN_METER", "SAVE", "YELLOW_CARD", "TWO_MINUTE", "RED_CARD", "TIMEOUT"];
  const [playerOpen, setPlayerOpen] = useState(false);
  const players = formTeam === "HOME" ? match.homeTeamPlayers : match.awayTeamPlayers;

  return (
    <form className="flex flex-col gap-5 py-4" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div className="flex flex-col gap-2.5">
        <Label>Équipe</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant={formTeam === "HOME" ? "default" : "outline"} onClick={() => { setFormTeam("HOME"); setFormPlayer(""); }} className="truncate">
            <span className="truncate block w-full">{match.homeTeamName}</span>
          </Button>
          <Button type="button" variant={formTeam === "AWAY" ? "default" : "outline"} onClick={() => { setFormTeam("AWAY"); setFormPlayer(""); }} className="truncate">
            <span className="truncate block w-full">{match.awayTeamName}</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <Label>Type</Label>
        <div className="grid grid-cols-3 gap-2">
          {types.map((t) => {
            const config = EVENT_CONFIG[t];
            const isActive = formType === t;
            return (
              <Button key={t} type="button" variant={isActive ? "default" : "outline"} size="sm" className={`gap-1.5 text-xs ${isActive ? "" : "text-muted-foreground"}`} onClick={() => setFormType(t)}>
                <HugeiconsIcon icon={config.icon} size={16} className={isActive ? "" : config.className} /> {config.label}
              </Button>
            );
          })}
        </div>
      </div>
      {formType !== "TIMEOUT" && (
        <div className="flex flex-col gap-2.5">
          <Label>Joueur</Label>
          <Popover open={playerOpen} onOpenChange={setPlayerOpen}>
            <PopoverTrigger className="flex w-full items-center justify-between gap-1.5 rounded-4xl border border-input bg-input/30 px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px]">
              {formPlayer ? <span className="text-foreground">{formPlayer}</span> : <span className="text-muted-foreground">Sélectionner un joueur...</span>}
              <HugeiconsIcon icon={UnfoldMoreIcon} strokeWidth={2} className="pointer-events-none size-4 text-muted-foreground shrink-0" />
            </PopoverTrigger>
            <PopoverContent className="p-1 w-[--anchor-width]" align="start">
              <Command>
                <CommandInput placeholder="Rechercher..." />
                <CommandList>
                  <CommandEmpty>Aucun joueur trouvé.</CommandEmpty>
                  <CommandGroup>
                    {players.map((p: any) => (
                      <CommandItem key={p.licenseNumber || p.fullName} value={p.fullName} onSelect={() => { setFormPlayer(p.fullName); setPlayerOpen(false); }}>
                        {p.fullName}
                        {formPlayer === p.fullName && <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="ml-auto pointer-events-none size-4 text-foreground" />}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}
      {(formType === "SHOT" || formType === "GOAL" || formType === "SEVEN_METER") && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2.5">
            <Label>Poste</Label>
            <Select value={formShotPosition} onValueChange={(val) => setFormShotPosition(val || "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner...">
                  {formShotPosition && formShotPosition !== "none" ? SECTOR_LABELS[formShotPosition] || formShotPosition : (formShotPosition === "none" ? "Aucun" : null)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun</SelectItem>
                <SelectItem value="WING_L">Aile gauche</SelectItem>
                <SelectItem value="BACK_L">Arrière gauche</SelectItem>
                <SelectItem value="CENTER">Demi-centre</SelectItem>
                <SelectItem value="PIVOT">Pivot</SelectItem>
                <SelectItem value="BACK_R">Arrière droit</SelectItem>
                <SelectItem value="WING_R">Aile droite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2.5">
            <Label>Type</Label>
            <Select value={formShotType} onValueChange={(val) => setFormShotType(val || "")}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Aucun">Aucun</SelectItem>
                <SelectItem value="1c1">1c1</SelectItem>
                <SelectItem value="Contre attaque">Contre attaque</SelectItem>
                <SelectItem value="9m">9m</SelectItem>
                <SelectItem value="Intervalle">Intervalle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2.5">
        <Label htmlFor="event-time">Temps (MM:SS)</Label>
        <Input
          id="event-time" type="text" inputMode="numeric" placeholder="Ex: 05:30" pattern="^\d{2}:\d{2}$" value={formTime} required
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
        />
      </div>
      <DialogFooter className="mt-2 flex-col sm:flex-row gap-2">
        {onDelete && <Button type="button" variant="destructive" className="w-full sm:w-auto" onClick={onDelete}>Supprimer</Button>}
        <DialogClose render={<Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onCancel}>Annuler</Button>} />
        <Button type="submit" className="w-full sm:w-auto">{submitLabel}</Button>
      </DialogFooter>
    </form>
  );
}
