import assert from 'node:assert/strict';
import test from 'node:test';
import { projectJourney, projectArtworkPose, projectScrollStop } from '../lib/project-journey.ts';

test('the project track moves forward continuously and retraces the same path in reverse', () => {
  const samples = Array.from({ length: 1001 }, (_, i) => projectJourney(i / 1000));
  const seen = new Set();
  samples.forEach((state, i) => {
    seen.add(state.active);
    assert.ok(state.position >= 0 && state.position <= 4);
    if (i) {
      assert.ok(state.position >= samples[i - 1].position);
      assert.ok(state.position - samples[i - 1].position < .011, 'no scene-boundary jump');
    }
  });
  for (let i = 1000; i >= 0; i--) assert.deepEqual(projectJourney(i / 1000), samples[i]);
  assert.deepEqual([...seen], [0, 1, 2, 3, 4]);
});

test('navigation stops center the selected project, including the first and last', () => {
  for (let index = 0; index < 5; index++) {
    const state = projectJourney(projectScrollStop(index));
    assert.equal(state.active, index);
    assert.ok(Math.abs(state.position - index) < 1e-10);
  }
  assert.deepEqual(projectJourney(-1), projectJourney(0));
  assert.deepEqual(projectJourney(2), projectJourney(1));
  assert.equal(projectJourney(.98).position, 4, 'last card is settled before the sticky stage releases');
});

test('artwork settles squarely on the reading position without moving explanatory copy', () => {
  for (let index = 0; index < 5; index++) {
    const pose = projectArtworkPose(index, index, 1);
    assert.equal(pose.x, 0);
    assert.equal(pose.y, 0);
    assert.equal(pose.scale, 1);
    assert.equal(Math.abs(pose.rotation), 0);
    assert.equal(pose.opacity, 1);
    for (const position of [0, .5, 1.5, 3, 4]) {
      const moving = projectArtworkPose(position, index, 1);
      assert.ok(Math.abs(moving.rotation) <= 2.4 + 1e-10);
      assert.ok(moving.scale >= .94 && moving.scale <= 1);
    }
  }
});
