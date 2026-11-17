export const VARIABLES = ["study_hours", "attendance", "exam_score"];
export const PREDICTORS = ["study_hours", "attendance"];
export const RESPONSE = "exam_score";

export const VAR_LABELS = {
  study_hours: "Jam Belajar",
  attendance: "Kehadiran",
  exam_score: "Nilai Ujian",
};

// Judul kolom pada tabel statistik deskriptif
export const TABLE_HEADERS = {
  study_hours: "Jam Belajar",
  attendance: "Kehadiran (%)",
  exam_score: "Nilai Ujian",
};

export const PREDICTOR_OPTIONS = PREDICTORS.map((k) => ({ value: k, label: VAR_LABELS[k] }));

export const ALPHA = 0.05;
