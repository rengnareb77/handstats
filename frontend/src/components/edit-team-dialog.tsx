"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Settings02Icon } from "@hugeicons/core-free-icons";
import { 
  Dialog, 
  DialogTrigger, 
  DialogPortal, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Team } from "@/types/team.types";

export function EditTeamDialog({ team }: { team: Team }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(team.name);
  const [championship, setChampionship] = useState(team.championship || "");

  const handleSave = async () => {
    // TODO: Appel API pour sauvegarder
    console.log("TODO: Save team", { id: team.id, name, championship });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Paramètres de l'équipe" />}>
        <HugeiconsIcon icon={Settings02Icon} size={20} />
      </DialogTrigger>
      <DialogPortal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paramètres de l'équipe</DialogTitle>
            <DialogDescription>Modifiez les informations générales de l'équipe ci-dessous.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="team-name">Nom de l'équipe</Label>
              <Input id="team-name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="team-champ">Championnat</Label>
              <Input id="team-champ" value={championship} onChange={e => setChampionship(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Annuler</DialogClose>
            <Button onClick={handleSave}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
