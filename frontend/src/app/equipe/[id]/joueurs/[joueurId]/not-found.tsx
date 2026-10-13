import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

export default function PlayerNotFound() {
  return (
    <main className="flex-1 flex flex-col min-h-dvh">
      <Header backHref="/" title="Joueur introuvable" />
      <section className="flex-1 flex flex-col items-center justify-center px-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mb-4">
          <HugeiconsIcon icon={UserIcon} size={28} />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground mb-2">
          Joueur non trouvé
        </h1>

        <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
          Le joueur demandé n&apos;existe pas ou a été retiré de l&apos;effectif.
        </p>

        <Link href="/">
          <Button className="gap-2">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            Retour à l&apos;accueil
          </Button>
        </Link>
      </section>
    </main>
  );
}
