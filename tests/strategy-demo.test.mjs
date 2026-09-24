import assert from 'node:assert/strict';
import test from 'node:test';
import { createStrategySample, INITIAL_STRATEGY_SAMPLE, interpolateStrategySample } from '../components/strategy-demo-data.ts';

function seededRandom(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function validate(sample) {
  assert.equal(sample.shares.reduce((sum, share) => sum + share, 0), 100);
  assert.ok(sample.shares.every((share) => share >= 10 && share <= 50));
  assert.ok(sample.contentDone >= 0 && sample.contentDone <= sample.contentTotal);
  assert.equal(sample.scores.length, 4);
  for (const score of sample.scores) {
    assert.ok(score.market >= 0 && score.market <= 100);
    assert.ok(score.brand >= score.market && score.brand <= 100);
  }
  assert.ok(sample.affinity >= 0 && sample.affinity <= 100);
  assert.ok(Object.values(sample).filter((value) => typeof value === 'number').every(Number.isInteger));
}

test('random demo values remain valid and change across refreshes', () => {
  const random = seededRandom(42);
  const values = new Set();
  for (let index = 0; index < 200; index++) {
    const sample = createStrategySample(random);
    validate(sample);
    values.add(JSON.stringify(sample));
  }
  assert.equal(values.size, 200);
});

test('animated values keep totals and progress consistent at every frame', () => {
  const random = seededRandom(7);
  let from = INITIAL_STRATEGY_SAMPLE;
  for (let index = 0; index < 100; index++) {
    const to = createStrategySample(random);
    assert.deepEqual(interpolateStrategySample(from, to, 0), from);
    assert.deepEqual(interpolateStrategySample(from, to, 1), to);
    for (let frame = 0; frame <= 60; frame++) validate(interpolateStrategySample(from, to, frame / 60));
    from = to;
  }
});
