import assert from 'node:assert/strict';
import test from 'node:test';
import { projectScenePose } from '../lib/project-journey.ts';

test('native vertical progress drives artwork continuously in both scroll directions', () => {
  const samples = Array.from({ length: 1601 }, (_, i) => projectScenePose(800 - i, 800, 800));
  for (let i = 0; i < samples.length; i++) {
    const pose = samples[i];
    assert.ok(pose.enter >= 0 && pose.enter <= 1);
    if (i > 0) {
      assert.ok(pose.progress >= samples[i - 1].progress);
      assert.ok(Math.abs(pose.lift - samples[i - 1].lift) < 1, 'no scene boundary jump');
    }
  }
  for (let i = 1600; i >= 0; i--) assert.deepEqual(projectScenePose(800 - i, 800, 800), samples[i]);
});

test('the first scene meets the phone preview at its neutral composition', () => {
  const pose = projectScenePose(0, 900, 900);
  assert.equal(pose.enter, 1);
  assert.equal(pose.lift, 0);
  assert.equal(pose.drift, 0);
  assert.equal(pose.turn, 0);
  assert.equal(pose.scale, 1);
});

test('mobile uses smaller movements and reduced motion leaves all artwork readable', () => {
  for (const top of [900, 400, 0, -400, -900]) {
    const desktop = projectScenePose(top, 900, 900);
    const mobile = projectScenePose(top, 900, 900, true);
    assert.ok(Math.abs(mobile.lift) <= Math.abs(desktop.lift));
    assert.ok(Math.abs(mobile.turn) <= Math.abs(desktop.turn));
    const reduced = projectScenePose(top, 900, 900, true, true);
    assert.equal(reduced.enter, 1);
    assert.equal(reduced.lift, 0);
    assert.equal(reduced.drift, 0);
    assert.equal(reduced.scale, 1);
  }
});
