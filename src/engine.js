import {
  base,
  integer,
  number,
  list,
  object,
  choice,
  requireThat,
  metric,
  finding,
  round,
  report,
} from './validation.js';

export function validate(input) {
  base(input, ['maxGapMs', 'speedLimitMps', 'samples']);
  integer(input.maxGapMs, 'maxGapMs', 1, 60000);
  number(input.speedLimitMps, 'speedLimitMps', 0.01, 20);
  list(input.samples, 'samples', 1, 20000);
  input.samples.forEach((sample, index) => {
    object(sample, `samples[${index}]`, ['atMs', 'xM', 'yM', 'batteryPct', 'quality']);
    integer(sample.atMs, 'atMs', 0, 86400000);
    number(sample.xM, 'xM', -1000000, 1000000);
    number(sample.yM, 'yM', -1000000, 1000000);
    number(sample.batteryPct, 'batteryPct', 0, 100);
    choice(sample.quality, 'quality', ['valid', 'invalid']);
  });
  return input;
}

export function run(input) {
  validate(input);
  const findings = [],
    records = [],
    canonical = [];
  const sorted = input.samples
    .map((sample, inputIndex) => ({ ...sample, inputIndex }))
    .sort((a, b) => a.atMs - b.atMs || a.inputIndex - b.inputIndex);
  if (input.samples.some((s, i, a) => i > 0 && s.atMs < a[i - 1].atMs))
    findings.push(
      finding(
        'warning',
        'OUT_OF_ORDER',
        'Input samples were reordered by timestamp.',
        'As amostras foram reordenadas por instante de registro.',
      ),
    );
  for (let i = 0; i < sorted.length; ) {
    const group = [sorted[i++]];
    while (i < sorted.length && sorted[i].atMs === group[0].atMs) group.push(sorted[i++]);
    const sample = group[0];
    const identical = group.every(
      (s) =>
        s.xM === sample.xM &&
        s.yM === sample.yM &&
        s.batteryPct === sample.batteryPct &&
        s.quality === sample.quality,
    );
    if (group.length > 1)
      findings.push(
        finding(
          identical ? 'info' : 'error',
          identical ? 'DUPLICATE_REMOVED' : 'TIMESTAMP_CONFLICT',
          identical
            ? 'Identical repeated samples were collapsed.'
            : 'Conflicting samples at one timestamp were marked invalid.',
          identical
            ? 'Amostras repetidas idênticas foram consolidadas.'
            : 'Amostras conflitantes no mesmo instante foram marcadas como inválidas.',
          { atMs: sample.atMs, count: group.length },
        ),
      );
    canonical.push({
      atMs: sample.atMs,
      xM: sample.xM,
      yM: sample.yM,
      batteryPct: sample.batteryPct,
      quality: identical ? sample.quality : 'invalid',
    });
  }
  let observedDistanceM = 0,
    excludedIntervals = 0,
    peakObservedSpeedMps = 0;
  for (let i = 0; i < canonical.length; i++) {
    const current = canonical[i],
      previous = canonical[i - 1];
    const record = {
      ...current,
      gapMs: previous ? current.atMs - previous.atMs : 0,
      distanceM: 0,
      speedMps: null,
      segmentIncluded: false,
    };
    if (current.quality === 'invalid')
      findings.push(
        finding(
          'warning',
          'INVALID_SAMPLE',
          'An invalid sample cannot anchor an observed segment.',
          'Uma amostra inválida não pode definir um segmento observado.',
          { atMs: current.atMs },
        ),
      );
    if (previous) {
      if (record.gapMs > input.maxGapMs)
        findings.push(
          finding(
            'warning',
            'SAMPLE_GAP',
            `A ${record.gapMs} ms gap is excluded from distance totals.`,
            `Um intervalo de ${record.gapMs} ms foi excluído dos totais de distância.`,
            { atMs: current.atMs },
          ),
        );
      if (
        record.gapMs <= input.maxGapMs &&
        previous.quality === 'valid' &&
        current.quality === 'valid'
      ) {
        const distance = Math.hypot(current.xM - previous.xM, current.yM - previous.yM);
        const speed = distance / (record.gapMs / 1000);
        if (speed > input.speedLimitMps) {
          findings.push(
            finding(
              'error',
              'SPEED_OUTLIER',
              'A segment exceeds the analysis speed limit and is excluded.',
              'Um segmento ultrapassa o limite de velocidade da análise e foi excluído.',
              { atMs: current.atMs, speedMps: round(speed) },
            ),
          );
        } else {
          record.distanceM = round(distance);
          record.speedMps = round(speed);
          record.segmentIncluded = true;
          observedDistanceM += distance;
          peakObservedSpeedMps = Math.max(peakObservedSpeedMps, speed);
        }
      }
      if (!record.segmentIncluded) excludedIntervals++;
      if (
        previous.quality === 'valid' &&
        current.quality === 'valid' &&
        current.batteryPct > previous.batteryPct
      )
        findings.push(
          finding(
            'info',
            'BATTERY_INCREASE',
            'Battery percentage increased; review charging or measurement context.',
            'A porcentagem da bateria aumentou; revise o contexto de carga ou medição.',
            { atMs: current.atMs },
          ),
        );
    }
    records.push(record);
  }
  const durationMs = canonical.at(-1).atMs - canonical[0].atMs;
  return report(
    input,
    'go2-pro-telemetry-replay',
    [
      metric('samples', 'Unique timestamps', 'Instantes únicos', records.length),
      metric(
        'distanceM',
        'Included distance',
        'Distância incluída',
        round(observedDistanceM, 3),
        'm',
      ),
      metric('excludedIntervals', 'Excluded intervals', 'Intervalos excluídos', excludedIntervals),
      metric(
        'peakSpeedMps',
        'Peak included speed',
        'Maior velocidade incluída',
        round(peakObservedSpeedMps, 3),
        'm/s',
      ),
    ],
    findings,
    records,
    { durationMs, observedDistanceM: round(observedDistanceM), maxGapMs: input.maxGapMs },
  );
}

/** Zero-order hold only: never interpolate a position across missing data. */
export function sampleAt(reportValue, atMs) {
  integer(atMs, 'atMs', 0, 86400000);
  const rows = reportValue.records;
  let low = 0,
    high = rows.length - 1,
    found = -1;
  while (low <= high) {
    const middle = (low + high) >> 1;
    if (rows[middle].atMs <= atMs) {
      found = middle;
      low = middle + 1;
    } else high = middle - 1;
  }
  if (found < 0) return { sample: null, stale: true, ageMs: null };
  const sample = rows[found],
    ageMs = atMs - sample.atMs;
  return {
    sample: { ...sample },
    ageMs,
    stale: sample.quality !== 'valid' || ageMs > reportValue.maxGapMs,
  };
}
