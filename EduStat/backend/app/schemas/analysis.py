from typing import Literal

from pydantic import BaseModel

from app.schemas.dataset import RowIn


class AnalysisRequest(BaseModel):
    rows: list[RowIn]


class DescriptiveStats(BaseModel):
    key: str
    label: str
    n: int
    mean: float | None
    median: float | None
    variance: float | None
    std_dev: float | None
    min: float | None
    max: float | None


class HistogramBin(BaseModel):
    start: float | None
    end: float | None
    count: int


class CorrelationResult(BaseModel):
    method: Literal["pearson", "spearman"]
    available: bool
    reason: str | None
    n: int
    coefficient: float | None
    p_value: float | None
    strength: str | None
    direction: str | None
    significant: bool | None
    interpretation: str


class CorrelationPair(BaseModel):
    x: str
    y: str
    x_label: str
    y_label: str
    pearson: CorrelationResult
    spearman: CorrelationResult


class LinePoint(BaseModel):
    x: float
    y: float


class RegressionDiagnostics(BaseModel):
    residual_normality_p: float | None
    heteroscedasticity_p: float | None
    influential_points: int | None
    out_of_range_fitted: int | None


class RegressionNote(BaseModel):
    level: Literal["info", "warning"]
    message: str


class RegressionModel(BaseModel):
    predictor: str
    response: str
    predictor_label: str
    response_label: str
    available: bool
    reason: str | None
    n: int
    intercept: float | None
    slope: float | None
    r_squared: float | None
    adj_r_squared: float | None
    f_statistic: float | None
    p_value: float | None
    significant: bool | None
    slope_std_error: float | None
    slope_ci_low: float | None
    slope_ci_high: float | None
    intercept_std_error: float | None
    residual_std_error: float | None
    equation: str | None
    line: list[LinePoint]
    interpretation: str
    diagnostics: RegressionDiagnostics
    warnings: list[RegressionNote]


class AnalysisWarning(BaseModel):
    scope: Literal["dataset", "descriptive", "correlation", "regression"]
    level: Literal["info", "warning"]
    message: str
    variable: str | None


class AnalysisResponse(BaseModel):
    generated_at: str
    n: int
    descriptive: list[DescriptiveStats]
    histograms: dict[str, list[HistogramBin]]
    correlation: list[CorrelationPair]
    regression: dict[str, RegressionModel]
    insights: list[str]
    warnings: list[AnalysisWarning]
    disclaimer: str
