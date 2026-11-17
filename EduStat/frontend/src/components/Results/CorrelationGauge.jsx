import { fmt, pText, titleCase } from "../../utils/format";

const RADIUS = 60;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Cincin koefisien korelasi. `result` = objek pearson/spearman dari backend. */
export default function CorrelationGauge({ result, pairLabel }) {
  const available = Boolean(result?.available);
  const progress = available ? Math.min(Math.abs(result.coefficient), 1) : 0;
  const symbol = result?.method === "spearman" ? "ρ" : "r";

  let title = "Tidak dapat dihitung";
  let tone = "text-slate-400";
  if (available) {
    title = result.direction
      ? `Korelasi ${titleCase(result.direction)} ${titleCase(result.strength)}`
      : `Korelasi ${titleCase(result.strength)}`;
    tone = result.significant ? "text-success" : "text-warning";
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="relative h-40 w-40"
        role="img"
        aria-label={available ? `Koefisien korelasi ${symbol} sebesar ${fmt(result.coefficient)}` : "Koefisien korelasi tidak tersedia"}
      >
        <svg viewBox="0 0 150 150" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="75" cy="75" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle
            cx="75" cy="75" r={RADIUS} fill="none" stroke="#38BDF8" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${progress * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            style={{ transition: "stroke-dasharray 0.4s ease" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-heading text-4xl font-bold text-white">
          {available ? fmt(result.coefficient) : "—"}
        </span>
      </div>

      <p className={`mt-5 font-semibold ${tone}`}>{title}</p>
      <p className="mt-1 text-sm text-ink-soft">{pairLabel}</p>
      {available && (
        <p className="mt-2 text-xs text-slate-400">
          {pText(result.p_value)} · n = {result.n}
          {!result.significant && " · tidak signifikan"}
        </p>
      )}
      {!available && result?.reason && <p className="mt-2 max-w-xs text-xs text-slate-400">{result.reason}</p>}
    </div>
  );
}
