import type { Metadata } from "next";
import { Inter, Oxanium, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
const outfitHeading = Outfit({subsets:['latin'],variable:'--font-heading'});

const oxanium = Oxanium({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HandStats+",
  description:
    "Plateforme d'analyse statistique des matchs de handball — enrichissement et visualisation des feuilles de match.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" suppressHydrationWarning className={cn("dark", "h-full", "antialiased", inter.variable, "font-sans", oxanium.variable, outfitHeading.variable)}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
