import assert from 'node:assert/strict';
import test from 'node:test';
import { getPerformanceMotion, PERFORMANCE_DURATION } from '../components/performance-demo.ts';

test('markers finish before the result curve begins', () => {
  assert.equal(getPerformanceMotion(0).marker, 0);
  assert.equal(getPerformanceMotion(750).marker, 1);
  assert.equal(getPerformanceMotion(750).resultMarker, 1);
  assert.equal(getPerformanceMotion(1100).progress, 0);
  assert.ok(getPerformanceMotion(1800).progress > 0);
});

test('curve and metrics complete within three seconds and stay bounded', () => {
  let previous = 0;
  for (let elapsed = -100; elapsed <= PERFORMANCE_DURATION + 500; elapsed += 10) {
    const frame = getPerformanceMotion(elapsed);
    for (const key of ['progress', 'growth', 'marker', 'resultMarker']) {
      assert.ok(frame[key] >= 0 && frame[key] <= 1);
    }
    assert.ok(frame.progress >= previous);
    previous = frame.progress;
    assert.ok(frame.image >= 0 && frame.image <= 2);
  }
  assert.equal(PERFORMANCE_DURATION, 3000);
  assert.equal(getPerformanceMotion(PERFORMANCE_DURATION).progress, 1);
  assert.equal(getPerformanceMotion(PERFORMANCE_DURATION).growth, 1);
});

test('restarting restores the first asset, marker and baseline metrics', () => {
  const first = getPerformanceMotion(0);
  assert.deepEqual(first, { time: 0, progress: 0, growth: 0, marker: 0, resultMarker: 0, image: 0 });
  assert.equal(getPerformanceMotion(650).image, 1);
  assert.equal(getPerformanceMotion(1300).image, 2);
});
