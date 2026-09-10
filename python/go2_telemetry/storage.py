"""Transactional SQLite analysis archive / Arquivo SQLite transacional."""

import hashlib
import json
import sqlite3
from importlib.resources import files

from .core import analyze


def connect(path):
    connection = sqlite3.connect(path)
    connection.execute("PRAGMA foreign_keys = ON")
    connection.executescript(
        files(__package__).joinpath("sql/schema.sql").read_text(encoding="utf-8")
    )
    return connection


def store_analysis(connection, scenario):
    result = analyze(scenario)
    canonical = json.dumps(scenario, sort_keys=True, separators=(",", ":"), allow_nan=False)
    fingerprint = hashlib.sha256(canonical.encode()).hexdigest()
    # A duplicate scenario identifier is rejected, never silently overwritten.
    with connection:
        connection.execute(
            "INSERT INTO runs VALUES (?, ?, ?, ?, ?, ?)",
            (
                scenario["scenarioId"],
                scenario["source"],
                fingerprint,
                canonical,
                scenario["maxGapMs"],
                result["observedDistanceM"],
            ),
        )
        connection.executemany(
            "INSERT INTO samples VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                (
                    scenario["scenarioId"],
                    i,
                    row["atMs"],
                    row["xM"],
                    row["yM"],
                    row["batteryPct"],
                    row["quality"],
                    row["gapMs"],
                    row["distanceM"],
                    row["speedMps"],
                    int(row["segmentIncluded"]),
                )
                for i, row in enumerate(result["records"])
            ],
        )
    return result


def review(connection):
    cursor = connection.execute(
        files(__package__).joinpath("sql/review.sql").read_text(encoding="utf-8")
    )
    columns = [column[0] for column in cursor.description]
    return [dict(zip(columns, row)) for row in cursor]
