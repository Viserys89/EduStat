import { useMemo, useState } from "react";
import { pointsFrom } from "../../utils/chart";
import Card from "./Card";
import { Segmented, SelectField } from "./Controls";
import CorrelationGauge from "./CorrelationGauge";
import CorrelationMatrix from "./CorrelationMatrix";
import NotesCard from "./NotesCard";
import ScatterPlot from "./ScatterPlot";

const METHOD_OPTIONS = [
  { value: "pearson", label: "Pearson" },
  { value: "spearman", label: "Spearman" },
];

const METHOD_NOTE = {
  pearson: "Pearson mengukur kekuatan hubungan linear antara dua variabel numerik.",
  spearman: "Spearman mengukur hubungan monotonik berdasarkan peringkat; tidak mengasumsikan data berdistribusi normal.",
};

export default function CorrelationTab({ analysis, rows }) {
  const [method, setMethod] = useState("pearson");
  const [pairIndex, setPairIndex] = useState(0);

  const pair = analysis.correlation[pairIndex];
  const result = pair[method];
  const points = useMemo(() => pointsFrom(rows, pair.x, pair.y), [rows, pair]);
  const pairOptions = analysis.correlation.map((p, i) => ({ value: String(i), label: `${p.x_label} vs ${p.y_label}` }));
  const pairLabel = `${pair.x_label} vs ${pair.y_label}`;
  const notes = analysis.warnings.filter(
    (w) => w.scope === "dataset" || (w.scope === "correlation" && (w.variable === pair.x || w.variable === pair.y))
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SelectField label="Pasangan variabel" value={String(pairIndex)} onChange={(v) => setPairIndex(Number(v))} options={pairOptions} />
        <Segmented label="Metode korelasi" options={METHOD_OPTIONS} value={method} onChange={setMethod} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card title="Diagram Pencar" subtitle={pairLabel}>
          <ScatterPlot points={points} xLabel={pair.x_label} yLabel={pair.y_label} height={360} />
        </Card>

        <Card title={`Korelasi ${method === "pearson" ? "Pearson" : "Spearman"}`}>
          <CorrelationGauge result={result} pairLabel={pairLabel} />
          <p className="mt-6 border-t border-white/10 pt-5 text-sm leading-relaxed text-ink-soft">{result.interpretation}</p>
          <p className="mt-3 text-xs text-slate-400">{METHOD_NOTE[method]}</p>
        </Card>
      </div>

      <Card title="Matriks Korelasi" subtitle={`Koefisien ${method === "pearson" ? "Pearson (r)" : "Spearman (ρ)"} untuk seluruh pasangan variabel.`}>
        <CorrelationMatrix correlation={analysis.correlation} method={method} selectedIndex={pairIndex} onSelect={setPairIndex} />
      </Card>

      <p className="text-center text-xs italic text-slate-400">&ldquo;{analysis.disclaimer}&rdquo;</p>
      <NotesCard items={notes} />
    </div>
  );
}
