import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import Stepper from "../components/Stepper";
import UploadDropzone from "../components/UploadDropzone";
import ManualTable from "../components/ManualTable";
import { useDataset } from "../context/dataset-context";
import { getErrorMessage, validateDataset } from "../services/datasetService";
import { isBlankRow, toPayloadRows } from "../utils/dataset";

export default function InputPage() {
  const navigate = useNavigate();
  const { file, setFile, manualRows, setManualRows, setValidation } = useDataset();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasManualData = manualRows.some((r) => !isBlankRow(r));
  const canSubmit = !loading && (Boolean(file) || hasManualData);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await validateDataset({ file, rows: toPayloadRows(manualRows) });
      setValidation(result);
      navigate("/validate");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-10">
      <Stepper current={1} />

      <section className="glass-card w-full max-w-[1040px] p-8 md:p-10">
        <div className="grid gap-8 md:grid-cols-[1fr_auto_1fr]">
          {/* Kiri: upload CSV */}
          <div>
            <h2 className="font-heading text-2xl font-semibold text-white">Unggah Dataset</h2>
            <p className="mb-5 mt-2 text-sm text-slate-400">
              Kolom wajib: <code className="text-ink-soft">id, study_hours, attendance, exam_score</code>.
              Maks. 5 MB / 500 baris.
            </p>
            <UploadDropzone file={file} onSelect={setFile} onClear={() => setFile(null)} />
          </div>

          {/* Pemisah */}
          <div className="flex items-center gap-4 md:flex-col">
            <span className="h-px flex-1 bg-white/15 md:h-auto md:w-px" />
            <span className="text-xs text-slate-400">ATAU</span>
            <span className="h-px flex-1 bg-white/15 md:h-auto md:w-px" />
          </div>

          {/* Kanan: input manual (nonaktif jika file dipilih) */}
          <div className={file ? "opacity-40 transition" : "transition"} inert={file ? true : undefined}>
            <h2 className="font-heading text-2xl font-semibold text-white">Input Data Manual</h2>
            <p className="mb-5 mt-2 text-sm text-slate-400">
              {file
                ? "File CSV sedang dipakai. Hapus file untuk input manual."
                : "Tambahkan data pengamatan langsung ke aplikasi."}
            </p>
            <ManualTable rows={manualRows} onChange={setManualRows} />
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-6 rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="mt-8 flex justify-end">
          <button type="button" className="btn-primary gap-2" onClick={handleSubmit} disabled={!canSubmit}>
            {loading && <LoaderCircle size={18} className="animate-spin" />}
            {loading ? "Memvalidasi..." : "Validasi & Lanjutkan"}
          </button>
        </div>
      </section>

      <p className="flex items-center gap-2 text-sm text-slate-400">
        <ShieldCheck size={16} />
        Dataset Anda diproses sementara dan tidak disimpan secara permanen.
      </p>
    </main>
  );
}