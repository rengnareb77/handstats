"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { AddTeamIcon } from "@hugeicons/core-free-icons";

import { teamService } from "@/lib/services/team.services";

import { Button } from "@/components/ui/button";
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
import { Team } from "@/types/team.types";

export function AddTeamDialog() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  return (
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
          onSubmit={async (e) => {
            e.preventDefault();
            setIsSubmitting(true);
            const formData = new FormData(e.currentTarget);
            const name = formData.get("name") as string;
            const championship = formData.get("championship") as string;
            const team = {
              name: name,
              championship: championship
            }

            try {
              await teamService.create(team, false);
              setDialogOpen(false);
              router.refresh(); // Rafraîchit les Server Components (dont la liste des équipes)
            } catch (error) {
              console.error("Erreur lors de la création de l'équipe:", error);
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="name">Nom de l'équipe</Label>
            <Input id="name" name="name" placeholder="Ex: INAM SG" required />
          </div>
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="championship">Championnat</Label>
            <Input id="championship" name="championship" placeholder="Ex: Nationale 2" required />
          </div>

          <DialogFooter className="mt-2 sm:mt-4">
            <DialogClose
              render={
                <Button type="button" variant="outline" className="w-full sm:w-auto">
                  Annuler
                </Button>
              }
            />
            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? "Création..." : "Créer l'équipe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
