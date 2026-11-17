import { Check, X } from "lucide-react";

const STEPS = ["Input", "Validasi", "Hasil"];

function tone({ done, active, failed }) {
  if (failed) return { circle: "border-error/60 bg-error/15 text-error", label: "text-error" };
  if (done) return { circle: "border-success/50 bg-success/15 text-success", label: "text-success" };
  if (active) return { circle: "border-sky/60 bg-sky/15 text-sky", label: "text-sky" };
  return { circle: "border-white/10 bg-white/5 text-slate-400", label: "text-slate-400" };
}

export default function Stepper({ current = 1, error = false, onStepClick }) {
  return (
    <ol className="flex items-center justify-center" aria-label="Tahapan analisis">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        const failed = active && error;
        const t = tone({ done, active, failed });
        const clickable = done && Boolean(onStepClick);
        const Tag = clickable ? "button" : "div";

        return (
          <li key={label} className="flex items-center" aria-current={active ? "step" : undefined}>
            <Tag
              {...(clickable
                ? { type: "button", onClick: () => onStepClick(n), title: `Kembali ke ${label}` }
                : {})}
              className={`flex items-center ${clickable ? "cursor-pointer rounded-full transition hover:opacity-80" : ""}`}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm ${t.circle}`}>
                {failed ? <X size={14} /> : done ? <Check size={14} /> : n}
              </span>
              <span className={`ml-3 text-sm ${t.label}`}>{label}</span>
            </Tag>
            {n < STEPS.length && (
              <span className={`mx-4 h-px w-8 sm:w-12 ${done ? "bg-success/40" : "bg-white/15"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}