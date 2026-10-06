import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/scroll-motion.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { advanceScroll, scrollDestination, normalizeWheelDelta, isAutomaticScrollActive, setAutomaticScrollActive, subscribeScrollOwnership } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);

test('a wheel notch glides monotonically to its exact destination without overshoot', () => {
  let position = 0;
  let frames = 0;
  const first = advanceScroll(position, 120, 1000 / 60);
  assert.ok(first > 0 && first < 25);
  while (position !== 120 && frames < 120) {
    const next = advanceScroll(position, 120, 1000 / 60);
    assert.ok(next > position && next <= 120);
    position = next;
    frames++;
  }
  assert.equal(position, 120);
  assert.ok(frames > 20 && frames < 60);
});

test('motion feels consistent at 60Hz and 120Hz', () => {
  function simulate(hz) {
    let y = 0;
    for (let i = 0; i < hz / 2; i++) y = advanceScroll(y, 800, 1000 / hz);
    return y;
  }
  assert.ok(Math.abs(simulate(60) - simulate(120)) < .001);
});

test('successive wheel input accumulates, reverses immediately and clamps at both edges', () => {
  assert.equal(scrollDestination(130, 240, 120, 1000), 360);
  assert.equal(scrollDestination(130, 240, -40, 1000), 90);
  assert.equal(scrollDestination(10, 10, -120, 1000), 0);
  assert.equal(scrollDestination(990, 990, 120, 1000), 1000);
  assert.equal(normalizeWheelDelta(3, 1, 800), 60);
  assert.equal(normalizeWheelDelta(1, 2, 800), 800);
  assert.equal(normalizeWheelDelta(120, 0, 800), 120);
});

test('automatic entry/exit takes ownership once and releases it for ordinary scrolling', () => {
  const states = [];
  const unsubscribe = subscribeScrollOwnership(() => states.push(isAutomaticScrollActive()));
  setAutomaticScrollActive(true);
  setAutomaticScrollActive(true);
  setAutomaticScrollActive(false);
  setAutomaticScrollActive(true);
  setAutomaticScrollActive(false);
  assert.deepEqual(states, [true, false, true, false]);
  unsubscribe();
  setAutomaticScrollActive(true);
  setAutomaticScrollActive(false);
  assert.equal(states.length, 4);
});
