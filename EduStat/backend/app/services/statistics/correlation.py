"""Analisis korelasi Pearson dan Spearman (FR-012 s.d. FR-014)."""
import numpy as np
from scipy import stats

from .labels import ALPHA, LABELS, PAIRS, clean, fmt, p_text

METHODS = {"pearson": ("Pearson", "r"), "spearman": ("Spearman", "ρ")}


def strength_label(coefficient: float) -> str:
    """Kategori kekuatan hubungan (acuan umum: Sugiyono)."""
    a = abs(coefficient)
    if a < 0.2:
        return "sangat lemah"
    if a < 0.4:
        return "lemah"
    if a < 0.6:
        return "sedang"
    if a < 0.8:
        return "kuat"
    return "sangat kuat"


def correlate(x: np.ndarray, y: np.ndarray, x_key: str, y_key: str, method: str) -> dict:
    out = {
        "method": method, "available": False, "reason": None, "n": int(x.size),
        "coefficient": None, "p_value": None, "strength": None, "direction": None,
        "significant": None, "interpretation": "",
    }

    for arr, key in ((x, x_key), (y, y_key)):
        if np.ptp(arr) == 0:
            out["reason"] = f"{LABELS[key]} bernilai konstan sehingga korelasi tidak dapat dihitung."
            out["interpretation"] = out["reason"]
            return out

    res = stats.pearsonr(x, y) if method == "pearson" else stats.spearmanr(x, y)
    coef, p = clean(res.statistic), clean(res.pvalue)
    if coef is None or p is None:
        out["reason"] = "Koefisien korelasi tidak dapat dihitung untuk data ini."
        out["interpretation"] = out["reason"]
        return out

    coef = max(-1.0, min(1.0, coef))
    direction = "positif" if coef > 0 else "negatif" if coef < 0 else None
    strength = strength_label(coef)
    significant = p < ALPHA
    name, symbol = METHODS[method]
    kind = "hubungan monotonik" if method == "spearman" else "hubungan"

    relation = f"{kind} {direction} yang {strength}" if direction else f"{kind} yang tidak berarah"
    text = (
        f"Terdapat {relation} antara {LABELS[x_key]} dan {LABELS[y_key]} "
        f"({name} {symbol} = {fmt(coef)}; {p_text(p)}). "
    )
    text += (
        "Hubungan ini signifikan secara statistik pada α = 0,05."
        if significant
        else "Hubungan ini tidak signifikan secara statistik pada α = 0,05, sehingga belum "
             "cukup bukti adanya hubungan pada populasi."
    )

    out.update(
        available=True, coefficient=coef, p_value=p, strength=strength,
        direction=direction, significant=significant, interpretation=text,
    )
    return out


def correlate_pairs(columns: dict[str, np.ndarray]) -> list[dict]:
    return [
        {
            "x": x_key, "y": y_key,
            "x_label": LABELS[x_key], "y_label": LABELS[y_key],
            "pearson": correlate(columns[x_key], columns[y_key], x_key, y_key, "pearson"),
            "spearman": correlate(columns[x_key], columns[y_key], x_key, y_key, "spearman"),
        }
        for x_key, y_key in PAIRS
    ]
