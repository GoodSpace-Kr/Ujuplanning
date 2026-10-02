import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/studio-journey.ts', import.meta.url), 'utf8')
  .replace("'./hero-transition'", JSON.stringify(new URL('../lib/hero-transition.ts', import.meta.url).href));
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { studioTimeline, studioGeometry, STUDIO_FRAMES, STUDIO_SCREEN } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);

test('video completes before expansion, stays at the last frame through the gallery, then rewinds', () => {
  let previous = 0;
  for (let i = 0; i <= 260; i++) {
    const t = studioTimeline(i / 1000);
    assert.ok(t.frame >= previous);
    assert.equal(t.zoom, 0);
    previous = t.frame;
  }
  for (let i = 260; i <= 790; i++) assert.equal(studioTimeline(i / 1000).frame, STUDIO_FRAMES - 1);
  for (let i = 790; i <= 1000; i++) {
    const t = studioTimeline(i / 1000);
    assert.ok(t.frame <= previous);
    assert.equal(t.zoom, 0);
    previous = t.frame;
  }
  assert.equal(previous, 0);
});

test('all five projects are readable at full zoom and disappear before the reverse footage', () => {
  const seen = new Set();
  for (let i = 400; i <= 650; i++) {
    const t = studioTimeline(i / 1000);
    assert.equal(t.zoom, 1);
    assert.equal(t.projectOpacity, 1);
    seen.add(t.projectIndex);
  }
  assert.deepEqual([...seen], [0, 1, 2, 3, 4]);
  assert.equal(studioTimeline(.79).projectOpacity, 0);
  for (let i = 0; i <= 100; i++) {
    const fraction = i / 100;
    const incoming = studioTimeline(.28 + .11 * fraction).zoom;
    const outgoing = studioTimeline(.775 - .11 * fraction).zoom;
    assert.ok(Math.abs(incoming - outgoing) < 1e-12);
  }
});

test('phone and final-frame background share one transform at every responsive size', () => {
  for (const [w, h] of [[320,568], [390,844], [768,1024], [1440,900], [2560,1080], [844,390]]) {
    for (const zoom of [0,.2,.5,.8,1]) {
      const g = studioGeometry(w, h, zoom);
      const scale = g.width / 1920;
      assert.ok(Math.abs(g.screen.x - (g.x + STUDIO_SCREEN.x * scale)) < 1e-7);
      assert.ok(Math.abs(g.screen.y - (g.y + STUDIO_SCREEN.y * scale)) < 1e-7);
      assert.ok(g.x <= .001 && g.y <= .001);
      assert.ok(g.x + g.width >= w && g.y + g.height >= h);
    }
    const full = studioGeometry(w, h, 1).screen;
    assert.ok(full.x < 0 && full.y < 0);
    assert.ok(full.x + full.width > w && full.y + full.height > h);
    assert.deepEqual(studioGeometry(w,h,studioTimeline(.28).zoom), studioGeometry(w,h,studioTimeline(.79).zoom));
  }
});

test('reduced motion uses static endpoint scenes and discrete zoom', () => {
  for (let i=0; i<=100; i++) {
    const t=studioTimeline(i/100,true);
    assert.ok([0,240].includes(t.frame));
    assert.ok([0,1].includes(t.zoom));
  }
});
