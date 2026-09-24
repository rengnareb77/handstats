"use client";

import { useState, useCallback } from "react";

/**
 * Page d'upload de FDME — Client Component.
 * Interface interactive avec drag & drop pour uploader un PDF.
 */
export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Seuls les fichiers PDF sont acceptés.");
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) {
        setFile(selected);
        setError(null);
      }
    },
    []
  );

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
      const res = await fetch(`${apiUrl}/matches/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Erreur ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'upload"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Importer une feuille de match
        </h1>
        <p className="mt-2 text-gray-400">
          Déposez votre FDME au format PDF pour en extraire les données.
        </p>

        {/* ─── Zone de Drop ─── */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          className={`mt-8 rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
            isDragging
              ? "border-brand-400 bg-brand-500/10"
              : "border-gray-700 bg-gray-900/30 hover:border-gray-600"
          }`}
        >
          <div className="text-4xl mb-4">📄</div>
          <p className="text-gray-300 font-medium">
            {file ? file.name : "Glissez votre PDF ici"}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            ou{" "}
            <label className="text-brand-400 cursor-pointer hover:underline">
              parcourez vos fichiers
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </p>
        </div>

        {/* ─── Bouton Upload ─── */}
        {file && (
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="mt-6 w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isUploading ? "Extraction en cours…" : "Lancer l'extraction"}
          </button>
        )}

        {/* ─── Erreur ─── */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* ─── Résultat ─── */}
        {result && (
          <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
            <h2 className="text-lg font-semibold text-green-400">
              ✓ Extraction réussie
            </h2>
            <pre className="mt-4 overflow-x-auto rounded-lg bg-gray-950 p-4 text-xs text-gray-300">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
