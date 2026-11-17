import { Plus, Trash2 } from "lucide-react";
import { COLUMNS, MAX_ROWS } from "../config/constants";
import { createRow, isInvalidCell } from "../utils/dataset";

export default function ManualTable({ rows, onChange }) {
  const update = (key, field, value) =>
    onChange(rows.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  const remove = (key) => onChange(rows.filter((r) => r.key !== key));
  const add = () => onChange([...rows, createRow()]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#1a2842] text-xs uppercase tracking-wide text-ink-soft">
            <tr className="border-b border-white/10">
              <th className="w-14 px-4 py-3 font-medium">ID</th>
              {COLUMNS.map((c) => (
                <th key={c.key} className="px-3 py-3 font-medium">{c.label}</th>
              ))}
              <th className="w-12" aria-label="Aksi" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.key} className="border-b border-white/10 last:border-0">
                <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                {COLUMNS.map((c) => (
                  <td key={c.key} className="px-2 py-1">
                    <input
                      value={row[c.key]}
                      onChange={(e) => update(row.key, c.key, e.target.value)}
                      inputMode="decimal"
                      placeholder="0"
                      aria-label={`${c.label} baris ${i + 1}`}
                      className={`table-input ${isInvalidCell(row[c.key]) ? "text-error" : "text-ink"}`}
                    />
                  </td>
                ))}
                <td className="pr-3">
                  <button
                    type="button"
                    onClick={() => remove(row.key)}
                    aria-label={`Hapus baris ${i + 1}`}
                    className="rounded-md p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-error"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={add}
        disabled={rows.length >= MAX_ROWS}
        className="flex w-full items-center justify-center gap-2 border-t border-white/10 bg-white/5 py-3 text-sm text-ink-soft transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus size={14} /> Tambah Baris
      </button>
    </div>
  );
}