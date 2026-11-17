import { COLUMNS } from "../config/constants";

export const createRow = () => ({
  key: crypto.randomUUID(),
  study_hours: "",
  attendance: "",
  exam_score: "",
});

// Mendukung koma desimal (12,5) dan simbol % pada kehadiran
const normalize = (v) => String(v).trim().replace(/%$/, "").replace(",", ".");

export const isBlankRow = (row) => COLUMNS.every((c) => String(row[c.key]).trim() === "");

export const isInvalidCell = (v) => {
  const s = normalize(v);
  return s !== "" && Number.isNaN(Number(s));
};

// Ubah baris input manual menjadi payload untuk backend.
// Sel kosong -> null, sel non-angka dikirim apa adanya agar backend yang melaporkan errornya.
export const toPayloadRows = (rows) =>
  rows
    .map((r, i) => ({ r, id: i + 1 }))
    .filter(({ r }) => !isBlankRow(r))
    .map(({ r, id }) => {
      const out = { id };
      COLUMNS.forEach(({ key }) => {
        const s = normalize(r[key]);
        out[key] = s === "" ? null : Number.isNaN(Number(s)) ? String(r[key]).trim() : Number(s);
      });
      return out;
    });