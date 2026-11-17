"""Orkestrator analisis: menggabungkan deskriptif, korelasi, regresi, peringatan, dan insight."""
from datetime import datetime, timezone

import numpy as np

from .assumptions import shapiro_p
from .correlation import correlate_pairs
from .descriptive import count_outliers, describe, histogram
from .labels import (
    ALPHA, DISCLAIMER, LABELS, PREDICTORS, RESPONSE, SMALL_SAMPLE, VARIABLES, fmt, p_text,
)
from .regression import fit_simple


def _collect_warnings(columns, n, regression) -> list[dict]:
    items: list[dict] = []

    def add(scope, level, message, variable=None):
        items.append({"scope": scope, "level": level, "message": message, "variable": variable})

    if n < SMALL_SAMPLE:
        add("dataset", "warning",
            f"Jumlah observasi hanya {n}. Pada sampel kecil, koefisien dan p-value kurang stabil; "
            "interpretasikan dengan hati-hati.")

    for key in VARIABLES:
        values = columns[key]
        label = LABELS[key]
        if np.ptp(values) == 0:
            add("dataset", "warning",
                f"{label} bernilai konstan sehingga korelasi dan regresi yang melibatkannya tidak dapat dihitung.",
                key)
            continue
        outliers = count_outliers(values)
        if outliers:
            add("descriptive", "info",
                f"{label}: terdapat {outliers} nilai pencilan (aturan 1,5 x IQR) yang dapat memengaruhi "
                "rata-rata, korelasi Pearson, dan regresi.", key)
        p_norm = shapiro_p(values)
        if p_norm is not None and p_norm < ALPHA:
            add("correlation", "warning",
                f"Distribusi {label} menyimpang dari normal (Shapiro-Wilk, {p_text(p_norm)}). Pearson "
                "mengasumsikan hubungan linear dan data mendekati normal; pertimbangkan Spearman.", key)

    for predictor in PREDICTORS:
        for note in regression[predictor]["warnings"]:
            add("regression", note["level"], note["message"], predictor)
    return items


def _build_insights(correlation, regression) -> list[str]:
    items: list[str] = []
    for pair in correlation:
        if pair["y"] != RESPONSE or not pair["pearson"]["available"]:
            continue
        pr = pair["pearson"]
        suffix = "" if pr["significant"] else ", tetapi tidak signifikan secara statistik"
        relation = f"hubungan {pr['direction']} yang {pr['strength']}" if pr["direction"] else "hubungan tanpa arah"
        items.append(
            f"{pair['x_label']} memiliki {relation} dengan {pair['y_label']} "
            f"(r = {fmt(pr['coefficient'])}){suffix}."
        )

    usable = [m for m in regression.values() if m["available"]]
    if usable:
        best = max(usable, key=lambda m: m["r_squared"])
        text = (
            f"{best['predictor_label']} adalah prediktor terbaik dalam regresi linear sederhana: "
            f"menjelaskan {fmt(best['r_squared'] * 100, 1)}% variasi {best['response_label']} "
            f"(R² = {fmt(best['r_squared'], 3)})."
        )
        if not best["significant"]:
            text += " Namun, model ini tidak signifikan secara statistik."
        items.append(text)
    return items


def analyze_dataset(columns: dict[str, np.ndarray]) -> dict:
    """columns: peta nama kolom -> array float 1 dimensi (dataset yang sudah tervalidasi)."""
    n = int(columns[RESPONSE].size)

    correlation = correlate_pairs(columns)
    regression = {p: fit_simple(columns[p], columns[RESPONSE], p) for p in PREDICTORS}

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "n": n,
        "descriptive": [describe(k, columns[k]) for k in VARIABLES],
        "histograms": {k: histogram(columns[k]) for k in VARIABLES},
        "correlation": correlation,
        "regression": regression,
        "insights": _build_insights(correlation, regression),
        "warnings": _collect_warnings(columns, n, regression),
        "disclaimer": DISCLAIMER,
    }
