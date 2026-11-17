"""Regresi linear sederhana (FR-015 s.d. FR-017), dihitung dengan SciPy/NumPy.

Rumus-rumus di sini diverifikasi terhadap statsmodels pada tests/test_statistics.py (NFR-009).
"""
import numpy as np
from scipy import stats

from .assumptions import shapiro_p
from .labels import (
    ALPHA, INCREMENT, LABELS, MIN_DIAGNOSTIC_N, RESPONSE, clean, fmt, p_text,
)


def _base(predictor: str, n: int) -> dict:
    return {
        "predictor": predictor, "response": RESPONSE,
        "predictor_label": LABELS[predictor], "response_label": LABELS[RESPONSE],
        "available": False, "reason": None, "n": n,
        "intercept": None, "slope": None, "r_squared": None, "adj_r_squared": None,
        "f_statistic": None, "p_value": None, "significant": None,
        "slope_std_error": None, "slope_ci_low": None, "slope_ci_high": None,
        "intercept_std_error": None, "residual_std_error": None,
        "equation": None, "line": [], "interpretation": "",
        "diagnostics": {
            "residual_normality_p": None, "heteroscedasticity_p": None,
            "influential_points": None, "out_of_range_fitted": None,
        },
        "warnings": [],
    }


def breusch_pagan_p(x: np.ndarray, resid: np.ndarray):
    """Uji Breusch-Pagan versi Koenker: LM = n * R^2 dari regresi e^2 terhadap x (df = 1)."""
    e2 = resid ** 2
    if np.ptp(e2) == 0:
        return None
    aux = stats.linregress(x, e2)
    lm = x.size * aux.rvalue ** 2
    return clean(stats.chi2.sf(lm, 1))


def cooks_distance(x: np.ndarray, resid: np.ndarray, sse: float) -> np.ndarray:
    """Cook's distance untuk regresi sederhana (p = 2 parameter)."""
    n = x.size
    sxx = np.sum((x - x.mean()) ** 2)
    leverage = 1 / n + (x - x.mean()) ** 2 / sxx
    s2 = sse / (n - 2)
    return resid ** 2 * leverage / (2 * s2 * (1 - leverage) ** 2)


def _equation(slope: float, intercept: float) -> str:
    sign = "+" if intercept >= 0 else "-"
    return f"y = {fmt(slope, 3)}x {sign} {fmt(abs(intercept), 3)}"


def _interpret(predictor, slope, r2, p, significant) -> str:
    response = LABELS[RESPONSE]
    predictor_label = LABELS[predictor]
    if not significant:
        return (
            f"Model regresi tidak signifikan secara statistik ({p_text(p)}), sehingga belum cukup "
            f"bukti bahwa {predictor_label} dapat memprediksi {response}. Estimasi kemiringan "
            f"({fmt(slope, 3)}) hanya bersifat deskriptif pada dataset ini."
        )
    direction = "naik" if slope > 0 else "turun"
    return (
        f"{INCREMENT[predictor]}, {response} diprediksi {direction} rata-rata "
        f"{fmt(abs(slope), 3)} poin. Model menjelaskan {fmt(r2 * 100, 1)}% variasi {response} "
        f"(R² = {fmt(r2, 3)}) dan signifikan secara statistik (uji F, {p_text(p)})."
    )


