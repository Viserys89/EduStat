import io

import pandas as pd


class CSVReadError(Exception):
    """File CSV tidak bisa dibaca sama sekali (bukan sekadar data tidak valid)."""


def read_csv_rows(content: bytes) -> tuple[list[dict], list[str]]:
    try:
        text = content.decode("utf-8-sig")  # menangani BOM dari Excel
    except UnicodeDecodeError:
        raise CSVReadError("Encoding file tidak didukung. Simpan file sebagai CSV UTF-8.")

    if not text.strip():
        raise CSVReadError("File CSV kosong.")

    # Deteksi pemisah dari baris header: koma, titik koma (Excel Indonesia), atau tab
    first_line = next(line for line in text.splitlines() if line.strip())
    delimiter = max((",", ";", "\t"), key=first_line.count)

    try:
        df = pd.read_csv(
            io.StringIO(text),
            sep=delimiter,
            dtype=str,
            keep_default_na=False,
            skipinitialspace=True,
            index_col=False,
        )
    except pd.errors.EmptyDataError:
        raise CSVReadError("File CSV kosong.")
    except ValueError:
        raise CSVReadError("Struktur CSV tidak valid: jumlah kolom pada setiap baris harus sama.")

    df.columns = [str(c).strip().lower() for c in df.columns]
    df = df.fillna("")
    return df.to_dict("records"), list(df.columns)