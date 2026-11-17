"""Konstanta, label, dan helper format untuk modul statistik."""
import math

ALPHA = 0.05              # taraf signifikansi
SMALL_SAMPLE = 30         # di bawah ini, beri peringatan sampel kecil
MIN_DIAGNOSTIC_N = 10     # minimum n untuk diagnostik regresi (heteroskedastisitas, pengaruh titik)

VARIABLES = ("study_hours", "attendance", "exam_score")
PREDICTORS = ("study_hours", "attendance")   # FR-016
RESPONSE = "exam_score"
PAIRS = (
    ("study_hours", "exam_score"),
    ("attendance", "exam_score"),
    ("study_hours", "attendance"),
)

LABELS = {
    "study_hours": "Jam Belajar",
    "attendance": "Kehadiran",
    "exam_score": "Nilai Ujian",
}

INCREMENT = {
    "study_hours": "Setiap tambahan 1 jam belajar",
    "attendance": "Setiap kenaikan 1 poin persentase kehadiran",
}

DISCLAIMER = (
    "Hasil analisis menunjukkan hubungan statistik pada dataset yang digunakan "
    "dan tidak membuktikan hubungan sebab-akibat."
)


def clean(value):
    """Ubah ke float Python; NaN/inf/None -> None agar aman dikirim sebagai JSON."""
    if value is None:
        return None
    try:
        v = float(value)
    except (TypeError, ValueError):
        return None
    return v if math.isfinite(v) else None


def fmt(value, digits: int = 2) -> str:
    """Format angka berbahasa Indonesia (koma desimal)."""
    v = clean(value)
    if v is None:
        return "—"
    if round(v, digits) == 0:
        v = 0.0  # hindari "-0,00"
    return f"{v:.{digits}f}".replace(".", ",")


def p_text(p) -> str:
    if p is None:
        return "p tidak tersedia"
    return "p < 0,0001" if p < 0.0001 else f"p = {fmt(p, 4)}"
