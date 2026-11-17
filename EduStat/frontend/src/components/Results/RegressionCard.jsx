import { useMemo } from "react";
import { PREDICTOR_OPTIONS, RESPONSE } from "../../config/analysis";
import { pointsFrom } from "../../utils/chart";
import { fmt, fmtP } from "../../utils/format";
import Card from "./Card";
import { SelectField } from "./Controls";
import ScatterPlot from "./ScatterPlot";

const TONES = { sky: "text-sky", success: "text-success", warning: "text-warning" };

function Metric({ label, value, tone }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-1 font-heading text-xl font-semibold ${TONES[tone] ?? "text-white"}`}>{value}</p>
    </div>
  );
}

export default function RegressionCard({ model, rows, predictor, onPredictorChange }) {
  const points = useMemo(() => pointsFrom(rows, predictor, RESPONSE), [rows, predictor]);

  return (
    <Card
      title="Analisis Regresi"
      subtitle={`Tren linear ${model.predictor_label} terhadap ${model.response_label}`}
      action={
        <SelectField label="Prediktor" value={predictor} onChange={onPredictorChange} options={PREDICTOR_OPTIONS} />
      }
    >
      {model.available ? (
        <>
          <ScatterPlot
            points={points}
            line={model.line}
            xLabel={model.predictor_label}
            yLabel={model.response_label}
            height={340}
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric label="Persamaan" value={model.equation} />
            <Metric label="Koefisien Determinasi (R²)" value={fmt(model.r_squared, 3)} tone="sky" />
            <Metric label="P-value (uji F)" value={fmtP(model.p_value)} tone={model.significant ? "success" : "warning"} />
          </div>
        </>
      ) : (
        <p role="alert" className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-amber-100">
          {model.reason}
        </p>
      )}
    </Card>
  );
}
