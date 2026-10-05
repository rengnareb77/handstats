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
import { Label } from "@/components/ui/label";
import { Match } from "@/types/match.types";

export function EditMatchDialog({ match }: { match: Match }) {
  const [open, setOpen] = useState(false);
  const [isHome, setIsHome] = useState<boolean>(match.isHome ?? false);

  const handleSave = async () => {
    // TODO: Appel API pour sauvegarder
    console.log("TODO: Save match location", { matchId: match.codeRencontre, isHome });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Paramètres du match" />}>
        <HugeiconsIcon icon={Settings02Icon} size={20} />
      </DialogTrigger>
      
      <DialogPortal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le match</DialogTitle>
            <DialogDescription>Changez les informations du match ci-dessous.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2.5">
              <Label>Où s'est joué ce match ?</Label>
              <div className="flex bg-muted/50 p-1 rounded-xl">
                <button type="button" className={`flex-1 text-xs py-2 rounded-lg font-medium transition-colors ${isHome ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`} onClick={() => setIsHome(true)}>Domicile</button>
                <button type="button" className={`flex-1 text-xs py-2 rounded-lg font-medium transition-colors ${!isHome ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`} onClick={() => setIsHome(false)}>Extérieur</button>
              </div>
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
