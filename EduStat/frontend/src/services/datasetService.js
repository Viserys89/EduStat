import api from "./api";

/**
 * POST /api/dataset/validate      body JSON { rows: [...] }
 * POST /api/dataset/validate-csv  multipart, field "file"
 * Respons: { valid, errors, error_count, checks, summary, rows }
 */
export async function validateDataset({ file, rows }) {
  if (file) {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post("/api/dataset/validate-csv", form);
    return data;
  }
  const { data } = await api.post("/api/dataset/validate", { rows });
  return data;
}

export function getErrorMessage(err) {
  if (err.response) {
    const detail = err.response.data?.detail;
    return typeof detail === "string"
      ? detail
      : "Server menolak permintaan. Periksa kembali data Anda.";
  }
  return "Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.";
}