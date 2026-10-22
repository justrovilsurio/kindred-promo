// Post-render A/V check (sound-design §4.6): cross-correlate source SFX against the rendered track to find
// where each sample actually starts; residual vs. the designed Sequence.from = output-track offset (frames).
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const FF = 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe';
const SR = 22050;
const decode = (src, out) => { execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-ac', '1', '-ar', String(SR), '-c:a', 'pcm_s16le', out]); return readWav(out); };
function readWav(p) {
  const b = fs.readFileSync(p); let o = 12, d;
  while (o < b.length) { const id = b.toString('ascii', o, o + 4), sz = b.readUInt32LE(o + 4); if (id === 'data') { d = b.subarray(o + 8, o + 8 + sz); break; } o += 8 + sz + (sz % 2); }
  const y = new Float32Array(d.length / 2); for (let i = 0; i < y.length; i++) y[i] = d.readInt16LE(i * 2) / 32768; return y;
}
const [render, ...probeArgs] = process.argv.slice(2); // probes: file:designedFromFrame
const mix = decode(render, 'analysis/render-audio.wav');
const res = [];
for (const arg of probeArgs) {
  const [file, fromF] = arg.split(':');
  const s = decode(`public/audio/sfx/${file}`, 'analysis/probe.wav').slice(0, Math.round(0.25 * SR));
  const centre = Math.round((+fromF / 30) * SR), W = Math.round(0.4 * SR);
  let best = { k: 0, c: -Infinity };
  const sn = Math.sqrt(s.reduce((a, v) => a + v * v, 0));
  for (let k = centre - W; k <= centre + W; k += 4) {
    let c = 0, mn = 0;
    for (let i = 0; i < s.length; i++) { const v = mix[k + i] ?? 0; c += v * s[i]; mn += v * v; }
    const nc = c / (sn * Math.sqrt(mn) + 1e-9);
    if (nc > best.c) best = { k, c: nc };
  }
  res.push({ file, designed_f: +fromF, found_f: +(best.k / SR * 30).toFixed(2), offset_f: +(best.k / SR * 30 - fromF).toFixed(2), corr: +best.c.toFixed(3) });
}
console.log(res);
