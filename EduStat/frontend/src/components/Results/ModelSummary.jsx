import { fmt, fmtP } from "../../utils/format";
import Card from "./Card";

export default function ModelSummary({ model }) {
  const rows = [
    ["Intersep (a)", fmt(model.intercept, 3)],
    ["Kemiringan (b)", fmt(model.slope, 3)],
    ["Galat baku b", fmt(model.slope_std_error, 4)],
    ["Interval kepercayaan 95% b", `${fmt(model.slope_ci_low, 3)} s.d. ${fmt(model.slope_ci_high, 3)}`],
    ["R²", fmt(model.r_squared, 4)],
    ["R² terkoreksi", fmt(model.adj_r_squared, 4)],
    ["Statistik F", fmt(model.f_statistic, 2)],
    ["P-value (uji F)", fmtP(model.p_value)],
    ["Galat baku residual", fmt(model.residual_std_error, 3)],
    ["Jumlah observasi (n)", model.n],
  ];
  return (
    <Card title="Ringkasan Model">
      <dl>
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 border-b border-white/10 py-2.5 text-sm last:border-0">
            <dt className="text-ink-soft">{label}</dt>
            <dd className="font-medium tabular-nums text-white">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
