from app.services.validation import validate_rows


def row(i, hours, attendance, score):
    return {"id": i, "study_hours": hours, "attendance": attendance, "exam_score": score}


def test_valid_dataset():
    r = validate_rows([row(1, 12, 95, 88), row(2, "8", "80%", 72), row(3, "7,5", 90, "65")])
    assert r.valid and r.error_count == 0
    assert r.rows[1].attendance == 80 and r.rows[2].study_hours == 7.5


def test_non_numeric():
    r = validate_rows([row(1, 12, 95, 88), row(2, 8, 80, 72), row(3, 15, 90, "ABC")])
    assert not r.valid
    assert (r.errors[0].row, r.errors[0].column) == (3, "exam_score")


def test_missing_and_out_of_range():
    r = validate_rows([row(1, -1, 95, 88), row(2, 8, None, 72), row(3, 15, 90, 101)])
    assert {(e.row, e.column) for e in r.errors} == {
        (1, "study_hours"), (2, "attendance"), (3, "exam_score"),
    }


def test_duplicate_id():
    r = validate_rows([row(1, 1, 90, 80), row(1, 2, 90, 81), row(3, 3, 90, 82)])
    assert [(e.row, e.column) for e in r.errors] == [(2, "id")]


def test_nan_is_rejected():
    r = validate_rows([row(1, "nan", 90, 80), row(2, 2, 90, 81), row(3, 3, 90, 82)])
    assert not r.valid


def test_row_limits():
    assert not validate_rows([row(1, 1, 90, 80)]).valid
    assert not validate_rows([row(i, 1, 90, 80) for i in range(501)]).valid

def test_checks_and_quality():
    r = validate_rows([row(1, 12, 95, 88), row(2, 8, 80, "ABC"), row(3, 15, 90, 85)])
    status = {c.key: c.status for c in r.checks}
    assert status["data_types"] == "failed" and status["missing_values"] == "passed"
    assert r.summary.quality == 66.7 and r.summary.n_variables == 4
    assert r.errors[0].row_id == "2"


def test_too_few_rows_skips_checks():
    r = validate_rows([row(1, 1, 90, 80)])
    status = {c.key: c.status for c in r.checks}
    assert status["row_count"] == "failed" and status["data_types"] == "skipped"
    assert r.summary.quality is None