"""Canonical samples and observed intervals / Amostras e intervalos observados."""

import math
from bisect import bisect_right
from itertools import groupby

from .contract import validate


def analyze(scenario):
    s = validate(scenario)
    findings, canonical, records = [], [], []
    if any(a["atMs"] > b["atMs"] for a, b in zip(s["samples"], s["samples"][1:])):
        findings.append({"code": "OUT_OF_ORDER"})
    for timestamp, iterator in groupby(
        sorted(s["samples"], key=lambda row: row["atMs"]), key=lambda row: row["atMs"]
    ):
        group = list(iterator)
        sample = dict(group[0])
        identical = all(row == group[0] for row in group)
        if len(group) > 1:
            findings.append(
                {
                    "code": "DUPLICATE_REMOVED" if identical else "TIMESTAMP_CONFLICT",
                    "atMs": timestamp,
                    "count": len(group),
                }
            )
        if not identical:
            sample["quality"] = "invalid"
        canonical.append(sample)
    total, peak, excluded = 0.0, 0.0, 0
    for i, sample in enumerate(canonical):
        previous = canonical[i - 1] if i else None
        gap = sample["atMs"] - previous["atMs"] if previous else 0
        record = {
            **sample,
            "gapMs": gap,
            "distanceM": 0,
            "speedMps": None,
            "segmentIncluded": False,
        }
        if sample["quality"] == "invalid":
            findings.append({"code": "INVALID_SAMPLE", "atMs": sample["atMs"]})
        if previous:
            valid = previous["quality"] == sample["quality"] == "valid"
            if gap > s["maxGapMs"]:
                findings.append({"code": "SAMPLE_GAP", "atMs": sample["atMs"]})
            elif valid:
                distance = math.hypot(sample["xM"] - previous["xM"], sample["yM"] - previous["yM"])
                speed = distance / (gap / 1000)
                if speed > s["speedLimitMps"]:
                    findings.append({"code": "SPEED_OUTLIER", "atMs": sample["atMs"]})
                else:
                    record.update(
                        distanceM=round(distance, 6), speedMps=round(speed, 6), segmentIncluded=True
                    )
                    total += distance
                    peak = max(peak, speed)
            if not record["segmentIncluded"]:
                excluded += 1
            if valid and sample["batteryPct"] > previous["batteryPct"]:
                findings.append({"code": "BATTERY_INCREASE", "atMs": sample["atMs"]})
        records.append(record)
    return {
        "scenarioId": s["scenarioId"],
        "source": s["source"],
        "records": records,
        "findings": findings,
        "observedDistanceM": round(total, 6),
        "peakIncludedSpeedMps": round(peak, 6),
        "excludedIntervals": excluded,
        "durationMs": canonical[-1]["atMs"] - canonical[0]["atMs"],
        "maxGapMs": s["maxGapMs"],
    }


def sample_at(report, at_ms):
    if isinstance(at_ms, bool) or not isinstance(at_ms, int) or not 0 <= at_ms <= 86400000:
        raise ValueError("Invalid review time / Instante de revisão inválido")
    index = bisect_right([row["atMs"] for row in report["records"]], at_ms) - 1
    if index < 0:
        return {"sample": None, "stale": True, "ageMs": None}
    sample = report["records"][index]
    age = at_ms - sample["atMs"]
    return {
        "sample": dict(sample),
        "ageMs": age,
        "stale": sample["quality"] != "valid" or age > report["maxGapMs"],
    }
