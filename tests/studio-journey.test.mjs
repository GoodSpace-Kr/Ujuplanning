import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/studio-journey.ts', import.meta.url), 'utf8')
  .replace("'./hero-transition'", JSON.stringify(new URL('../lib/hero-transition.ts', import.meta.url).href));
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { studioTimeline, studioGeometry, STUDIO_FRAMES, STUDIO_SCREEN, shouldStartStudioEntry, studioEntryProgress, STUDIO_ENTRY_START, STUDIO_ENTRY_END, STUDIO_ENTRY_DURATION } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);

test('automatic entry starts at the straight-on phone and stops on the first project', () => {
  assert.equal(shouldStartStudioEntry(STUDIO_ENTRY_START - .01, STUDIO_ENTRY_START), true);
  assert.equal(shouldStartStudioEntry(.3,.5), true);
  assert.equal(shouldStartStudioEntry(.45,.46), true);
  for (const [from,to] of [[.2,.24],[.45,.44],[.61,.65],[0,.9]]) assert.equal(shouldStartStudioEntry(from,to), false);
  assert.equal(shouldStartStudioEntry(.38,.39,true), false);
  let lastZoom = 0;
  for (let ms=0; ms<=STUDIO_ENTRY_DURATION; ms+=16) {
    const t=studioTimeline(studioEntryProgress(ms));
    assert.equal(t.frame, STUDIO_FRAMES - 1);
    assert.equal(t.projectIndex,0);
    assert.ok(t.zoom>=lastZoom);
    lastZoom=t.zoom;
  }
  const end=studioTimeline(studioEntryProgress(STUDIO_ENTRY_DURATION));
  assert.equal(end.projectOpacity,1);
  assert.equal(end.zoom,1);
  assert.equal(studioEntryProgress(STUDIO_ENTRY_DURATION*2), STUDIO_ENTRY_END);
});

test('forward scrolling never contracts the phone or rewinds the studio video', () => {
  let previousFrame = 0, previousZoom = 0;
  for (let i=0; i<=1000; i++) {
    const t=studioTimeline(i/1000);
    assert.ok(t.frame>=previousFrame);
    assert.ok(t.zoom>=previousZoom);
    assert.ok(['approach','expand','projects'].includes(t.phase));
    if(i/1000>=STUDIO_ENTRY_START) assert.equal(t.frame, STUDIO_FRAMES - 1);
    previousFrame=t.frame;
    previousZoom=t.zoom;
  }
});

test('all five projects stay readable at full zoom until the stage releases into services', () => {
  const seen = new Set();
  for (let i=600; i<=1000; i++) {
    const t=studioTimeline(i/1000);
    assert.equal(t.zoom,1);
    assert.equal(t.projectOpacity,1);
    seen.add(t.projectIndex);
    assert.equal(shouldStartStudioEntry(i/1000, i/1000+.00001), false);
  }
  assert.deepEqual([...seen], [0,1,2,3,4]);
  const end=studioTimeline(1);
  assert.equal(end.phase,'projects');
  assert.equal(end.projectIndex,4);
  assert.equal(end.projectProgress,1);
  assert.deepEqual(studioTimeline(1.2),end);
  // Scrolling back from services should show the last project, not the opening footage.
  assert.equal(studioTimeline(.99).projectIndex,4);
  assert.equal(studioTimeline(.99).frame, STUDIO_FRAMES - 1);
});

test('phone and final-frame background share one transform at every responsive size', () => {
  for (const [w,h] of [[320,568],[390,844],[768,1024],[1440,900],[2560,1080],[844,390]]) {
    for (const zoom of [0,.2,.5,.8,1]) {
      const g=studioGeometry(w,h,zoom);
      const scale=g.width/1920;
      assert.ok(Math.abs(g.screen.x-(g.x+STUDIO_SCREEN.x*scale))<1e-7);
      assert.ok(Math.abs(g.screen.y-(g.y+STUDIO_SCREEN.y*scale))<1e-7);
      assert.ok(g.x<=.001 && g.y<=.001);
      assert.ok(g.x+g.width>=w && g.y+g.height>=h);
    }
    const full=studioGeometry(w,h,1).screen;
    assert.ok(full.x<0 && full.y<0);
    assert.ok(full.x+full.width>w && full.y+full.height>h);
  }
});

test('reduced motion uses static endpoint scenes and keeps the final project visible', () => {
  for(let i=0; i<=100; i++) {
    const t=studioTimeline(i/100,true);
    assert.ok([0,STUDIO_FRAMES-1].includes(t.frame));
    assert.ok([0,1].includes(t.zoom));
  }
  const end=studioTimeline(1,true);
  assert.equal(end.frame,STUDIO_FRAMES-1);
  assert.equal(end.zoom,1);
  assert.equal(end.projectOpacity,1);
  assert.equal(end.projectIndex,4);
});
