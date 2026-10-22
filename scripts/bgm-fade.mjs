// Bake the BGM envelope into the trimmed promo bed (fade in 0.2 s, fade out from video beat 86 to the end),
// so the render and the workbench manifest play the identical file at a constant 0.34.
import fs from 'node:fs';
const p = process.argv[2], fadeIn = +process.argv[3], outStart = +process.argv[4], outEnd = +process.argv[5];
const b = fs.readFileSync(p); let o = 12, sr = 0, ch = 0, off = 0, size = 0;
while (o < b.length) { const id = b.toString('ascii', o, o + 4), sz = b.readUInt32LE(o + 4); if (id === 'fmt ') { ch = b.readUInt16LE(o + 10); sr = b.readUInt32LE(o + 12); } if (id === 'data') { off = o + 8; size = sz; break; } o += 8 + sz + (sz % 2); }
const frames = size / (2 * ch);
for (let i = 0; i < frames; i++) {
  const t = i / sr;
  const g = Math.min(1, t / fadeIn) * (t < outStart ? 1 : Math.max(0, 1 - (t - outStart) / (outEnd - outStart)));
  if (g === 1) continue;
  for (let c = 0; c < ch; c++) { const k = off + (i * ch + c) * 2; b.writeInt16LE(Math.round(b.readInt16LE(k) * g), k); }
}
fs.writeFileSync(p, b); console.log({ sr, ch, seconds: frames / sr });
