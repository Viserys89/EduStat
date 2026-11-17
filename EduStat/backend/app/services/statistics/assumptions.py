"""Pemeriksaan asumsi statistik."""
import numpy as np
from scipy import stats

from .labels import clean


def shapiro_p(values: np.ndarray):
    """p-value uji Shapiro-Wilk; None jika tidak dapat dihitung."""
    if values.size < 3 or np.ptp(values) == 0:
        return None
    return clean(stats.shapiro(values).pvalue)
