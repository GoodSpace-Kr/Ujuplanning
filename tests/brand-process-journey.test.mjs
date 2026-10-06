import test from 'node:test';
import assert from 'node:assert/strict';
import { brandProcessJourney } from '../lib/brand-process-journey.ts';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9);

test('reading finishes before the card expands, and film stays at its first frame throughout expansion', () => {
  for (const [reading, film] of [[465, 360], [425, 300]]) {
    for (const height of [720, 844]) {
      const at = vh => brandProcessJourney(vh / 100 * height, height, reading, film);
      close(at(85).reading, 0);
      close(at(reading).reading, 1);
      close(at(reading).expansion, 0);
      for (let i = 0; i <= 100; i++) close(at(reading + i).film, 0);
      close(at(reading + 50).expansion, .5);
      close(at(reading + 100).expansion, 1);
      close(at(reading + 100 + film).film, 1);
    }
  }
});

test('reverse scroll restores the same card and sequence positions without a second scene', () => {
  const positions = Array.from({length: 186}, (_, i) => i * 50);
  const forward = positions.map(y => brandProcessJourney(y, 1000));
  const reverse = [...positions].reverse().map(y => brandProcessJourney(y, 1000));
  assert.deepEqual(reverse, [...forward].reverse());
  for (const field of ['reading', 'expansion', 'film']) {
    assert.ok(forward.every((state, i) => state[field] >= 0 && state[field] <= 1 && (!i || state[field] >= forward[i - 1][field])));
  }
});
