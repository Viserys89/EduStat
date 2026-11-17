import { useRef, useState } from "react";
import { CloudUpload, FileText, X } from "lucide-react";
import { MAX_FILE_SIZE_MB } from "../config/constants";

export default function UploadDropzone({ file, onSelect, onClear }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".csv")) return setError("Hanya file berformat .csv yang diterima.");
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) return setError(`Ukuran file maksimal ${MAX_FILE_SIZE_MB} MB.`);
    setError("");
    onSelect(f);
  };

  return (
    <>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
        className={`flex h-60 flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center transition ${
          dragging ? "border-sky bg-sky/10" : "border-white/25 bg-white/[0.03]"
        }`}
      >
        {file ? (
          <div className="flex w-full max-w-xs items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky/15 text-sky">
              <FileText size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink">{file.name}</p>
              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              type="button"
              onClick={onClear}
              aria-label="Hapus file"
              className="rounded-md p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-error"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky/15 text-sky">
              <CloudUpload size={24} />
            </span>
            <p className="mt-5 text-ink-soft">Seret dan lepas file CSV di sini</p>
            <button type="button" className="btn-secondary mt-5" onClick={() => inputRef.current?.click()}>
              Pilih File
            </button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }}
        />
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-error">{error}</p>}
    </>
  );
}