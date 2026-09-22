import assert from 'node:assert/strict';
import test from 'node:test';
import { getTelescopeJourney } from '../lib/telescope-journey.ts';

test('the camera aligns with the eyepiece before the universe appears', () => {
  let previousDistance = Infinity;
  for (let i = 0; i <= 1000; i++) {
    const state = getTelescopeJourney(i / 1000);
    assert.ok(state.distance <= previousDistance);
    assert.ok(state.distance > .012, 'camera remains outside the lens and near plane');
    if (state.portal > 0) assert.equal(state.alignment, 1);
    if (state.fullUniverse > 0) assert.equal(state.portal, 1);
    previousDistance = state.distance;
  }
});

test('scroll endpoints hold complete scenes, including overscroll', () => {
  assert.deepEqual(getTelescopeJourney(-.2), getTelescopeJourney(0));
  assert.deepEqual(getTelescopeJourney(1.2), getTelescopeJourney(1));
  const start = getTelescopeJourney(0), end = getTelescopeJourney(1);
  assert.equal(start.openingOpacity, 1);
  assert.equal(start.portal, 0);
  assert.equal(start.endingOpacity, 0);
  assert.equal(end.fullUniverse, 1);
  assert.equal(end.endingOpacity, 1);
  assert.equal(end.openingOpacity, 0);
});

test('reduced motion holds the camera still while reaching the same final scene', () => {
  const start = getTelescopeJourney(0, true);
  for (let i = 0; i <= 100; i++) {
    const state = getTelescopeJourney(i / 100, true);
    assert.equal(state.distance, start.distance);
    assert.equal(state.alignment, 0);
    assert.equal(state.approach, 0);
  }
  assert.equal(getTelescopeJourney(1, true).fullUniverse, 1);
});

test('reverse scrolling reconstructs the same transition without accumulated state', () => {
  const forward = Array.from({ length: 101 }, (_, i) => getTelescopeJourney(i / 100));
  for (let i = 100; i >= 0; i--) assert.deepEqual(getTelescopeJourney(i / 100), forward[i]);
});
