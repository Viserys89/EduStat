"""Verifikasi perhitungan statistik (NFR-008, NFR-009).

Pembanding independen: nilai acuan Anscombe's quartet I, NumPy, serta statsmodels
(otomatis dilewati jika statsmodels tidak terpasang).
"""
import json

import numpy as np
import pytest
from numpy.testing import assert_allclose
from scipy import stats

from app.services.statistics import analyze_dataset
from app.services.statistics.correlation import correlate, strength_label
from app.services.statistics.descriptive import describe, histogram
from app.services.statistics.regression import cooks_distance, fit_simple

# Anscombe's quartet, set I (nilai acuan terpublikasi)
AX = np.array([10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5], dtype=float)
AY = np.array([8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68])


def make_columns(n=60, seed=42):
    rng = np.random.default_rng(seed)
    hours = rng.uniform(2, 24, n)
    attendance = np.clip(rng.normal(88, 7, n), 50, 100)
    score = np.clip(30 + 2.6 * hours + 0.15 * attendance + rng.normal(0, 5, n), 0, 100)
    return {"study_hours": hours, "attendance": attendance, "exam_score": score}


def test_regression_matches_anscombe_reference():
    m = fit_simple(AX, AY, "study_hours")
    assert_allclose(m["slope"], 0.5001, atol=1e-3)
    assert_allclose(m["intercept"], 3.0001, atol=1e-3)
    assert_allclose(m["r_squared"], 0.6665, atol=1e-3)
    assert_allclose(m["slope_std_error"], 0.1179, atol=1e-3)
    assert_allclose(m["p_value"], 0.00217, atol=1e-4)
    assert m["significant"] is True
    assert m["equation"] == "y = 0,500x + 3,000"


def test_regression_f_statistic_equals_t_squared():
    m = fit_simple(AX, AY, "study_hours")
    t = m["slope"] / m["slope_std_error"]
    assert_allclose(m["f_statistic"], t ** 2, rtol=1e-9)
    # CI 95% harus memuat slope dan simetris
    assert m["slope_ci_low"] < m["slope"] < m["slope_ci_high"]


def test_pearson_matches_numpy_and_spearman_matches_ranks():
    rng = np.random.default_rng(1)
    x, y = rng.normal(size=40), rng.normal(size=40)
    y = y + 0.5 * x
    pr = correlate(x, y, "study_hours", "exam_score", "pearson")
    sp = correlate(x, y, "study_hours", "exam_score", "spearman")
    assert_allclose(pr["coefficient"], np.corrcoef(x, y)[0, 1], atol=1e-12)
    ranks = np.corrcoef(stats.rankdata(x), stats.rankdata(y))[0, 1]
    assert_allclose(sp["coefficient"], ranks, atol=1e-12)


def test_spearman_handles_ties():
    x = np.array([1, 2, 2, 3, 4, 4, 5], dtype=float)
    y = np.array([2, 1, 3, 3, 5, 6, 7], dtype=float)
    sp = correlate(x, y, "study_hours", "exam_score", "spearman")
    assert_allclose(sp["coefficient"], np.corrcoef(stats.rankdata(x), stats.rankdata(y))[0, 1], atol=1e-12)


def test_correlation_text_and_strength():
    pr = correlate(AX, AY, "study_hours", "exam_score", "pearson")
    assert pr["strength"] == "sangat kuat" and pr["direction"] == "positif"
    assert "signifikan secara statistik" in pr["interpretation"]
    assert [strength_label(v) for v in (0.1, 0.3, 0.5, 0.7, 0.9, -0.85)] == [
        "sangat lemah", "lemah", "sedang", "kuat", "sangat kuat", "sangat kuat"]


def test_not_significant_correlation_is_reported_as_such():
    x = np.array([1, 2, 3, 4, 5, 6], dtype=float)
    y = np.array([3, 1, 4, 1, 5, 2], dtype=float)
    pr = correlate(x, y, "study_hours", "exam_score", "pearson")
    assert pr["significant"] is False
    assert "tidak signifikan" in pr["interpretation"]


def test_descriptive_uses_sample_variance():
    d = describe("exam_score", AY)
    assert_allclose(d["variance"], np.var(AY, ddof=1))
    assert_allclose(d["std_dev"], np.std(AY, ddof=1))
    assert_allclose(d["median"], np.median(AY))
    assert d["min"] == AY.min() and d["max"] == AY.max()


def test_histogram_counts_sum_to_n():
    cols = make_columns(200)
    for values in cols.values():
        bins = histogram(values)
        assert sum(b["count"] for b in bins) == 200
        assert 5 <= len(bins) <= 15


