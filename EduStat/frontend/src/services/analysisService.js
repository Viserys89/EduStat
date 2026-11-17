import api from "./api";

/**
 * POST /api/analysis  body { rows: [{ id, study_hours, attendance, exam_score }] }
 * Respons: { generated_at, n, descriptive, histograms, correlation, regression,
 *            insights, warnings, disclaimer }
 * API stateless: dataset yang sudah tervalidasi dikirim ulang pada setiap analisis.
 */
export async function runAnalysis(rows) {
  const { data } = await api.post("/api/analysis", { rows });
  return data;
}
