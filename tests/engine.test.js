import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run, sampleAt } from '../src/engine.js';
const fixture = () =>
  JSON.parse(readFileSync(new URL('../examples/nominal.json', import.meta.url)));
test('known polyline totals 2.5 metres', () => {
  const r = run(fixture());
  assert.equal(r.observedDistanceM, 2.5);
  assert.equal(r.durationMs, 5000);
});
test('sorting timestamp disorder preserves distance and reports the repair', () => {
  const x = fixture();
  x.samples.reverse();
  const r = run(x);
  assert.equal(r.observedDistanceM, 2.5);
  assert.equal(r.findings[0].code, 'OUT_OF_ORDER');
});
test('identical duplicate timestamps collapse without division by zero', () => {
  const x = fixture();
  x.samples.push({ ...x.samples[1] });
  const r = run(x);
  assert.equal(r.records.length, 6);
  assert.equal(r.observedDistanceM, 2.5);
});
test('conflicting timestamps exclude both neighboring segments', () => {
  const x = fixture();
  x.samples.push({ ...x.samples[2], xM: 30 });
  const r = run(x);
  assert.equal(r.records[2].quality, 'invalid');
  assert.equal(r.records[2].segmentIncluded, false);
  assert.equal(r.records[3].segmentIncluded, false);
  assert.equal(r.observedDistanceM, 1.5);
});
test('long gaps never become inferred travel distance', () => {
  const x = fixture();
  x.maxGapMs = 999;
  const r = run(x);
  assert.equal(r.observedDistanceM, 0);
  assert.equal(r.records.filter((s) => s.segmentIncluded).length, 0);
});
test('a gap at the threshold is included', () => {
  const x = fixture();
  x.maxGapMs = 1000;
  assert.equal(run(x).observedDistanceM, 2.5);
});
test('invalid samples prevent adjacent interval inclusion', () => {
  const x = fixture();
  x.samples[2].quality = 'invalid';
  assert.equal(run(x).observedDistanceM, 1.5);
});
test('speed outliers are excluded from included-distance totals', () => {
  const x = fixture();
  x.speedLimitMps = 0.49;
  const r = run(x);
  assert.equal(r.observedDistanceM, 0);
  assert.equal(r.status, 'review-required');
});
test('an exact speed threshold remains included', () => {
  const x = fixture();
  x.speedLimitMps = 0.5;
  assert.equal(run(x).observedDistanceM, 2.5);
});
test('stationary valid intervals have zero speed', () => {
  const x = fixture();
  x.samples.forEach((s) => {
    s.xM = 0;
    s.yM = 0;
  });
  const r = run(x);
  assert.equal(r.records[1].speedMps, 0);
  assert.equal(r.records[1].segmentIncluded, true);
});
test('a single sample has no implied trajectory', () => {
  const x = fixture();
  x.samples = [x.samples[0]];
  const r = run(x);
  assert.equal(r.durationMs, 0);
  assert.equal(r.observedDistanceM, 0);
});
test('cursor before the first sample returns no position', () => {
  const x = fixture();
  x.samples.forEach((s) => (s.atMs += 1000));
  assert.equal(sampleAt(run(x), 999).sample, null);
});
test('cursor holds a recorded position without interpolating', () => {
  const held = sampleAt(run(fixture()), 1500);
  assert.equal(held.sample.xM, 0.5);
  assert.equal(held.ageMs, 500);
  assert.equal(held.stale, false);
});
test('cursor after the observation window becomes stale', () =>
  assert.equal(sampleAt(run(fixture()), 6501).stale, true));
test('cursor at the staleness boundary is fresh', () =>
  assert.equal(sampleAt(run(fixture()), 6500).stale, false));
test('invalid samples remain stale even at their own timestamp', () => {
  const x = fixture();
  x.samples[1].quality = 'invalid';
  assert.equal(sampleAt(run(x), 1000).stale, true);
});
test('battery increases are review notes rather than impossible-data errors', () => {
  const x = fixture();
  x.samples[1].batteryPct = 99;
  assert.ok(run(x).findings.some((f) => f.code === 'BATTERY_INCREASE'));
});
test('out-of-range battery readings are rejected', () => {
  const x = fixture();
  x.samples[0].batteryPct = 101;
  assert.throws(() => run(x), { code: 'NUMBER' });
});
