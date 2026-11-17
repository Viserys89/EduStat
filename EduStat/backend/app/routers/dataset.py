from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config import MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, REQUIRED_COLUMNS
from app.schemas.dataset import ValidateRequest, ValidationIssue, ValidationResponse
from app.services.csv_reader import CSVReadError, read_csv_rows
from app.services.validation import build_response, validate_rows

router = APIRouter(prefix="/api/dataset", tags=["dataset"])


@router.post("/validate", response_model=ValidationResponse)
def validate_manual(payload: ValidateRequest):
    """Validasi data hasil input manual."""
    return validate_rows([row.model_dump() for row in payload.rows])


@router.post("/validate-csv", response_model=ValidationResponse)
async def validate_csv(file: UploadFile = File(...)):
    """Validasi file CSV yang diunggah."""
    if not (file.filename or "").lower().endswith(".csv"):  # NFR-013
        raise HTTPException(status_code=400, detail="Hanya file berformat .csv yang diterima.")

    content = await file.read(MAX_FILE_SIZE_BYTES + 1)
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail=f"Ukuran file maksimal {MAX_FILE_SIZE_MB} MB.")

    try:
        rows, columns = read_csv_rows(content)
    except CSVReadError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    missing = [c for c in REQUIRED_COLUMNS if c not in columns]  # FR-004
    if missing:
        issue = ValidationIssue(
            code="missing_column",
            message=(
                f"Kolom wajib tidak ditemukan: {', '.join(missing)}. "
                f"Kolom yang dibutuhkan: {', '.join(REQUIRED_COLUMNS)}."
            ),
        )
        return build_response([issue], [], len(rows), n_variables=len(REQUIRED_COLUMNS) - len(missing))

    return validate_rows(rows)