def fit_simple(x: np.ndarray, y: np.ndarray, predictor: str) -> dict:
    n = int(x.size)
    out = _base(predictor, n)

    if n < 3:
        out["reason"] = "Regresi membutuhkan minimal 3 observasi."
        out["interpretation"] = out["reason"]
        return out
    if np.ptp(x) == 0 or np.ptp(y) == 0:
        const = LABELS[predictor] if np.ptp(x) == 0 else LABELS[RESPONSE]
        out["reason"] = f"{const} bernilai konstan sehingga regresi tidak dapat dihitung."
        out["interpretation"] = out["reason"]
        return out

    fit = stats.linregress(x, y)
    dof = n - 2
    slope, intercept = float(fit.slope), float(fit.intercept)
    r2 = min(float(fit.rvalue) ** 2, 1.0)
    fitted = intercept + slope * x
    resid = y - fitted
    sse = float(np.sum(resid ** 2))
    sst = float(np.sum((y - y.mean()) ** 2))
    perfect_fit = sse <= 1e-12 * sst

    p = clean(fit.pvalue)
    significant = p is not None and p < ALPHA
    se = float(fit.stderr)
    t_crit = float(stats.t.ppf(1 - ALPHA / 2, dof))

    # --- Diagnostik asumsi (FR-022) ---
    diag = out["diagnostics"]
    notes: list[dict] = []
    if not perfect_fit:
        diag["residual_normality_p"] = shapiro_p(resid)
        if n >= MIN_DIAGNOSTIC_N:
            diag["heteroscedasticity_p"] = breusch_pagan_p(x, resid)
            diag["influential_points"] = int(np.sum(cooks_distance(x, resid, sse) > 4 / n))
    diag["out_of_range_fitted"] = int(np.sum((fitted < 0) | (fitted > 100)))

    if r2 < 0.1:
        notes.append({"level": "warning", "message":
            f"Model hanya menjelaskan {fmt(r2 * 100, 1)}% variasi {LABELS[RESPONSE]}; "
            "kemampuan prediksinya rendah."})
    p_norm = diag["residual_normality_p"]
    if p_norm is not None and p_norm < ALPHA:
        notes.append({"level": "warning", "message":
            f"Residual tidak berdistribusi normal (Shapiro-Wilk, {p_text(p_norm)}). Uji signifikansi "
            "dan interval kepercayaan dapat kurang akurat, terutama pada sampel kecil."})
    p_het = diag["heteroscedasticity_p"]
    if p_het is not None and p_het < ALPHA:
        notes.append({"level": "warning", "message":
            f"Terdapat indikasi heteroskedastisitas (Breusch-Pagan, {p_text(p_het)}): sebaran "
            "residual tidak konstan sepanjang nilai prediktor, sehingga galat baku koefisien "
            "mungkin kurang tepat."})
    if diag["influential_points"]:
        notes.append({"level": "warning", "message":
            f"Terdapat {diag['influential_points']} observasi berpengaruh besar (Cook's distance > 4/n) "
            "yang dapat menggeser garis regresi."})
    if diag["out_of_range_fitted"]:
        notes.append({"level": "warning", "message":
            f"Garis regresi menghasilkan {diag['out_of_range_fitted']} prediksi di luar rentang 0-100 "
            f"untuk {LABELS[RESPONSE]}. Hubungan linear kemungkinan tidak berlaku di ujung rentang data."})
    if n < MIN_DIAGNOSTIC_N:
        notes.append({"level": "info", "message":
            f"Diagnostik homoskedastisitas dan titik berpengaruh tidak dijalankan karena n < {MIN_DIAGNOSTIC_N}."})

    x_min, x_max = float(np.min(x)), float(np.max(x))
    out.update(
        available=True,
        intercept=clean(intercept), slope=clean(slope),
        r_squared=clean(r2), adj_r_squared=clean(1 - (1 - r2) * (n - 1) / dof),
        f_statistic=clean(r2 * dof / (1 - r2)) if r2 < 1 else None,
        p_value=p, significant=significant,
        slope_std_error=clean(se),
        slope_ci_low=clean(slope - t_crit * se), slope_ci_high=clean(slope + t_crit * se),
        intercept_std_error=clean(fit.intercept_stderr),
        residual_std_error=clean(np.sqrt(sse / dof)),
        equation=_equation(slope, intercept),
        line=[
            {"x": x_min, "y": intercept + slope * x_min},
            {"x": x_max, "y": intercept + slope * x_max},
        ],
        interpretation=_interpret(predictor, slope, r2, p, significant),
        warnings=notes,
    )
    return out
