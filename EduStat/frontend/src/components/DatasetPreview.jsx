import { COLUMN_LABELS } from "../config/constants";

const PREVIEW_LIMIT = 10;

export default function DatasetPreview({ rows }) {
  const shown = rows.slice(0, PREVIEW_LIMIT);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-ink-soft">
            <tr className="border-b border-white/10">
              {["id", "study_hours", "attendance", "exam_score"].map((k) => (
                <th key={k} className="px-4 py-3 font-medium">{COLUMN_LABELS[k]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id} className="border-b border-white/10 last:border-0">
                <td className="px-4 py-3.5">{r.id}</td>
                <td className="px-4 py-3.5">{r.study_hours}</td>
                <td className="px-4 py-3.5">{r.attendance}%</td>
                <td className="px-4 py-3.5">{r.exam_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-slate-400">
        Menampilkan {shown.length} dari {rows.length} observasi
      </p>
    </>
  );
}