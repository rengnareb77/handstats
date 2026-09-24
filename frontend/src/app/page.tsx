import Link from "next/link";

/**
 * Page d'accueil — Server Component.
 * Affichage public des matchs récents et accès rapide.
 */
export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col">
      {/* ─── Header ─── */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-brand-400">Hand</span>
            <span className="text-accent-500">Stats</span>
            <span className="text-gray-400 text-sm font-normal ml-1">+</span>
          </h1>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-400">
            <Link href="/" className="text-white font-medium">
              Accueil
            </Link>
            <Link href="/matches" className="hover:text-white transition-colors">
              Matchs
            </Link>
            <Link href="/stats" className="hover:text-white transition-colors">
              Statistiques
            </Link>
          </nav>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-2xl">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Analysez vos matchs
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-accent-500 bg-clip-text text-transparent">
              comme jamais
            </span>
          </h2>
          <p className="mt-6 text-lg text-gray-400 leading-relaxed">
            Importez vos feuilles de match, enrichissez les données action par
            action, et visualisez les statistiques qui font la différence.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/matches/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-400 transition-all"
            >
              📄 Importer une FDME
            </Link>
            <Link
              href="/matches"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-6 py-3 text-sm font-semibold text-gray-300 hover:border-gray-500 hover:text-white transition-all"
            >
              Voir les matchs
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-800 py-6">
        <p className="text-center text-xs text-gray-500">
          HandStats+ — Analyse statistique handball
        </p>
      </footer>
    </main>
  );
}
