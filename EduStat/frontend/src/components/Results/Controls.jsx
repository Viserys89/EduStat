export function SelectField({ label, value, onChange, options }) {
  return (
    <label className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-sky/60">
      <span className="text-slate-300">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent font-medium text-white outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#14213D]">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Segmented({ label, options, value, onChange }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-sky ${
              active ? "bg-sky/20 text-sky" : "text-slate-300 hover:text-white"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
