export const MAX_FILE_SIZE_MB = 5; // NFR-001
export const MAX_ROWS = 500;       // NFR-001

export const COLUMNS = [
  { key: "study_hours", label: "JAM BELAJAR" },
  { key: "attendance", label: "KEHADIRAN (%)" },
  { key: "exam_score", label: "NILAI UJIAN" },
];

export const COLUMN_LABELS = {
  id: "ID",
  study_hours: "Jam Belajar",
  attendance: "Kehadiran",
  exam_score: "Nilai Ujian",
};

export const CHECK_LABELS = {
  required_columns: "Kolom Wajib",
  data_types: "Tipe Data",
  missing_values: "Nilai Kosong",
  duplicate_ids: "ID Duplikat",
  value_ranges: "Rentang Nilai",
  row_count: "Jumlah Baris",
};