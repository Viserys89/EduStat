// Format angka bergaya Indonesia (koma desimal), konsisten dengan teks dari backend.
const cache = new Map();
function formatter(min, max) {
  const key = `${min}-${max}`;
  if (!cache.has(key)) {
    cache.set(key, new Intl.NumberFormat("id-ID", { minimumFractionDigits: min, maximumFractionDigits: max }));
  }
  return cache.get(key);
}

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

export function fmt(value, digits = 2) {
  if (!isNum(value)) return "—";
  const v = Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value; // hindari "-0,00"
  return formatter(digits, digits).format(v);
}

// Untuk label sumbu grafik: tanpa desimal berlebih
export const fmtAuto = (value) => (isNum(value) ? formatter(0, 2).format(value) : "—");

export const fmtP = (p) => (!isNum(p) ? "—" : p < 0.0001 ? "< 0,0001" : fmt(p, 4));

// "p < 0,0001" atau "p = 0,0312"
export const pText = (p) => (!isNum(p) ? "p tidak tersedia" : p < 0.0001 ? "p < 0,0001" : `p = ${fmt(p, 4)}`);

export function fmtDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(d);
}

export const titleCase = (s) => s.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
