import { CircleCheck, CircleMinus, TriangleAlert } from "lucide-react";
import { ALPHA } from "../../config/analysis";
import { pText } from "../../utils/format";
import Card from "./Card";

const pItem = (label, p) =>
  p == null
    ? { label, status: "skipped", detail: "Tidak dijalankan" }
    : { label, status: p >= ALPHA ? "ok" : "warn", detail: pText(p) };

const countItem = (label, count, okText, warnText) =>
  count == null
    ? { label, status: "skipped", detail: "Tidak dijalankan" }
    : { label, status: count === 0 ? "ok" : "warn", detail: count === 0 ? okText : warnText(count) };

const STATUS = {
  ok: { color: "text-success", Icon: CircleCheck },
  warn: { color: "text-warning", Icon: TriangleAlert },
  skipped: { color: "text-slate-400", Icon: CircleMinus },
};

export default function AssumptionChecklist({ diagnostics }) {
  const items = [
    pItem("Normalitas residual (Shapiro-Wilk)", diagnostics.residual_normality_p),
    pItem("Homoskedastisitas (Breusch-Pagan)", diagnostics.heteroscedasticity_p),
    countItem("Titik berpengaruh (Cook's distance)", diagnostics.influential_points, "Tidak ada", (n) => `${n} titik`),
    countItem("Prediksi dalam rentang 0-100", diagnostics.out_of_range_fitted, "Semua dalam rentang", (n) => `${n} di luar rentang`),
  ];
  return (
    <Card title="Pemeriksaan Asumsi">
      <ul>
        {items.map(({ label, status, detail }) => {
          const { color, Icon } = STATUS[status];
          return (
            <li key={label} className="flex items-center justify-between gap-3 border-b border-white/10 py-3 text-sm last:border-0">
              <span className="text-ink-soft">{label}</span>
              <span className={`flex shrink-0 items-center gap-2 text-xs font-medium ${color}`}>
                {detail}
                <Icon size={18} aria-hidden="true" />
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
