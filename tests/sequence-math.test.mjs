import test from 'node:test';
import assert from 'node:assert/strict';
import { FRAME_COUNT, sequenceFrame, coverCrop } from '../lib/sequence-math.ts';

test('scroll reaches both endpoint frames, with holds, and is reversible', () => {
  assert.equal(sequenceFrame(-1), 0);
  assert.equal(sequenceFrame(.04), 0);
  assert.equal(sequenceFrame(.90), FRAME_COUNT - 1);
  assert.equal(sequenceFrame(2), FRAME_COUNT - 1);
  const forward = Array.from({ length: 101 }, (_, i) => sequenceFrame(i / 100));
  assert.deepEqual([...forward].reverse(), Array.from({ length: 101 }, (_, i) => sequenceFrame((100 - i) / 100)));
  assert.ok(forward.every((frame, i) => i === 0 || frame >= forward[i - 1]));
});

test('reduced motion skips the camera movement', () => {
  assert.equal(sequenceFrame(.5, true), 0);
  assert.equal(sequenceFrame(.8, true), 232);
});

test('portrait crops track the eyepiece and stay inside the source at every frame', () => {
  for (const [w, h] of [[390, 844], [1920, 1080], [2560, 1080], [844, 390]]) {
    for (let frame = 0; frame < FRAME_COUNT; frame++) {
      const crop = coverCrop(1920, 1080, w, h, frame);
      assert.ok(crop.x >= 0 && crop.y >= 0);
      assert.ok(crop.x + crop.width <= 1920.001 && crop.y + crop.height <= 1080.001);
      assert.ok(Math.abs(crop.width / crop.height - w / h) < .00001);
    }
  }
  const lens = coverCrop(1920, 1080, 390, 844, 140);
  assert.ok(lens.x <= 1920 * .5 && lens.x + lens.width >= 1920 * .5);
});
