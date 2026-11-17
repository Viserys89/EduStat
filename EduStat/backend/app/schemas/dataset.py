from typing import Literal

from pydantic import BaseModel


class RowIn(BaseModel):
    id: str | int | None = None
    study_hours: str | float | int | None = None
    attendance: str | float | int | None = None
    exam_score: str | float | int | None = None


class ValidateRequest(BaseModel):
    rows: list[RowIn]


class ValidationIssue(BaseModel):
    code: Literal[
        "missing_column", "row_count", "missing_id",
        "missing_value", "invalid_type", "out_of_range", "duplicate_id",
    ]
    row: int | None = None       # nomor baris data (mulai 1); None = masalah umum
    row_id: str | None = None    # nilai kolom id pada baris tersebut
    column: str | None = None
    message: str


class ValidationCheck(BaseModel):
    key: Literal[
        "required_columns", "data_types", "missing_values",
        "duplicate_ids", "value_ranges", "row_count",
    ]
    status: Literal["passed", "failed", "skipped"]
    issue_count: int


class CleanRow(BaseModel):
    id: str
    study_hours: float
    attendance: float
    exam_score: float


class DatasetSummary(BaseModel):
    n_rows: int
    n_variables: int
    quality: float | None        # % baris tanpa masalah; None jika tidak dapat dihitung


class ValidationResponse(BaseModel):
    valid: bool
    errors: list[ValidationIssue]   # dipotong sampai MAX_ERRORS
    error_count: int                # total error sebenarnya
    checks: list[ValidationCheck]
    summary: DatasetSummary
    rows: list[CleanRow]            # hanya terisi jika valid