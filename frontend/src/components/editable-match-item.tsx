"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronRightIcon } from "@hugeicons/core-free-icons";
import { Card } from "@/components/ui/card";
import { Match } from "@/types/match.types";

const RESULT_CONFIG = {
  win: { dotClass: "bg-emerald-500" },
  loss: { dotClass: "bg-rose-500" },
  draw: { dotClass: "bg-muted-foreground" },
};

export function EditableMatchItem({ match, teamId }: { match: Match; teamId: string }) {
  const [isHome, setIsHome] = useState(match.isHome ?? false);

  const setHomeStatus = (e: React.MouseEvent, newValue: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isHome === newValue) return;
    
    setIsHome(newValue);
    
    // TODO: Appeler l'API pour mettre à jour match.isHome avec `newValue`
    console.log("TODO: Update match API", { matchId: match.codeRencontre, isHome: newValue });
  };

  const opponent = isHome ? match.awayTeamName : match.homeTeamName;
  const teamScore = isHome ? match.homeScore.finalScore : match.awayScore.finalScore;
  const opponentScore = isHome ? match.awayScore.finalScore : match.homeScore.finalScore;

  let resultKey: "win" | "loss" | "draw";
  if (teamScore > opponentScore) resultKey = "win";
  else if (teamScore < opponentScore) resultKey = "loss";
  else resultKey = "draw";

  const result = RESULT_CONFIG[resultKey];
  const location = isHome ? "DOM" : "EXT";

  return (
    <Link href={`/equipe/${teamId}/matchs/${match.codeRencontre}`}>
      <Card size="sm" className="group cursor-pointer transition-all duration-200 hover:bg-muted/50">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full shrink-0 ${result.dotClass}`} />
              <span className="text-[15px] font-bold text-card-foreground truncate">
                {opponent}
              </span>
            </div>
            <div className="flex items-center gap-1.5 pl-4 mt-1.5">
              <span className="text-xs text-muted-foreground mr-1">
                {match.date ? `${match.date}` : ""}
              </span>
              
              {/* Segmented Control for Home/Away */}
              <div 
                className="flex items-center bg-muted/80 rounded-md p-0.5 border border-border" 
                onClick={e => e.preventDefault()}
              >
                <button
                  onClick={(e) => setHomeStatus(e, true)}
                  className={`text-[9px] px-2 py-0.5 rounded-sm font-bold uppercase transition-all ${isHome ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Dom
                </button>
                <button
                  onClick={(e) => setHomeStatus(e, false)}
                  className={`text-[9px] px-2 py-0.5 rounded-sm font-bold uppercase transition-all ${!isHome ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Ext
                </button>
              </div>
            </div>
          </div>

          <span className="shrink-0 text-base font-bold font-heading text-foreground tabular-nums tracking-tight">
            {teamScore} - {opponentScore}
          </span>

          <HugeiconsIcon icon={ChevronRightIcon} size={16} className="shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
        </div>
      </Card>
    </Link>
  );
}
