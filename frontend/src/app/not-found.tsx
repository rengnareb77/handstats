import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, Home01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-dvh px-5 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mb-4">
        <HugeiconsIcon icon={AlertCircleIcon} size={28} />
      </div>

      <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground mb-2">
        Page introuvable
      </h1>

      <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
        La ressource demandée n&apos;existe pas ou a été déplacée.
      </p>

      <Link href="/">
        <Button className="gap-2">
          <HugeiconsIcon icon={Home01Icon} size={16} />
          Retour à l&apos;accueil
        </Button>
      </Link>
    </main>
  );
}
