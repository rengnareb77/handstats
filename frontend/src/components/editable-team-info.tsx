"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit02Icon } from "@hugeicons/core-free-icons";

interface EditableTeamInfoProps {
  initialName: string;
  initialChampionship: string;
  teamId: string;
}

export function EditableTeamInfo({ initialName, initialChampionship, teamId }: EditableTeamInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [champ, setChamp] = useState(initialChampionship || "");

  if (isEditing) {
    return (
      <div className="flex flex-col items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        <Input 
          autoFocus 
          value={name} 
          onChange={e => setName(e.target.value)} 
          className="h-7 px-2 text-center text-sm font-bold uppercase w-40" 
          placeholder="Nom de l'équipe"
        />
        <Input 
          value={champ} 
          onChange={e => setChamp(e.target.value)} 
          placeholder="Championnat..." 
          className="h-6 px-2 text-center text-[11px] w-40" 
        />
        <div className="flex gap-2 mt-1">
          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => setIsEditing(false)}>Annuler</Button>
          <Button size="sm" className="h-6 px-2 text-[10px]" onClick={() => {
            // TODO: Appeler l'API pour mettre à jour le nom et le championnat de l'équipe
            console.log("TODO: Update team API", { teamId, name, champ });
            setIsEditing(false);
          }}>Sauver</Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="text-center flex-shrink-0 px-2 cursor-pointer group p-1.5 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border relative flex flex-col items-center" 
      onClick={() => setIsEditing(true)}
      title="Modifier les infos de l'équipe"
    >
      <div className="flex items-center justify-center gap-2">
        <h1 className="text-lg font-bold tracking-tight font-heading text-foreground uppercase border-b-2 border-dashed border-transparent group-hover:border-primary/40 pb-0.5 transition-colors">
          {name}
        </h1>
        <HugeiconsIcon 
          icon={Edit02Icon} 
          size={16} 
          className="text-muted-foreground/40 group-hover:text-primary transition-colors" 
        />
      </div>
      <p className="text-[11px] text-muted-foreground mt-1 group-hover:text-foreground transition-colors border-b border-dashed border-transparent group-hover:border-muted-foreground/40">
        {champ || "Ajouter un championnat"}
      </p>
    </div>
  );
}
