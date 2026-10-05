import Link from "next/link";
import { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  backHref?: string;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  bottomContent?: ReactNode;
  className?: string;
}

export function Header({
  title,
  subtitle,
  backHref,
  leftContent,
  rightContent,
  bottomContent,
  className = "",
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-5 pt-3 pb-3 flex flex-col gap-3">
      <div className={`flex items-center justify-between gap-3 ${className}`}>
        
        {/* Left: Button + Title */}
        <div className="flex items-center justify-start gap-3 flex-1 min-w-0">
          {leftContent ||
            (backHref ? (
              <Link href={backHref} className="shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-muted/50" aria-label="Retour">
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
                </Button>
              </Link>
            ) : null)}

          {(title || subtitle) && (
            <div className="text-left flex-shrink-0 min-w-0">
              {typeof title === "string" ? (
                <h1 className="text-lg font-bold tracking-tight font-heading leading-tight text-foreground truncate">
                  {title}
                </h1>
              ) : (
                title
              )}
              {subtitle && (
                <p className="text-[11px] text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex justify-end shrink-0">
          {rightContent}
        </div>
      </div>

      {/* Bottom (e.g. Tabs) */}
      {bottomContent && (
        <div className="w-full">
          {bottomContent}
        </div>
      )}
    </header>
  );
}
