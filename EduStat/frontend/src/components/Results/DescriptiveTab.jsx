import { RESPONSE } from "../../config/analysis";
import DescriptiveTable from "./DescriptiveTable";
import HistogramCard from "./HistogramCard";
import InsightsCard from "./InsightsCard";
import NotesCard from "./NotesCard";
import PearsonCard from "./PearsonCard";
import RegressionCard from "./RegressionCard";

export default function DescriptiveTab({ analysis, rows, predictor, onPredictorChange }) {
  const model = analysis.regression[predictor];
  const pair = analysis.correlation.find((p) => p.x === predictor && p.y === RESPONSE);
  const notes = analysis.warnings.filter((w) => w.scope === "dataset" || w.scope === "descriptive");

  return (
    <div className="flex flex-col gap-6">
      <DescriptiveTable stats={analysis.descriptive} n={analysis.n} />
      <HistogramCard histograms={analysis.histograms} />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <RegressionCard model={model} rows={rows} predictor={predictor} onPredictorChange={onPredictorChange} />
        <div className="flex flex-col gap-6">
          <PearsonCard pair={pair} disclaimer={analysis.disclaimer} />
          <InsightsCard items={analysis.insights} />
        </div>
      </div>
      <NotesCard items={notes} />
    </div>
  );
}
