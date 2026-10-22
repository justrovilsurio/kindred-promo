// Measure each SFX's peak level and attack-peak lag (frames @30fps) from decoded mono WAVs (sound-design §4.1/§4.6).
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const dir = 'public/audio/sfx', out = {};
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.mp3'))) {
  const wav = `analysis/sfx-${f}.wav`;
  execFileSync('npx', ['remotion', 'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', `${dir}/${f}`, '-ac', '1', '-ar', '22050', '-c:a', 'pcm_s16le', wav], { shell: true });
  const b = fs.readFileSync(wav); let o = 12, data;
  while (o < b.length) { const id = b.toString('ascii', o, o + 4), sz = b.readUInt32LE(o + 4); if (id === 'data') { data = b.subarray(o + 8, o + 8 + sz); break; } o += 8 + sz + (sz % 2); }
  const n = data.length / 2; let peak = 0, peakI = 0;
  // 10 ms RMS envelope; lag = first frame reaching 70% of the envelope maximum (perceived hit).
  const H = 220, env = [];
  for (let i = 0; i + H <= n; i += H) { let s = 0; for (let k = i; k < i + H; k++) { const v = data.readInt16LE(k * 2) / 32768; s += v * v; if (Math.abs(v) > peak) { peak = Math.abs(v); peakI = k; } } env.push(Math.sqrt(s / H)); }
  const emax = Math.max(...env); const hitIdx = env.findIndex((e) => e >= 0.7 * emax);
  out[f] = { dur_s: +(n / 22050).toFixed(2), peak_db: +(20 * Math.log10(peak)).toFixed(1), hit_lag_f: +((hitIdx * H / 22050) * 30).toFixed(2) };
  fs.unlinkSync(wav);
}
fs.writeFileSync('src/sfx_peaks.json', JSON.stringify(out, null, 1));
console.log(out);
