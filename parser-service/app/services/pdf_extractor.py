"""
Extracteur de données depuis les PDF de feuilles de match (FDME).

Utilise pdfplumber pour extraire les tableaux et données textuelles
des feuilles de match électroniques officielles de la fédération.

NOTE: La structure exacte de retour sera affinée une fois le modèle
de données défini côté Core API. Ce squelette extrait les tableaux
bruts et les métadonnées de base.
"""
import io
from typing import Any

import pdfplumber


def extract_match_data(pdf_stream: io.BytesIO) -> dict[str, Any]:
    """
    Extrait les données structurées d'un PDF de feuille de match.

    Args:
        pdf_stream: Flux binaire du fichier PDF.

    Returns:
        Dictionnaire contenant les données extraites :
        - metadata: informations de base (nb pages, etc.)
        - tables: liste des tableaux extraits par page
        - raw_text: texte brut par page (pour extraction future)
    """
    result: dict[str, Any] = {
        "metadata": {},
        "tables": [],
        "raw_text": [],
    }

    with pdfplumber.open(pdf_stream) as pdf:
        result["metadata"] = {
            "page_count": len(pdf.pages),
        }

        for i, page in enumerate(pdf.pages):
            # ─── Extraction des tableaux ───
            tables = page.extract_tables()
            if tables:
                for table in tables:
                    result["tables"].append({
                        "page": i + 1,
                        "rows": table,
                    })

            # ─── Texte brut (fallback / enrichissement futur) ───
            text = page.extract_text()
            if text:
                result["raw_text"].append({
                    "page": i + 1,
                    "content": text,
                })

    return result
