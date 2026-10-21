"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  CloudUploadIcon,
  Link04Icon,
} from "@hugeicons/core-free-icons";

import { addMatchAction } from "@/actions/match.actions";

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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function AddMatchDialog({ teamId }: { teamId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHome, setIsHome] = useState(true);

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) setErrorMessage(null);
      }}
    >
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
          onSubmit={async (e) => {
            e.preventDefault();
            setIsSubmitting(true);
            setErrorMessage(null);

            const formData = new FormData();

            if (activeTab === "upload") {
              const fileInput = e.currentTarget.querySelector<HTMLInputElement>("#pdf-upload");
              const file = fileInput?.files?.[0];
              if (!file) {
                setErrorMessage("Veuillez sélectionner un fichier PDF.");
                setIsSubmitting(false);
                return;
              }
              formData.append("file", file);
            } else if (activeTab === "link") {
              const urlInput = e.currentTarget.querySelector<HTMLInputElement>("#pdf-url");
              const url = urlInput?.value;
              if (!url) {
                setErrorMessage("Veuillez renseigner l'URL de la feuille de match.");
                setIsSubmitting(false);
                return;
              }
              formData.append("url", url);
            }

            try {
              const result = await addMatchAction(teamId, formData, isHome);
              if (result.success) {
                setDialogOpen(false);
              } else {
                setErrorMessage(result.error || "Erreur lors de l'import du match");
              }
            } catch (error) {
              setErrorMessage(
                error instanceof Error ? error.message : "Erreur inattendue"
              );
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          {errorMessage && (
            <div className="text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-xl">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <Label>Où s'est joué ce match ?</Label>
            <div className="flex bg-muted/50 p-1 rounded-xl">
              <button
                type="button"
                className={`flex-1 text-xs py-2 rounded-lg font-medium transition-colors ${
                  isHome
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground"
                }`}
                onClick={() => setIsHome(true)}
              >
                Domicile
              </button>
              <button
                type="button"
                className={`flex-1 text-xs py-2 rounded-lg font-medium transition-colors ${
                  !isHome
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground"
                }`}
                onClick={() => setIsHome(false)}
              >
                Extérieur
              </button>
            </div>
          </div>

          {/* Feuille de match — Upload ou Lien */}
          <div className="flex flex-col gap-2.5">
            <Label>Feuille de match (PDF)</Label>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                  id="pdf-url"
                  type="url"
                  placeholder="https://exemple.com/feuille-de-match.pdf"
                />
              </TabsContent>
            </Tabs>
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
              {isSubmitting ? "Importation en cours..." : "Ajouter le match"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
