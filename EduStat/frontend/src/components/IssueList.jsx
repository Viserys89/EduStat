import { COLUMN_LABELS } from "../config/constants";

export default function IssueList({ errors, total }) {
  return (
    <>
      <div className="max-h-80 overflow-auto rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-[#1a2842] text-xs text-ink-soft">
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 font-medium">Baris</th>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Kolom</th>
              <th className="px-4 py-3 font-medium">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((e, i) => (
              <tr key={i} className="border-b border-white/10 align-top last:border-0">
                <td className="px-4 py-3 text-slate-300">{e.row ?? "—"}</td>
                <td className="px-4 py-3 text-slate-300">{e.row_id ?? "—"}</td>
                <td className="px-4 py-3 text-slate-300">{COLUMN_LABELS[e.column] ?? "—"}</td>
                <td className="px-4 py-3 text-red-300">{e.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-slate-400">
        Menampilkan {errors.length} dari {total} kesalahan
      </p>
    </>
  );
}