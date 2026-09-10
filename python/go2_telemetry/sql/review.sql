-- Included distance does not reconstruct unobserved motion.
-- A distância incluída não reconstrói movimento sem observação.
SELECT scenario_id, source, canonical_samples, included_intervals, excluded_intervals,
       duration_ms, observed_distance_m,
       ROUND(100.0 * included_intervals / NULLIF(canonical_samples - 1, 0), 2) AS included_interval_pct
FROM run_summary
ORDER BY scenario_id;
