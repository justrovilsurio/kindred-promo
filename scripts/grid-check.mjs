// Diagnostic: how strongly each candidate grid lines up with kick energy, section by section.
// A correct grid keeps a high on-beat / off-beat kick ratio from the first drum bar to the last.
import fs from 'node:fs';
const buf = fs.readFileSync('analysis/cat-walk.wav');
let off = 12, sr = 0, data;
while (off < buf.length) { const id = buf.toString('ascii', off, off + 4), size = buf.readUInt32LE(off + 4);
  if (id === 'fmt ') sr = buf.readUInt32LE(off + 12); if (id === 'data') { data = buf.subarray(off + 8, off + 8 + size); break; } off += 8 + size + (size % 2); }
const y = new Float32Array(data.length / 2); for (let i = 0; i < y.length; i++) y[i] = data.readInt16LE(i * 2) / 32768;
// One-pole low-pass at ~150 Hz twice, then 5 ms energy frames -> kick envelope.
const a = Math.exp(-2 * Math.PI * 150 / sr); let s1 = 0, s2 = 0; const lp = new Float32Array(y.length);
for (let i = 0; i < y.length; i++) { s1 = (1 - a) * y[i] + a * s1; s2 = (1 - a) * s1 + a * s2; lp[i] = s2; }
const H = Math.round(sr * 0.005), n = Math.floor(y.length / H), e = new Float32Array(n);
for (let f = 0; f < n; f++) { let s = 0; for (let i = f * H; i < (f + 1) * H; i++) s += lp[i] * lp[i]; e[f] = s; }
const fps = sr / H, dur = y.length / sr;
const at = (t) => { const f = Math.round(t * fps); let m = 0; for (let k = f - 4; k <= f + 4; k++) m = Math.max(m, e[k] ?? 0); return m; };
function bestPhase(bpm) { const T = 60 / bpm; let b = { ph: 0, s: -1 };
  for (let ph = 0; ph < T; ph += 0.002) { let s = 0; for (let t = ph; t < dur; t += T) s += at(t); if (s > b.s) b = { ph, s }; } return { T, ...b }; }
for (const bpm of process.argv.slice(2).map(Number)) {
  const { T, ph, s } = bestPhase(bpm); const rows = [];
  for (let sec = 0; sec < dur - 8; sec += 8) {
    let on = 0, offb = 0, c = 0;
    for (let t = ph; t < dur; t += T) if (t >= sec && t < sec + 8) { on += at(t); offb += at(t + T / 2); c++; }
    rows.push((on / Math.max(1e-12, offb)).toFixed(1));
  }
  console.log(`bpm ${bpm} phase ${ph.toFixed(3)} total ${s.toExponential(3)}\n  on/off ratio per 8 s: ${rows.join(' ')}`);
}