def test_cooks_distance_matches_leave_one_out():
    sse = None
    fit = stats.linregress(AX, AY)
    resid = AY - (fit.intercept + fit.slope * AX)
    sse = float(np.sum(resid ** 2))
    fast = cooks_distance(AX, resid, sse)

    s2 = sse / (len(AX) - 2)
    brute = []
    for i in range(len(AX)):
        keep = np.arange(len(AX)) != i
        f_i = stats.linregress(AX[keep], AY[keep])
        pred_all_i = f_i.intercept + f_i.slope * AX
        pred_all = fit.intercept + fit.slope * AX
        brute.append(np.sum((pred_all - pred_all_i) ** 2) / (2 * s2))
    assert_allclose(fast, brute, rtol=1e-9)


def test_constant_variable_is_handled_without_nan():
    cols = make_columns(30)
    cols["attendance"] = np.full(30, 90.0)
    result = analyze_dataset(cols)
    json.dumps(result, allow_nan=False)  # tidak boleh ada NaN/inf
    corr = {(p["x"], p["y"]): p for p in result["correlation"]}
    assert corr[("attendance", "exam_score")]["pearson"]["available"] is False
    assert result["regression"]["attendance"]["available"] is False
    assert result["regression"]["study_hours"]["available"] is True
    assert any(w["scope"] == "dataset" and "konstan" in w["message"] for w in result["warnings"])


def test_perfect_linear_data_is_json_safe():
    x = np.arange(1, 13, dtype=float)
    cols = {"study_hours": x, "attendance": x * 2, "exam_score": 3 * x + 5}
    result = analyze_dataset(cols)
    json.dumps(result, allow_nan=False)
    m = result["regression"]["study_hours"]
    assert_allclose(m["r_squared"], 1.0)
    assert m["f_statistic"] is None


def test_minimum_dataset_of_three_rows():
    cols = {
        "study_hours": np.array([1.0, 2.0, 4.0]),
        "attendance": np.array([80.0, 85.0, 95.0]),
        "exam_score": np.array([60.0, 70.0, 85.0]),
    }
    result = analyze_dataset(cols)
    json.dumps(result, allow_nan=False)
    assert result["n"] == 3
    assert any("hanya 3" in w["message"] for w in result["warnings"])


def test_full_analysis_structure_and_insights():
    result = analyze_dataset(make_columns(80))
    json.dumps(result, allow_nan=False)
    assert result["n"] == 80
    assert [d["key"] for d in result["descriptive"]] == ["study_hours", "attendance", "exam_score"]
    assert len(result["correlation"]) == 3
    assert set(result["regression"]) == {"study_hours", "attendance"}
    assert result["regression"]["study_hours"]["r_squared"] > result["regression"]["attendance"]["r_squared"]
    assert any("prediktor terbaik" in s for s in result["insights"])
    assert "sebab-akibat" in result["disclaimer"]


def test_results_are_deterministic():
    a = analyze_dataset(make_columns(50))
    b = analyze_dataset(make_columns(50))
    a.pop("generated_at"), b.pop("generated_at")
    assert a == b


# ---------- Pembanding statsmodels (NFR-009) ----------
def test_regression_matches_statsmodels():
    sm = pytest.importorskip("statsmodels.api")
    cols = make_columns(120, seed=7)
    x, y = cols["study_hours"], cols["exam_score"]
    ols = sm.OLS(y, sm.add_constant(x)).fit()
    m = fit_simple(x, y, "study_hours")
    assert_allclose([m["intercept"], m["slope"]], ols.params, rtol=1e-9)
    assert_allclose(m["r_squared"], ols.rsquared, rtol=1e-9)
    assert_allclose(m["adj_r_squared"], ols.rsquared_adj, rtol=1e-9)
    assert_allclose(m["f_statistic"], ols.fvalue, rtol=1e-9)
    assert_allclose(m["p_value"], ols.f_pvalue, rtol=1e-9)
    assert_allclose(m["slope_std_error"], ols.bse[1], rtol=1e-9)
    assert_allclose(m["intercept_std_error"], ols.bse[0], rtol=1e-9)
    assert_allclose([m["slope_ci_low"], m["slope_ci_high"]], ols.conf_int()[1], rtol=1e-9)
    assert_allclose(m["residual_std_error"], np.sqrt(ols.mse_resid), rtol=1e-9)


def test_diagnostics_match_statsmodels():
    sm = pytest.importorskip("statsmodels.api")
    from statsmodels.stats.diagnostic import het_breuschpagan

    cols = make_columns(120, seed=11)
    x, y = cols["attendance"], cols["exam_score"]
    X = sm.add_constant(x)
    ols = sm.OLS(y, X).fit()
    m = fit_simple(x, y, "attendance")
    assert_allclose(m["diagnostics"]["heteroscedasticity_p"], het_breuschpagan(ols.resid, X)[1], rtol=1e-9)
    cooks = ols.get_influence().cooks_distance[0]
    assert m["diagnostics"]["influential_points"] == int(np.sum(cooks > 4 / len(x)))
