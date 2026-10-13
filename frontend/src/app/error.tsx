"use client";

import { useEffect } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, RefreshIcon, Home01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Next.js caught unhandled error:", error);
  }, [error]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-dvh px-5 text-center">
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
        <HugeiconsIcon icon={AlertCircleIcon} size={28} />
      </div>

      <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground mb-2">
        Une erreur est survenue
      </h1>

      <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
        {error.message || "Une erreur inattendue s'est produite lors du chargement de la page."}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
        <Button onClick={() => reset()} className="w-full gap-2">
          <HugeiconsIcon icon={RefreshIcon} size={16} />
          Réessayer
        </Button>
        <Link href="/" className="w-full">
          <Button variant="outline" className="w-full gap-2">
            <HugeiconsIcon icon={Home01Icon} size={16} />
            Accueil
          </Button>
        </Link>
      </div>
    </main>
  );
}
