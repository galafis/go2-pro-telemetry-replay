import copy
import sqlite3
import unittest

from go2_telemetry.core import analyze, sample_at
from go2_telemetry.storage import connect, review, store_analysis
from test_contract import nominal


class TelemetryTests(unittest.TestCase):
    def test_large_gap_is_not_travel(self):
        s = nominal()
        s["samples"] = [
            {"atMs": 0, "xM": 0, "yM": 0, "batteryPct": 100, "quality": "valid"},
            {"atMs": 60001, "xM": 10, "yM": 0, "batteryPct": 90, "quality": "valid"},
        ]
        result = analyze(s)
        self.assertEqual((result["observedDistanceM"], result["excludedIntervals"]), (0, 1))

    def test_duplicate_conflict_invalidates_adjacent_segments(self):
        s = nominal()
        s["samples"] = [
            dict(atMs=i * 1000, xM=i, yM=0, batteryPct=100, quality="valid") for i in range(3)
        ]
        s["speedLimitMps"] = 2
        s["samples"].append({**s["samples"][1], "xM": 5})
        result = analyze(s)
        self.assertEqual(result["observedDistanceM"], 0)
        self.assertEqual(result["excludedIntervals"], 2)

    def test_identical_duplicate_collapsed(self):
        s = nominal()
        before = analyze(s)
        s["samples"].append(copy.deepcopy(s["samples"][0]))
        self.assertEqual(analyze(s)["records"], before["records"])

    def test_cursor_holds_instead_of_interpolating(self):
        s = nominal()
        s["samples"] = [dict(atMs=1000, xM=0, yM=0, batteryPct=100, quality="valid")]
        s["maxGapMs"] = 1000
        report = analyze(s)
        self.assertIsNone(sample_at(report, 999)["sample"])
        self.assertFalse(sample_at(report, 2000)["stale"])
        self.assertTrue(sample_at(report, 2001)["stale"])

    def test_sql_summary_and_raw_provenance(self):
        connection = connect(":memory:")
        result = store_analysis(connection, nominal())
        row = review(connection)[0]
        self.assertEqual(row["observed_distance_m"], result["observedDistanceM"])
        self.assertEqual(row["canonical_samples"], len(result["records"]))
        self.assertEqual(
            connection.execute("SELECT length(input_sha256) FROM runs").fetchone()[0], 64
        )
        connection.close()

    def test_duplicate_archive_does_not_replace_previous_analysis(self):
        connection = connect(":memory:")
        store_analysis(connection, nominal())
        before = review(connection)
        with self.assertRaises(sqlite3.IntegrityError):
            store_analysis(connection, nominal())
        self.assertEqual(review(connection), before)
        connection.close()

    def test_mid_import_sql_failure_rolls_back_whole_run(self):
        connection = connect(":memory:")
        connection.execute(
            "CREATE TRIGGER reject_sample BEFORE INSERT ON samples WHEN NEW.sequence = 1 BEGIN SELECT RAISE(ABORT, 'test'); END"
        )
        with self.assertRaises(sqlite3.IntegrityError):
            store_analysis(connection, nominal())
        self.assertEqual(connection.execute("SELECT COUNT(*) FROM runs").fetchone()[0], 0)
        self.assertEqual(connection.execute("SELECT COUNT(*) FROM samples").fetchone()[0], 0)
        connection.close()

    def test_single_sample_sql_interval_percentage_is_null(self):
        s = nominal()
        s["samples"] = s["samples"][:1]
        connection = connect(":memory:")
        store_analysis(connection, s)
        self.assertIsNone(review(connection)[0]["included_interval_pct"])
        connection.close()
