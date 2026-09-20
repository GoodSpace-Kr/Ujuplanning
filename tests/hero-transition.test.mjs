import assert from 'node:assert/strict';
import test from 'node:test';
import { getHeroFrame, getHeroTimeline } from '../lib/hero-transition.ts';

test('all five projects are shown before the phone expands', () => {
  const seen = new Set();
  for (let p = .31; p <= .72; p += .001) {
    const state = getHeroTimeline(p, 5);
    seen.add(state.projectIndex);
    assert.equal(state.expansion, 0);
    assert.equal(state.headingOpacity, 0);
  }
  assert.deepEqual([...seen], [0, 1, 2, 3, 4]);
  assert.equal(getHeroTimeline(.7, 5).projectIndex, 4);
  assert.equal(getHeroTimeline(.72, 5).projectCopyOpacity, 1);
});

test('expanded inset screen covers portrait, landscape, and desktop viewports', () => {
  for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [844, 390], [1440, 900], [2560, 1440]]) {
    const phone = getHeroFrame(width, height, 1, 0);
    const expanded = getHeroFrame(width, height, 1, 1);
    const midpoint = getHeroFrame(width, height, 1, .5);
    assert.ok(Math.abs(midpoint.width / midpoint.height - phone.width / phone.height) < 1e-10);
    assert.ok(expanded.left + expanded.width * .058 <= 0);
    assert.ok(expanded.left + expanded.width * .942 >= width);
    assert.ok(expanded.top + expanded.height * .028 <= 0);
    assert.ok(expanded.top + expanded.height * .971 >= height);
    assert.equal(expanded.radiusX, 0);
    assert.equal(expanded.radiusY, 0);
    const start = getHeroFrame(width, height, 1, 1e-9);
    assert.ok(Math.abs(start.width - phone.width) < .001);
  }
});

test('the service heading is fully presented before sticky scrolling ends', () => {
  for (const p of [.97, 1, 1.1]) {
    const state = getHeroTimeline(p, 5);
    assert.equal(state.expansion, 1);
    assert.equal(state.headingOpacity, 1);
    assert.equal(state.phoneOpacity, 1, 'mask stays stable underneath the white overlay');
    assert.equal(state.projectCopyOpacity, 0);
    assert.equal(state.projectIndex, 4);
  }
});

test('reduced motion switches directly between complete scenes', () => {
  for (const p of [.72, .8, .854, .855, .9, 1]) {
    const state = getHeroTimeline(p, 5, true);
    const expected = p < .855 ? 0 : 1;
    assert.equal(state.expansion, expected);
    assert.equal(state.headingOpacity, expected);
  }
});

test('phone stays opaque until its screen nearly fills both viewport axes', () => {
  for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [844, 390], [1440, 900], [2560, 1440]]) {
    let previous = 0;
    for (let i = 0; i <= 100; i++) {
      const frame = getHeroFrame(width, height, 1, i / 100);
      const coverage = Math.min(frame.width * .884 / width, frame.height * .943 / height);
      assert.ok(frame.dissolve >= previous);
      if (coverage <= .95) assert.equal(frame.dissolve, 0);
      if (coverage >= 1.35) assert.equal(frame.dissolve, 1);
      previous = frame.dissolve;
    }
    assert.equal(previous, 1);
    // Reverse scrolling restores exactly the same intermediate appearance.
    assert.equal(getHeroFrame(width, height, 1, 0).dissolve, 0);
  }
});

test('desktop phone stays opaque even after its top and bottom leave the viewport', () => {
  const frame = getHeroFrame(1440, 900, 1, .6);
  assert.ok(frame.height > 900 * 1.7);
  assert.equal(frame.dissolve, 0);
});
