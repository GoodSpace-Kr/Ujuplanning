// Keep the original WebPs unchanged. Small content-addressed packs amortize
// network latency without requiring all frames to arrive before the first paint.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const manifest = {};
for (const [sequence, count] of [['studio', 241], ['telescope', 233]]) {
  manifest[sequence] = {};
  for (const variant of ['desktop', 'mobile']) {
    const frames = await Promise.all(Array.from({ length: count }, (_, i) =>
      readFile(new URL(`public/assets/${sequence}-sequence/${variant}/${String(i).padStart(4, '0')}.webp`, root))));
    const groups = [];
    const overview = [...new Set([0, ...Array.from({ length: Math.ceil(count / 12) }, (_, i) => i * 12), count - 1])];
    const indices = [overview];
    for (let start = 0; start < count; start += 12) {
      indices.push(Array.from({ length: Math.min(12, count - start) }, (_, i) => start + i).filter(i => !overview.includes(i)));
    }
    const directory = `assets/sequence-packs/${sequence}/${variant}`;
    await mkdir(new URL(`public/${directory}/`, root), { recursive: true });
    for (const group of indices) {
      if (!group.length) continue;
      const parts = [Buffer.from('UJU1')];
      for (const index of group) {
        const header = Buffer.alloc(8);
        header.writeUInt32LE(index, 0);
        header.writeUInt32LE(frames[index].length, 4);
        parts.push(header, frames[index]);
      }
      const data = Buffer.concat(parts);
      const hash = createHash('sha256').update(data).digest('hex').slice(0, 16);
      const path = `${directory}/${hash}.bin`;
      await writeFile(new URL(`public/${path}`, root), data);
      groups.push({ url: `/${path}`, frames: group });
    }
    manifest[sequence][variant] = groups;
  }
}
await writeFile(new URL('lib/sequence-packs.generated.json', root), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Prepared lossless WebP packs in ${fileURLToPath(new URL('public/assets/sequence-packs/', root))}`);
