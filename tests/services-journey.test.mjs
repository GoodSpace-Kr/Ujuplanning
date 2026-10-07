import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/services-journey.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { activeServiceIndex, serviceCopyPose, serviceEntryPose, SERVICE_PAGE, servicePageScale, serviceTitleCharacterCount, SERVICE_TITLE_TYPING_END } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);

test('intro characters follow scroll forward and backward', () => {
  const total = 17;
  assert.equal(serviceTitleCharacterCount(-.2, total), 0);
  const early = serviceTitleCharacterCount(.1, total);
  const late = serviceTitleCharacterCount(.2, total);
  assert.ok(early > 0 && late > early && late < total);
  assert.equal(serviceTitleCharacterCount(SERVICE_TITLE_TYPING_END, total), total);
  assert.equal(serviceTitleCharacterCount(.1, total), early);
  assert.equal(serviceTitleCharacterCount(0, total), 0);
  const initialTitle = serviceEntryPose(0, 1200, 800, 480, 800, 720, 800);
  const fullyTyped = serviceEntryPose(SERVICE_TITLE_TYPING_END, 1200, 800, 480, 500, 720, 800);
  assert.equal(initialTitle.titleScale, .8);
  assert.equal(fullyTyped.titleScale, 1);
  assert.equal(fullyTyped.titleOpacity, 1);
});

test('the canvas follows the closest text panel in either scroll direction', () => {
  const centers = [500, 1500, 2500, 3500];
  assert.equal(activeServiceIndex(centers, 500), 0);
  assert.equal(activeServiceIndex(centers, 1001), 1);
  assert.equal(activeServiceIndex(centers, 2001), 2);
  assert.equal(activeServiceIndex(centers, 3001), 3);
  assert.equal(activeServiceIndex(centers, 1999), 1);
  assert.equal(activeServiceIndex(centers, -500), 0);
  assert.equal(activeServiceIndex(centers, 5000), 3);
});

test('text enters upward from below and leaves upward, reversing with scroll', () => {
  const entering = serviceCopyPose(1500, 1000, 1000);
  const centered = serviceCopyPose(1000, 1000, 1000);
  const leaving = serviceCopyPose(500, 1000, 1000);
  assert.ok(entering.offset > 0);
  assert.equal(centered.offset, 0);
  assert.ok(leaving.offset < 0);
  assert.equal(entering.scale, leaving.scale);
  assert.equal(entering.opacity, leaving.opacity);
  assert.ok(centered.opacity > entering.opacity);
});

test('the workspace peeks wider from the lower center, then shrinks and moves right beside the first service', () => {
  const before = serviceEntryPose(-.5, 1200, 800, 480, 1200, 720, 800);
  const appearing = serviceEntryPose(-.05, 1200, 800, 480, 840, 720, 800);
  const start = serviceEntryPose(0, 1200, 800, 480, 800, 720, 800);
  const middle = serviceEntryPose(.6, 1200, 800, 480, 320, 720, 800);
  const end = serviceEntryPose(1, 1200, 800, 480, 0, 720, 800);
  assert.equal(before.opacity, 0);
  assert.ok(appearing.opacity > 0 && appearing.opacity < 1);
  assert.equal(start.opacity, 1);
  assert.equal(start.titleOpacity, 1);
  assert.equal(end.opacity, 1);
  assert.equal(end.titleOpacity, 0);
  assert.ok(start.scale > middle.scale && middle.scale > end.scale);
  assert.equal(800 + start.y - SERVICE_PAGE.height * start.scale / 2, 800 * .7);
  assert.ok(SERVICE_PAGE.width * start.scale > SERVICE_PAGE.width * end.scale);
  assert.equal(480 + start.x, 1200 / 2);
  assert.ok(480 + start.x < 480 + end.x);
  assert.ok(320 + middle.y < 800 + start.y);
  assert.equal(end.x, 360);
  assert.equal(end.y, 400);
});

test('the workspace fits within its sticky visual on desktop and mobile', () => {
  for (const [width, height] of [[800, 900], [640, 754], [390, 400], [320, 290]]) {
    const scale = servicePageScale(width, height);
    assert.ok(scale > 0 && scale <= 1);
    assert.ok(SERVICE_PAGE.width * scale <= width - 32);
    assert.ok(SERVICE_PAGE.height * scale <= height - 48);
  }
});
