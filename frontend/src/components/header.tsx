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
  className?: string;
}

export function Header({
  title,
  subtitle,
  backHref,
  leftContent,
  rightContent,
  className = "py-4",
}: HeaderProps) {
  return (
    <header className="shrink-0 border-b border-border px-5">
      <div className={`flex items-center justify-between ${className}`}>
        {/* Left */}
        <div className="flex-1 flex justify-start">
          {leftContent ||
            (backHref ? (
              <Link href={backHref}>
                <Button variant="ghost" size="icon-sm" aria-label="Retour">
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
                </Button>
              </Link>
            ) : null)}
        </div>

        {/* Center */}
        {(title || subtitle) && (
          <div className="text-center flex-shrink-0 px-2">
            {typeof title === "string" ? (
              <h1 className="text-lg font-bold tracking-tight font-heading text-foreground">
                {title}
              </h1>
            ) : (
              title
            )}
            {subtitle && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Right */}
        <div className="flex-1 flex justify-end">
          {rightContent}
        </div>
      </div>
    </header>
  );
}
