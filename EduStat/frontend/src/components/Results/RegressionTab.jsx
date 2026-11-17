import AssumptionChecklist from "./AssumptionChecklist";
import Card from "./Card";
import ModelSummary from "./ModelSummary";
import NotesCard from "./NotesCard";
import RegressionCard from "./RegressionCard";

export default function RegressionTab({ analysis, rows, predictor, onPredictorChange }) {
  const model = analysis.regression[predictor];
  const notes = analysis.warnings.filter(
    (w) => w.scope === "dataset" || (w.scope === "regression" && w.variable === predictor)
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <RegressionCard model={model} rows={rows} predictor={predictor} onPredictorChange={onPredictorChange} />
          {model.available && (
            <Card title="Interpretasi">
              <p className="text-sm leading-relaxed text-ink-soft">{model.interpretation}</p>
              <p className="mt-3 text-xs italic text-slate-400">&ldquo;{analysis.disclaimer}&rdquo;</p>
            </Card>
          )}
        </div>
        {model.available && (
          <div className="flex flex-col gap-6">
            <ModelSummary model={model} />
            <AssumptionChecklist diagnostics={model.diagnostics} />
          </div>
        )}
      </div>
      <NotesCard items={notes} />
    </div>
  );
}
