"""
Routes du Parser Service.
"""
from fastapi import APIRouter, File, HTTPException, UploadFile,Form
from app.services.pdf_extractor import parse_pdf
parser_router = APIRouter()


@parser_router.post("/parse")
async def parse_match_sheet(file: UploadFile | None = File(None),url: str | None = Form(None)):
    """
    Reçoit un PDF (feuille de match FDME), extrait les tableaux
    et retourne un format structuré JSON.
    """
    if file is not None:
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail="Le fichier doit être un PDF (.pdf)",
            )
        file_content = file.file.read()
    elif url is not None:
        import urllib.request
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                file_content = response.read()
        except Exception:
            raise HTTPException(status_code=400, detail="Impossible de télécharger le PDF depuis l'URL")
    else:
        raise HTTPException(
            status_code=400,
            detail="Vous devez fournir un fichier ou une URL",
        )
    try:
        result = parse_pdf(file_content)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du traitement du PDF: {str(e)}")

    return result


