// Post-render beat check (music-beat-sync §5): for each shot cut / hit, find the nearest kick onset in the
// rendered BGM track (low band, rising edge) and report the error in frames. Also reports the track peak.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const FF = 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe';
const SR = 22050;
execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', '-i', process.argv[2], '-ac', '1', '-ar', String(SR), '-c:a', 'pcm_s16le', 'analysis/render-bgm.wav']);
const b = fs.readFileSync('analysis/render-bgm.wav'); let o = 12, d;
while (o < b.length) { const id = b.toString('ascii', o, o + 4), sz = b.readUInt32LE(o + 4); if (id === 'data') { d = b.subarray(o + 8, o + 8 + sz); break; } o += 8 + sz + (sz % 2); }
const y = new Float32Array(d.length / 2); let peak = 0;
for (let i = 0; i < y.length; i++) { y[i] = d.readInt16LE(i * 2) / 32768; peak = Math.max(peak, Math.abs(y[i])); }
const a = Math.exp(-2 * Math.PI * 150 / SR); let s1 = 0, s2 = 0; const lp = new Float32Array(y.length);
for (let i = 0; i < y.length; i++) { s1 = (1 - a) * y[i] + a * s1; s2 = (1 - a) * s1 + a * s2; lp[i] = s2; }
const H = Math.round(SR * 0.0025), n = Math.floor(y.length / H), e = new Float32Array(n);
for (let f = 0; f < n; f++) { let s = 0; for (let i = f * H; i < (f + 1) * H; i++) s += lp[i] * lp[i]; e[f] = Math.log(1e-10 + s); }
const fps = SR / H;
const T = 0.4615412, beatF = (v) => Math.round(v * T * 30);
const cuts = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const rows = cuts.map(([name, v]) => {
  const target = beatF(v) / 30; let best = { t: 0, d: -1 };
  for (let f = Math.round((target - 0.08) * fps); f <= Math.round((target + 0.08) * fps); f++) { const dd = (e[f] ?? 0) - (e[f - 1] ?? 0); if (dd > best.d) best = { t: f / fps, d: dd }; }
  return { name, beat: v, cut_f: beatF(v), onset_f: +(best.t * 30).toFixed(2), err_f: +((best.t - target) * 30).toFixed(2) };
});
console.log(rows, 'peak dBFS', (20 * Math.log10(peak)).toFixed(2));
