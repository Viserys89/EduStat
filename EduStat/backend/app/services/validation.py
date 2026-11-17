import math
import re
from collections import Counter

from app.config import MAX_ERRORS, MAX_ROWS, MIN_ROWS, NUMERIC_RULES, REQUIRED_COLUMNS
from app.schemas.dataset import (
    CleanRow, DatasetSummary, ValidationCheck, ValidationIssue, ValidationResponse,
)

# Hanya angka desimal biasa: menolak "nan", "inf", "1e5", "1_000"
_NUMBER = re.compile(r"^[+-]?(\d+(\.\d*)?|\.\d+)$")

# Pemetaan item checklist -> kode masalah
CHECKS = {
    "required_columns": {"missing_column"},
    "data_types": {"invalid_type"},
    "missing_values": {"missing_value", "missing_id"},
    "duplicate_ids": {"duplicate_id"},
    "value_ranges": {"out_of_range"},
}


def _to_number(value, column: str) -> tuple[float | None, str]:
    """Return (angka, status) dengan status: 'ok' | 'missing' | 'invalid'."""
    if value is None:
        return None, "missing"
    if isinstance(value, bool):
        return None, "invalid"
    if isinstance(value, (int, float)):
        return (float(value), "ok") if math.isfinite(value) else (None, "invalid")

    text = str(value).strip()
    if column == "attendance":
        text = text.rstrip("%").strip()
    text = text.replace(",", ".")  # dukung koma desimal
    if text == "":
        return None, "missing"
    if not _NUMBER.match(text):
        return None, "invalid"
    return float(text), "ok"


def _issue(row: int, row_id: str, code: str, column: str, message: str) -> ValidationIssue:
    return ValidationIssue(code=code, row=row, row_id=row_id or None, column=column, message=message)


def build_checks(issues: list[ValidationIssue]) -> list[ValidationCheck]:
    codes = Counter(i.code for i in issues)
    # Jika struktur dataset bermasalah, pemeriksaan isi data tidak dijalankan
    blocked = bool(codes["missing_column"] or codes["row_count"])

    checks = []
    for key, code_set in CHECKS.items():
        count = sum(codes[c] for c in code_set)
        if count:
            status = "failed"
        elif blocked and key != "required_columns":
            status = "skipped"
        else:
            status = "passed"
        checks.append(ValidationCheck(key=key, status=status, issue_count=count))

    if codes["row_count"]:
        checks.append(ValidationCheck(key="row_count", status="failed", issue_count=codes["row_count"]))
    return checks


def build_response(
    issues: list[ValidationIssue],
    rows: list[CleanRow],
    n_rows: int,
    n_variables: int = len(REQUIRED_COLUMNS),
) -> ValidationResponse:
    valid = not issues

    if n_rows == 0 or any(i.row is None for i in issues):
        quality = None
    else:
        bad_rows = len({i.row for i in issues})
        quality = round((n_rows - bad_rows) / n_rows * 100, 1)

    return ValidationResponse(
        valid=valid,
        errors=issues[:MAX_ERRORS],
        error_count=len(issues),
        checks=build_checks(issues),
        summary=DatasetSummary(n_rows=n_rows, n_variables=n_variables, quality=quality),
        rows=rows if valid else [],
    )


def validate_rows(raw_rows: list[dict]) -> ValidationResponse:
    n = len(raw_rows)

    if n < MIN_ROWS or n > MAX_ROWS:
        message = (
            f"Dataset harus memiliki minimal {MIN_ROWS} baris data (ditemukan {n})."
            if n < MIN_ROWS
            else f"Dataset melebihi batas {MAX_ROWS} baris (ditemukan {n} baris)."
        )
        return build_response([ValidationIssue(code="row_count", message=message)], [], n)

    issues: list[ValidationIssue] = []
    clean: list[CleanRow] = []
    seen_ids: dict[str, int] = {}

    for i, raw in enumerate(raw_rows, start=1):
        before = len(issues)

        raw_id = raw.get("id")
        row_id = "" if raw_id is None else str(raw_id).strip()
        if not row_id:
            issues.append(_issue(i, row_id, "missing_id", "id", "id wajib diisi."))
        elif row_id in seen_ids:
            issues.append(_issue(i, row_id, "duplicate_id", "id",
                                 f"id '{row_id}' duplikat dengan baris {seen_ids[row_id]}."))
        else:
            seen_ids[row_id] = i

        values: dict[str, float] = {}
        for column, (low, high) in NUMERIC_RULES.items():
            number, status = _to_number(raw.get(column), column)
            if status == "missing":
                issues.append(_issue(i, row_id, "missing_value", column, "Nilai kosong (missing value)."))
            elif status == "invalid":
                issues.append(_issue(i, row_id, "invalid_type", column,
                                     f"Nilai '{str(raw.get(column))[:30]}' bukan angka yang valid."))
            elif number < low or (high is not None and number > high):
                rule = f"≥ {low}" if high is None else f"antara {low} dan {high}"
                issues.append(_issue(i, row_id, "out_of_range", column,
                                     f"Nilai harus {rule} (ditemukan {number:g})."))
            else:
                values[column] = number

        if len(issues) == before:
            clean.append(CleanRow(id=row_id, **values))

    return build_response(issues, clean, n)