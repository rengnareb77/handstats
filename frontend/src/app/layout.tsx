import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HandStats+ | Analyse Handball",
  description:
    "Plateforme d'analyse statistique des matchs de handball — enrichissement et visualisation des feuilles de match.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-100 font-sans">
        {children}
      </body>
    </html>
  );
}
