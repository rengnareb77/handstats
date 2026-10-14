"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  href: string;
  className?: string;
  "aria-label"?: string;
}

export function BackButton({
  href,
  className = "",
  "aria-label": ariaLabel = "Retour",
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If the user has history from the same domain in this session, use router.back()
    // to preserve exact previous scroll position and tab state
    if (
      typeof window !== "undefined" &&
      window.history.length > 1 &&
      document.referrer &&
      document.referrer.includes(window.location.host)
    ) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <Link href={href} onClick={handleClick} className="shrink-0">
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 rounded-full bg-muted/50 ${className}`}
        aria-label={ariaLabel}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
      </Button>
    </Link>
  );
}
