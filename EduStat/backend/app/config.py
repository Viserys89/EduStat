MAX_FILE_SIZE_MB = 5                      # NFR-001
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
MAX_ROWS = 500                            # NFR-001
MIN_ROWS = 3                              # usulan: syarat minimum agar korelasi/regresi terdefinisi
MAX_ERRORS = 100                          # batas jumlah error yang dikirim ke frontend

REQUIRED_COLUMNS = ["id", "study_hours", "attendance", "exam_score"]

# kolom numerik -> (batas bawah, batas atas); None = tanpa batas (FR-006)
NUMERIC_RULES = {
    "study_hours": (0, None),
    "attendance": (0, 100),
    "exam_score": (0, 100),
}