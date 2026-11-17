import { VARIABLES, VAR_LABELS } from "../../config/analysis";
import { fmt } from "../../utils/format";

const indexOfPair = (correlation, a, b) =>
  correlation.findIndex((p) => (p.x === a && p.y === b) || (p.x === b && p.y === a));

export default function CorrelationMatrix({ correlation, method, selectedIndex, onSelect }) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-separate border-spacing-1.5 text-sm">
          <thead>
            <tr>
              <td />
              {VARIABLES.map((k) => (
                <th key={k} scope="col" className="px-2 py-1 text-xs font-medium text-ink-soft">{VAR_LABELS[k]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {VARIABLES.map((row) => (
              <tr key={row}>
                <th scope="row" className="pr-2 text-left text-xs font-medium text-ink-soft">{VAR_LABELS[row]}</th>
                {VARIABLES.map((col) => {
                  if (row === col) {
                    return <td key={col} className="rounded-lg bg-white/5 py-3 text-center text-slate-500">1,00</td>;
                  }
                  const idx = indexOfPair(correlation, row, col);
                  const res = correlation[idx][method];
                  const selected = idx === selectedIndex;
                  const alpha = res.available ? Math.min(Math.abs(res.coefficient), 1) * 0.45 : 0;
                  return (
                    <td key={col}>
                      <button
                        type="button"
                        onClick={() => onSelect(idx)}
                        aria-pressed={selected}
                        aria-label={`${VAR_LABELS[row]} dan ${VAR_LABELS[col]}: ${fmt(res.coefficient)}`}
                        style={{ backgroundColor: `rgba(56,189,248,${alpha})` }}
                        className={`w-full rounded-lg py-3 text-center font-medium tabular-nums text-white transition focus-visible:outline-2 focus-visible:outline-sky ${
                          selected ? "ring-2 ring-sky" : "ring-1 ring-white/10 hover:ring-white/30"
                        }`}
                      >
                        {res.available ? fmt(res.coefficient) : "—"}
                        {res.significant && <span className="ml-0.5 text-sky">*</span>}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        * signifikan pada α = 0,05. Warna lebih pekat berarti hubungan lebih kuat. Klik sel untuk menampilkan pasangan variabelnya.
      </p>
    </>
  );
}
