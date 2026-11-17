import { CircleCheck, CircleMinus, CircleX } from "lucide-react";
import { CHECK_LABELS } from "../config/constants";

const SAY_NONE = new Set(["missing_values", "duplicate_ids"]);

function info(check) {
  if (check.status === "failed")
    return { label: `${check.issue_count} masalah`, color: "text-error", Icon: CircleX };
  if (check.status === "skipped")
    return { label: "Dilewati", color: "text-slate-400", Icon: CircleMinus };
  return {
    label: SAY_NONE.has(check.key) ? "Tidak ada" : "Lulus",
    color: "text-success",
    Icon: CircleCheck,
  };
}

export default function ValidationChecklist({ checks }) {
  return (
    <ul>
      {checks.map((c) => {
        const { label, color, Icon } = info(c);
        return (
          <li key={c.key} className="flex items-center justify-between border-b border-white/10 py-3.5 last:border-0">
            <span className="text-ink-soft">{CHECK_LABELS[c.key]}</span>
            <span className={`flex items-center gap-3 text-xs font-medium ${color}`}>
              {label}
              <Icon size={18} />
            </span>
          </li>
        );
      })}
    </ul>
  );
}