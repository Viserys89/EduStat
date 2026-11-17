import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, FileDown, LoaderCircle, ShieldCheck, TriangleAlert } from "lucide-react";
import Stepper from "../components/Stepper";
import Tabs from "../components/Results/Tabs";
import DescriptiveTab from "../components/Results/DescriptiveTab";
import CorrelationTab from "../components/Results/CorrelationTab";
import RegressionTab from "../components/Results/RegressionTab";
import { useDataset } from "../context/dataset-context";
import { runAnalysis } from "../services/analysisService";
import { getErrorMessage } from "../services/datasetService";
import { PREDICTORS } from "../config/analysis";
import { fmtDateTime } from "../utils/format";

export default function ResultsPage() {
  const navigate = useNavigate();
  const { validation, analysis, setAnalysis } = useDataset();
  const [tab, setTab] = useState("descriptive");
  const [predictor, setPredictor] = useState(PREDICTORS[0]);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const rows = validation?.valid ? validation.rows : null;

  useEffect(() => {
    if (!rows || analysis) return;
    let cancelled = false;
    runAnalysis(rows)
      .then((data) => {
        if (!cancelled) setAnalysis(data);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [rows, analysis, attempt, setAnalysis]);

  // Dibuka tanpa dataset valid (mis. setelah refresh) -> kembali ke Input
  if (!rows) return <Navigate to="/input" replace />;

  const retry = () => {
    setError("");
    setAttempt((a) => a + 1);
  };
  const goToStep = (n) => navigate(n === 1 ? "/input" : "/validate");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1120px] flex-col gap-6 px-6 py-10">
      <Stepper current={3} onStepClick={goToStep} />

      {!analysis && !error && (
        <section role="status" className="glass-card flex flex-col items-center gap-4 px-6 py-24 text-center">
          <LoaderCircle size={36} className="animate-spin text-sky" aria-hidden="true" />
          <p className="font-heading text-xl font-semibold text-white">Menghitung analisis statistik...</p>
          <p className="text-sm text-ink-soft">Statistik deskriptif, korelasi, dan regresi sedang diproses.</p>
        </section>
      )}

      {error && (
        <section role="alert" className="glass-card flex flex-col items-center gap-4 px-6 py-20 text-center">
          <TriangleAlert size={36} className="text-error" aria-hidden="true" />
          <p className="font-heading text-xl font-semibold text-white">Analisis tidak dapat diselesaikan</p>
          <p className="max-w-md text-sm text-ink-soft">{error}</p>
          <div className="mt-2 flex gap-3">
            <button type="button" className="btn-secondary h-12 gap-2 px-5" onClick={() => navigate("/validate")}>
              <ArrowLeft size={16} /> Kembali ke Validasi
            </button>
            <button type="button" className="btn-primary h-12 min-w-0 px-6" onClick={retry}>
              Coba Lagi
            </button>
          </div>
        </section>
      )}

      {analysis && (
        <>
          <Tabs value={tab} onChange={setTab} />
          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
            {tab === "descriptive" && (
              <DescriptiveTab analysis={analysis} rows={rows} predictor={predictor} onPredictorChange={setPredictor} />
            )}
            {tab === "correlation" && <CorrelationTab analysis={analysis} rows={rows} />}
            {tab === "regression" && (
              <RegressionTab analysis={analysis} rows={rows} predictor={predictor} onPredictorChange={setPredictor} />
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <p className="flex items-center gap-2 text-sm text-slate-400">
              <ShieldCheck size={16} aria-hidden="true" />
              Laporan dibuat pada {fmtDateTime(analysis.generated_at)}
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-secondary h-14 gap-2 px-6 text-base" onClick={() => navigate("/validate")}>
                <ArrowLeft size={18} /> Kembali ke Validasi
              </button>
              <button
                type="button"
                disabled
                title="Ekspor PDF akan tersedia pada tahap berikutnya"
                className="inline-flex h-14 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-sky px-6 text-base font-semibold text-navy opacity-60"
              >
                <FileDown size={18} aria-hidden="true" /> Ekspor Laporan PDF
              </button>
            </div>
          </div>
        </>
      )}

      <p className="text-center text-xs text-slate-400">
        Dataset Anda diproses sementara dan tidak disimpan secara permanen.
      </p>
    </main>
  );
}
