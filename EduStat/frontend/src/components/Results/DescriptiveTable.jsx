import { Sigma } from "lucide-react";
import { RESPONSE, TABLE_HEADERS } from "../../config/analysis";
import { fmt } from "../../utils/format";

const ROWS = [
  { id: "mean", label: "Rata-rata (Mean)", value: (s) => fmt(s.mean) },
  { id: "median", label: "Median", value: (s) => fmt(s.median) },
  { id: "variance", label: "Varians", value: (s) => fmt(s.variance) },
  { id: "std", label: "Standar Deviasi", value: (s) => fmt(s.std_dev) },
  { id: "range", label: "Min / Maks", value: (s) => `${fmt(s.min)} - ${fmt(s.max)}` },
];

export default function DescriptiveTable({ stats, n }) {
  return (
    <section className="glass-card overflow-hidden">
      <header className="flex items-center justify-between gap-3 px-6 py-5">
        <h2 className="flex items-center gap-2 font-heading text-xl font-semibold text-white">
          <Sigma size={20} className="text-teal" aria-hidden="true" />
          Tendensi Sentral dan Dispersi
        </h2>
        <span className="text-sm text-slate-400">n = {n}</span>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="bg-white/[0.06] text-xs uppercase tracking-wider text-ink-soft">
              <th scope="col" className="px-6 py-4 font-semibold">Metrik</th>
              {stats.map((s) => (
                <th key={s.key} scope="col" className="px-6 py-4 font-semibold">
                  {TABLE_HEADERS[s.key]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={row.id} className={`border-t border-white/10 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                <th scope="row" className="px-6 py-4 font-normal text-ink-soft">{row.label}</th>
                {stats.map((s) => (
                  <td
                    key={s.key}
                    className={`px-6 py-4 font-medium tabular-nums ${
                      row.id === "mean" && s.key === RESPONSE ? "text-sky" : "text-white"
                    }`}
                  >
                    {row.value(s)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
