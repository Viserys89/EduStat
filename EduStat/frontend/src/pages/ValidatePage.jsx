import { Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, TriangleAlert } from "lucide-react";
import Stepper from "../components/Stepper";
import DatasetPreview from "../components/DatasetPreview";
import IssueList from "../components/IssueList";
import ValidationChecklist from "../components/ValidationChecklist";
import { useDataset } from "../context/dataset-context";

export default function ValidatePage() {
  const navigate = useNavigate();
  const { validation } = useDataset();

  // Dibuka langsung tanpa hasil validasi (mis. setelah refresh) -> kembali ke Input
  if (!validation) return <Navigate to="/input" replace />;

  const { valid, summary, checks, errors, error_count, rows } = validation;
  const quality = summary.quality == null ? "—" : `${summary.quality}%`;

  const stats = [
    { label: "Total Observasi", value: summary.n_rows },
    { label: "Total Variabel", value: summary.n_variables },
    { label: "Kualitas Data", value: quality, color: valid ? "text-success" : "text-error" },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1040px] flex-col justify-center gap-6 px-6 py-10">
      <Stepper
        current={2}
        error={!valid}
        onStepClick={(n) => n === 1 && navigate("/input")}
      />

      {/* Banner status */}
      <section
        role={valid ? "status" : "alert"}
        className={`flex items-center gap-4 rounded-[28px] border px-6 py-5 ${
          valid ? "border-success/40 bg-success/10" : "border-error/40 bg-error/10"
        }`}
      >
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            valid ? "bg-success/20 text-success" : "bg-error/20 text-error"
          }`}
        >
          {valid ? <Check size={20} /> : <TriangleAlert size={20} />}
        </span>
        <div>
          <h1 className="font-heading text-xl font-semibold text-white">
            {valid ? "Dataset Berhasil Divalidasi" : "Dataset Belum Valid"}
          </h1>
          <p className="text-sm text-ink-soft">
            {valid
              ? "Semua pemeriksaan lulus. Dataset Anda siap dianalisis."
              : `Ditemukan ${error_count} masalah. Perbaiki data di halaman Input, lalu validasi ulang.`}
          </p>
        </div>
      </section>

      {/* Statistik ringkas */}
      <section className="grid grid-cols-1 gap-4 px-2 sm:grid-cols-3 sm:gap-0">
        {stats.map((s, i) => (
          <div key={s.label} className={`sm:px-6 ${i > 0 ? "sm:border-l sm:border-white/10" : ""}`}>
            <p className="text-sm text-slate-400">{s.label}</p>
            <p className={`mt-1 font-heading text-3xl font-bold ${s.color ?? "text-white"}`}>{s.value}</p>
          </div>
        ))}
      </section>

      {/* Konten utama */}
      <section className="grid gap-6 lg:grid-cols-[1fr_392px]">
        <div className="glass-card p-6">
          <h2 className="mb-5 font-heading text-xl font-semibold text-white">
            {valid ? "Pratinjau Dataset" : "Detail Kesalahan"}
          </h2>
          {valid ? <DatasetPreview rows={rows} /> : <IssueList errors={errors} total={error_count} />}
        </div>

        <div className="glass-card p-6">
          <h2 className="mb-3 font-heading text-xl font-semibold text-white">Daftar Pemeriksaan</h2>
          <ValidationChecklist checks={checks} />
        </div>
      </section>

      {/* Aksi */}
      <div className="flex items-center justify-between">
        <button type="button" className="btn-secondary h-12 gap-2 px-5" onClick={() => navigate("/input")}>
          <ArrowLeft size={16} /> Kembali ke Input
        </button>
        <button
          type="button"
          className="btn-primary h-12 min-w-0 gap-2 px-6"
          disabled={!valid}
          title={valid ? undefined : "Perbaiki dataset terlebih dahulu"}
          onClick={() => navigate("/results")}
        >
          Mulai Analisis <ArrowRight size={16} />
        </button>
      </div>

      <p className="text-center text-xs text-slate-400">
        Dataset Anda diproses sementara dan tidak disimpan secara permanen.
      </p>
    </main>
  );
}