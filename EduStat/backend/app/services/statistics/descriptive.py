"""Statistik deskriptif dan histogram (FR-010, FR-011, FR-018)."""
import math

import numpy as np

from .labels import LABELS, clean


def describe(key: str, values: np.ndarray) -> dict:
    """Varians dan simpangan baku memakai definisi sampel (ddof = 1)."""
    return {
        "key": key,
        "label": LABELS[key],
        "n": int(values.size),
        "mean": clean(np.mean(values)),
        "median": clean(np.median(values)),
        "variance": clean(np.var(values, ddof=1)),
        "std_dev": clean(np.std(values, ddof=1)),
        "min": clean(np.min(values)),
        "max": clean(np.max(values)),
    }


def count_outliers(values: np.ndarray) -> int:
    """Jumlah pencilan menurut aturan 1,5 x IQR."""
    q1, q3 = np.percentile(values, [25, 75])
    iqr = q3 - q1
    if iqr == 0:
        return 0
    low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr
    return int(np.sum((values < low) | (values > high)))


def histogram(values: np.ndarray) -> list[dict]:
    """Histogram dengan jumlah kelas aturan Sturges, dibatasi 5-15 kelas."""
    n = int(values.size)
    low, high = float(np.min(values)), float(np.max(values))
    if low == high:
        return [{"start": low, "end": high, "count": n}]
    k = int(min(max(math.ceil(math.log2(n)) + 1, 5), 15))
    counts, edges = np.histogram(values, bins=k)
    return [
        {"start": clean(edges[i]), "end": clean(edges[i + 1]), "count": int(counts[i])}
        for i in range(k)
    ]
