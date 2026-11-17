const TABS = [
  { id: "descriptive", label: "Statistik Deskriptif" },
  { id: "correlation", label: "Korelasi" },
  { id: "regression", label: "Regresi Linear" },
];

export default function Tabs({ value, onChange }) {
  const handleKey = (e, index) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const step = e.key === "ArrowRight" ? 1 : -1;
    const next = TABS[(index + step + TABS.length) % TABS.length];
    onChange(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  return (
    <div role="tablist" aria-label="Jenis analisis" className="flex flex-wrap border-b border-white/10">
      {TABS.map((t, i) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`panel-${t.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => handleKey(e, i)}
            className={`-mb-px rounded-t-lg border-b-2 px-6 py-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-sky sm:px-8 ${
              active
                ? "border-sky bg-sky/10 text-sky"
                : "border-transparent text-slate-400 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
