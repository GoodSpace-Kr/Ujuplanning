import test from 'node:test';
import assert from 'node:assert/strict';
import { brandProcessJourney, brandProcessCopyTravel, brandExpansionClock, shouldStartBrandExpansion, BRAND_EXPANSION_DURATION } from '../lib/brand-process-journey.ts';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9);

test('automatic expansion starts only on forward entry and does not trap scrolling after completion', () => {
  assert.equal(shouldStartBrandExpansion(-.01, .02, false, false), true);
  assert.equal(shouldStartBrandExpansion(.2, .1, false, false), false);
  assert.equal(shouldStartBrandExpansion(.99, 1.01, false, true), false);
  assert.equal(shouldStartBrandExpansion(-.01, .02, true, false), false);
  assert.equal(shouldStartBrandExpansion(-.01, 1.2, false, false), false);
});

test('one trigger completes expansion on its clock without advancing the telescope film', () => {
  for (const from of [0, .15, .75]) {
    close(brandExpansionClock(0, from), from);
    close(brandExpansionClock(BRAND_EXPANSION_DURATION, from), 1);
    close(brandExpansionClock(BRAND_EXPANSION_DURATION * 2, from), 1);
    for (let elapsed = 0; elapsed <= BRAND_EXPANSION_DURATION; elapsed += 16) {
      const position = brandExpansionClock(elapsed, from);
      const state = brandProcessJourney((465 + position * 100) * 7.2, 720);
      close(state.film, 0);
    }
  }
});

test('reading finishes before the card expands, and film stays at its first frame throughout expansion', () => {
  for (const [reading, film] of [[465, 360], [425, 300]]) {
    for (const height of [720, 844]) {
      const at = vh => brandProcessJourney(vh / 100 * height, height, reading, film);
      close(at(22).reading, 0);
      close(at(reading).reading, 1);
      close(at(reading).expansion, 0);
      for (let i = 0; i <= 100; i++) close(at(reading + i).film, 0);
      close(at(reading + 50).expansion, .5);
      close(at(reading + 100).expansion, 1);
      close(at(reading + 100 + film).film, 1);
    }
  }
});

test('observe enters from below before crossing the center, without pausing subsequent copy travel', () => {
  for (const readingEnd of [465, 425]) {
    const travelAt = vh => brandProcessCopyTravel(brandProcessJourney(vh * 7.2, 720, readingEnd).reading);
    close(travelAt(22), -.65);
    assert.ok(travelAt(45) < -.35);
    assert.ok(travelAt(100) > 0);
    close(travelAt(readingEnd), 4);
    for (let vh = 23; vh < readingEnd; vh++) assert.ok(travelAt(vh) > travelAt(vh - 1));
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
