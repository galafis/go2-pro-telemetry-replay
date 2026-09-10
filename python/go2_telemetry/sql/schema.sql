-- Raw measurements and canonical analysis are separate / Medições e análise separadas.
CREATE TABLE IF NOT EXISTS runs (
    scenario_id TEXT PRIMARY KEY,
    source TEXT NOT NULL CHECK(source IN ('synthetic', 'manual')),
    input_sha256 TEXT NOT NULL CHECK(length(input_sha256) = 64),
    input_json TEXT NOT NULL,
    max_gap_ms INTEGER NOT NULL CHECK(max_gap_ms BETWEEN 1 AND 60000),
    observed_distance_m REAL NOT NULL CHECK(observed_distance_m >= 0)
);
CREATE TABLE IF NOT EXISTS samples (
    scenario_id TEXT NOT NULL REFERENCES runs(scenario_id),
    sequence INTEGER NOT NULL CHECK(sequence >= 0),
    at_ms INTEGER NOT NULL CHECK(at_ms BETWEEN 0 AND 86400000),
    x_m REAL NOT NULL,
    y_m REAL NOT NULL,
    battery_pct REAL NOT NULL CHECK(battery_pct BETWEEN 0 AND 100),
    quality TEXT NOT NULL CHECK(quality IN ('valid', 'invalid')),
    gap_ms INTEGER NOT NULL CHECK(gap_ms >= 0),
    distance_m REAL NOT NULL CHECK(distance_m >= 0),
    speed_mps REAL,
    segment_included INTEGER NOT NULL CHECK(segment_included IN (0, 1)),
    PRIMARY KEY(scenario_id, sequence),
    UNIQUE(scenario_id, at_ms),
    CHECK((segment_included = 0 AND speed_mps IS NULL AND distance_m = 0)
       OR (segment_included = 1 AND speed_mps >= 0 AND gap_ms > 0))
);
CREATE VIEW IF NOT EXISTS run_summary AS
SELECT r.scenario_id, r.source, COUNT(s.sequence) AS canonical_samples,
       SUM(CASE WHEN s.sequence > 0 AND s.segment_included = 0 THEN 1 ELSE 0 END) AS excluded_intervals,
       SUM(s.segment_included) AS included_intervals,
       MAX(s.at_ms) - MIN(s.at_ms) AS duration_ms,
       r.observed_distance_m,
       SUM(s.distance_m) AS sum_rounded_segment_m
FROM runs AS r JOIN samples AS s ON r.scenario_id = s.scenario_id
GROUP BY r.scenario_id;
