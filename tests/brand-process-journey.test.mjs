import test from 'node:test';
import assert from 'node:assert/strict';
import { brandProcessJourney, brandProcessIntroPhase, brandProcessIntroDelay, brandExpansionClock, shouldStartBrandExpansion, BRAND_EXPANSION_DURATION, BRAND_PROCESS_EXPANSION_START } from '../lib/brand-process-journey.ts';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9);

test('after tiles settle, the very next scroll starts expansion with no reading interval', () => {
  for (const [height, film] of [[720, 360], [844, 300]]) {
    for (const offsetVh of [22, 70, 150, 300]) {
      const offset = offsetVh / 100 * height;
      const delay = brandProcessIntroDelay(offset, height);
      const at = y => brandProcessJourney(y, height, BRAND_PROCESS_EXPANSION_START, film, delay);
      close(at(offset).expansion, 0);
      close(at(offset).film, 0);
      // One pixel of forward motion enters expansion instead of four empty screens.
      assert.ok(at(offset + 1).expansion > 0);
      close(at(offset + 1).film, 0);
      close(at(offset + height).expansion, 1);
      close(at(offset + height).film, 0);
      assert.ok(at(offset + height + 1).film > 0);
      close(at(offset - 1).expansion, 0);
    }
  }
});

test('automatic expansion starts only on forward entry and does not trap scrolling after completion', () => {
  assert.equal(shouldStartBrandExpansion(-.01, .02, false, false), true);
  assert.equal(shouldStartBrandExpansion(0, .000001, false, false), true);
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
      const state = brandProcessJourney((BRAND_PROCESS_EXPANSION_START + position * 100) * 7.2, 720);
      close(state.film, 0);
    }
  }
});

test('the shortened section retains the full film duration on desktop and mobile', () => {
  for (const [height, film] of [[720, 360], [844, 300]]) {
    const at = vh => brandProcessJourney(vh / 100 * height, height, BRAND_PROCESS_EXPANSION_START, film);
    close(at(22).expansion, 0);
    close(at(72).expansion, .5);
    close(at(122).expansion, 1);
    close(at(122).film, 0);
    close(at(122 + film / 2).film, .5);
    close(at(122 + film).film, 1);
  }
});

test('reverse scroll restores the same card and sequence positions without a second scene', () => {
  const positions = Array.from({length: 186}, (_, i) => i * 50);
  const forward = positions.map(y => brandProcessJourney(y, 1000));
  const reverse = [...positions].reverse().map(y => brandProcessJourney(y, 1000));
  assert.deepEqual(reverse, [...forward].reverse());
  for (const field of ['expansion', 'film']) {
    assert.ok(forward.every((state, i) => state[field] >= 0 && state[field] <= 1 && (!i || state[field] >= forward[i - 1][field])));
  }
});

test('photo diagonal settles before tiles enter and expansion waits for the full mosaic', () => {
  assert.equal(brandProcessIntroPhase(0), 'moving');
  assert.equal(brandProcessIntroPhase(999), 'moving');
  assert.equal(brandProcessIntroPhase(1000), 'mosaic');
  assert.equal(brandProcessIntroPhase(2199), 'mosaic');
  assert.equal(brandProcessIntroPhase(2200), 'steps');
  for (const offset of [220, 950, 1800]) {
    const delay = brandProcessIntroDelay(offset, 720);
    const atReveal = brandProcessJourney(offset, 720, BRAND_PROCESS_EXPANSION_START, 360, delay);
    close(atReveal.expansion, 0);
    close(atReveal.film, 0);
  }
});
