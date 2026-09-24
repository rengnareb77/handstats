/**
 * Page Statistiques — Server Component.
 *
 * TODO: Intégrer Chart.js pour les visualisations
 * une fois le modèle de données et les endpoints définis.
 */
export default function StatsPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Statistiques</h1>
        <p className="mt-2 text-gray-400">
          Visualisations et analyses — en attente de la définition du modèle de
          données et de l&apos;intégration Chart.js.
        </p>

        {/* Placeholder : graphiques */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {["Tirs par secteur", "Chronologie du score", "Performance joueurs", "Comparaison équipes"].map(
            (title) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm"
              >
                <h3 className="text-sm font-medium text-gray-400">{title}</h3>
                <div className="mt-4 h-48 rounded-xl bg-gray-800/30 flex items-center justify-center">
                  <span className="text-gray-600 text-sm">
                    📊 Graphique à venir
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}
