/**
 * Page Matchs — Server Component.
 * Liste publique des matchs enregistrés.
 *
 * TODO: Connecter au Core API (GET /api/matches)
 * une fois le modèle de données défini.
 */
export default function MatchesPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Matchs</h1>
        <p className="mt-2 text-gray-400">
          Liste des matchs enregistrés — en attente de la définition du modèle
          de données.
        </p>

        {/* Placeholder : grille de matchs */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm"
            >
              <div className="h-4 w-3/4 rounded bg-gray-800 animate-pulse" />
              <div className="mt-3 h-3 w-1/2 rounded bg-gray-800/60 animate-pulse" />
              <div className="mt-6 h-8 w-full rounded-lg bg-gray-800/40 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
