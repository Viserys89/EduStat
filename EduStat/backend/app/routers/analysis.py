import numpy as np
from fastapi import APIRouter, HTTPException

from app.config import REQUIRED_COLUMNS
from app.schemas.analysis import AnalysisRequest, AnalysisResponse
from app.services.statistics import analyze_dataset
from app.services.validation import validate_rows

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.post("", response_model=AnalysisResponse)
def run_analysis(payload: AnalysisRequest):
    """Jalankan seluruh analisis (deskriptif, korelasi, regresi) pada dataset.

    API stateless: klien mengirim ulang dataset yang sudah tervalidasi. Dataset divalidasi
    ulang di sini agar server tidak pernah menganalisis data yang tidak valid.
    """
    check = validate_rows([row.model_dump() for row in payload.rows])
    if not check.valid:
        raise HTTPException(
            status_code=422,
            detail="Dataset tidak valid. Validasi ulang dataset Anda sebelum menjalankan analisis.",
        )

    columns = {
        key: np.array([getattr(row, key) for row in check.rows], dtype=float)
        for key in REQUIRED_COLUMNS
        if key != "id"
    }
    return analyze_dataset(columns)
