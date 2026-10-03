import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/services-journey.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { servicesJourney, SERVICE_STOPS, SERVICE_PAGE, servicePageScale } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);

test('the oversized introduction settles into four alternating, readable service scenes', () => {
  const first = servicesJourney(0);
  assert.equal(first.intro.opacity, 1);
  assert.ok(first.scale > 1.3);
  SERVICE_STOPS.forEach((stop, index) => {
    const scene = servicesJourney(stop);
    assert.equal(scene.activeIndex, index);
    assert.equal(scene.intro.opacity, 0);
    assert.equal(scene.scale, 1);
    assert.ok(index % 2 ? scene.x < .35 : scene.x > .65);
    scene.copies.forEach((copy, copyIndex) => assert.equal(copy.opacity, copyIndex === index ? 1 : 0));
  });
});

test('scrolling in either direction follows a continuous path with no jump at service changes', () => {
  for (const compact of [false, true]) {
    let previous = servicesJourney(0, compact);
    for (let i = 1; i <= 10000; i++) {
      const scene = servicesJourney(i / 10000, compact);
      for (const key of ['x', 'y', 'scale']) assert.ok(Math.abs(scene[key] - previous[key]) < .002);
      scene.copies.forEach((copy, index) => {
        assert.ok(copy.opacity >= 0 && copy.opacity <= 1);
        assert.ok(Math.abs(copy.y - previous.copies[index].y) < .003);
      });
      previous = scene;
    }
  }
});

test('each settled workspace fits desktop and mobile viewports; reduced motion keeps copies stationary', () => {
  for (const [width, height] of [[1440,900], [1176,754], [820,1180], [390,844], [320,568]]) {
    const compact = width <= 760;
    const scale = servicePageScale(width,height,compact);
    for (const stop of SERVICE_STOPS) {
      const scene = servicesJourney(stop,compact);
      const halfWidth = SERVICE_PAGE.width * scale / 2;
      const halfHeight = SERVICE_PAGE.height * scale / 2;
      assert.ok(scene.x * width - halfWidth >= 0);
      assert.ok(scene.x * width + halfWidth <= width);
      assert.ok(scene.y * height - halfHeight >= 0);
      assert.ok(scene.y * height + halfHeight <= height);
      const reduced = servicesJourney(stop,compact,true);
      reduced.copies.forEach(copy => { assert.equal(copy.x,0); assert.equal(copy.y,0); });
    }
  }
});
