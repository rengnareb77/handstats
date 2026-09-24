"""
Routes du Parser Service.
"""
import io

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.pdf_extractor import extract_match_data

parser_router = APIRouter()


@parser_router.post("/parse")
async def parse_match_sheet(file: UploadFile = File(...)):
    """
    Reçoit un PDF (feuille de match FDME), extrait les tableaux
    et retourne un format structuré JSON.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Le fichier doit être un PDF (.pdf)",
        )

    contents = await file.read()
    pdf_stream = io.BytesIO(contents)

    try:
        data = extract_match_data(pdf_stream)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Erreur lors du parsing du PDF : {str(e)}",
        )

    return {
        "filename": file.filename,
        "status": "parsed",
        "data": data,
    }
