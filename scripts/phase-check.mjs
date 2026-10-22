// Diagnostic: at a fixed BPM, which phase do kick ONSETS (rising edge) favour inside the drum sections?
import fs from 'node:fs';
const buf = fs.readFileSync('analysis/cat-walk.wav');
let off = 12, sr = 0, data;
while (off < buf.length) { const id = buf.toString('ascii', off, off + 4), size = buf.readUInt32LE(off + 4);
  if (id === 'fmt ') sr = buf.readUInt32LE(off + 12); if (id === 'data') { data = buf.subarray(off + 8, off + 8 + size); break; } off += 8 + size + (size % 2); }
const y = new Float32Array(data.length / 2); for (let i = 0; i < y.length; i++) y[i] = data.readInt16LE(i * 2) / 32768;
const a = Math.exp(-2 * Math.PI * 150 / sr); let s1 = 0, s2 = 0; const lp = new Float32Array(y.length);
for (let i = 0; i < y.length; i++) { s1 = (1 - a) * y[i] + a * s1; s2 = (1 - a) * s1 + a * s2; lp[i] = s2; }
const H = Math.round(sr * 0.0025), n = Math.floor(y.length / H), e = new Float32Array(n);
for (let f = 0; f < n; f++) { let s = 0; for (let i = f * H; i < (f + 1) * H; i++) s += lp[i] * lp[i]; e[f] = Math.log(1e-10 + s); }
const on = new Float32Array(n); for (let f = 1; f < n; f++) on[f] = Math.max(0, e[f] - e[f - 1]);
const fps = sr / H, bpm = +process.argv[2], T = 60 / bpm;
const windows = JSON.parse(process.argv[3]);
const hist = new Float64Array(Math.round(T * fps));
for (const [lo, hi] of windows) for (let f = Math.round(lo * fps); f < hi * fps; f++) hist[Math.floor(((f / fps) % T) * fps) % hist.length] += on[f];
const order = [...hist.keys()].sort((p, q) => hist[q] - hist[p]).slice(0, 6);
console.log(`bpm ${bpm} T ${T.toFixed(5)} top phases (s):`, order.map((k) => (k / fps).toFixed(4) + ' (' + hist[k].toFixed(0) + ')').join('  '));
