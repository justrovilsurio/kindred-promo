// Beat grid + drum-hit analysis for the BGM (Node port of references/music-beat-sync.md §1–3).
// Input: mono 16-bit WAV. Output: analysis/beat_data.json + analysis/grid_drift.json.
// All times stay float seconds; frames are only computed later in src/timeline.ts.
import fs from 'node:fs';

const [, , wavPath = 'analysis/cat-walk.wav', outDir = 'analysis'] = process.argv;

function readWav(path) {
  const buf = fs.readFileSync(path);
  let off = 12, sr = 0, data = null;
  while (off < buf.length) {
    const id = buf.toString('ascii', off, off + 4), size = buf.readUInt32LE(off + 4);
    if (id === 'fmt ') sr = buf.readUInt32LE(off + 12);
    if (id === 'data') { data = buf.subarray(off + 8, off + 8 + size); break; }
    off += 8 + size + (size % 2);
  }
  const y = new Float32Array(data.length / 2);
  for (let i = 0; i < y.length; i++) y[i] = data.readInt16LE(i * 2) / 32768;
  return { y, sr };
}

// RBJ biquad band-pass, run twice (4th order) like the scipy butter(4) band in the doc.
function bandpass(x, sr, lo, hi) {
  const f0 = Math.sqrt(lo * hi), bw = Math.log2(hi / lo);
  const w0 = 2 * Math.PI * f0 / sr, alpha = Math.sin(w0) * Math.sinh(Math.LN2 / 2 * bw * w0 / Math.sin(w0));
  const a0 = 1 + alpha, b0 = alpha / a0, b2 = -alpha / a0, a1 = -2 * Math.cos(w0) / a0, a2 = (1 - alpha) / a0;
  const pass = (src) => {
    const out = new Float32Array(src.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < src.length; i++) {
      const v = b0 * src[i] + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1; x1 = src[i]; y2 = y1; y1 = v; out[i] = v;
    }
    return out;
  };
  return pass(pass(x));
}

const HOP = 64;
// Onset strength: half-wave-rectified diff of log frame energy (spectral-flux stand-in per band).
function onsetEnv(x) {
  const n = Math.floor(x.length / HOP), e = new Float32Array(n), o = new Float32Array(n);
  for (let f = 0; f < n; f++) { let s = 0; for (let i = f * HOP; i < (f + 1) * HOP; i++) s += x[i] * x[i]; e[f] = Math.log(1e-9 + s); }
  for (let f = 1; f < n; f++) o[f] = Math.max(0, e[f] - e[f - 1]);
  return o;
}

function peaks(env, sr, minGapSec, relThresh) {
  const gap = Math.round(minGapSec * sr / HOP);
  const sorted = [...env].sort((a, b) => a - b), thr = sorted[Math.floor(sorted.length * relThresh)];
  const out = [];
  for (let f = 1; f < env.length - 1; f++) {
    if (env[f] < thr || env[f] < env[f - 1] || env[f] < env[f + 1]) continue;
    if (out.length && f - out[out.length - 1].f < gap) { if (env[f] > out[out.length - 1].s) out[out.length - 1] = { f, s: env[f] }; continue; }
    out.push({ f, s: env[f] });
  }
  return out.map((p) => ({ t: p.f * HOP / sr, s: p.s }));
}

const { y, sr } = readWav(wavPath);
const dur = y.length / sr;
const kickEnv = onsetEnv(bandpass(y, sr, 40, 160));
const snareBody = onsetEnv(bandpass(y, sr, 150, 500)), snareCrack = onsetEnv(bandpass(y, sr, 1000, 3000));
const snareEnv = snareBody.map((v, i) => Math.min(v, snareCrack[i] ?? 0) * 2);
const hatEnv = onsetEnv(bandpass(y, sr, 6000, 10000));
const fullEnv = onsetEnv(y);

// Tempo + phase: joint grid search scored on kick energy at each grid beat (more robust than a
// single autocorrelation peak, which drifted between 129.2 and 130.0 depending on hop size).
const fps = sr / HOP;
const kickAt = (t) => { const f = Math.round(t * fps); return Math.max(kickEnv[f - 1] ?? 0, kickEnv[f] ?? 0, kickEnv[f + 1] ?? 0); };
function scanGrid(bpmLo, bpmHi, step) {
  let best = { bpm: 0, t0: 0, score: -1 };
  for (let bpm = bpmLo; bpm <= bpmHi; bpm += step) {
    const T = 60 / bpm;
    for (let ph = 0; ph < T; ph += 1 / fps) {
      let s = 0; for (let t = ph; t < dur; t += T) s += kickAt(t);
      if (s > best.score) best = { bpm, t0: ph, score: s };
    }
  }
  return best;
}
const coarse = scanGrid(120, 140, 0.02);
const fine = scanGrid(coarse.bpm - 0.05, coarse.bpm + 0.05, 0.001);

// Local-threshold transient finder: strongest envelope frame within ±R of t that stands 3x above the 2 s median.
function localPeak(env, t, Rsec) {
  const c = Math.round(t * fps), R = Math.round(Rsec * fps), W = Math.round(1.0 * fps);
  const win = Array.from(env.slice(Math.max(0, c - W), c + W)).sort((a, b) => a - b);
  const med = win[Math.floor(win.length / 2)] || 1e-9;
  let bf = -1, bv = 0;
  for (let f = c - R; f <= c + R; f++) if ((env[f] ?? 0) > bv) { bv = env[f]; bf = f; }
  return bv > 3 * med ? { t: bf / fps, v: bv } : null;
}

// Least-squares refine t_i = t0 + i*T on kick peaks near the scanned grid, then score per §3.
function fitGrid(T0, ph) {
  const pairs = [];
  for (let i = 0; ph + i * T0 < dur; i++) { const k = localPeak(kickEnv, ph + i * T0, 0.03); if (k) pairs.push([i, k.t]); }
  const n = pairs.length, sx = pairs.reduce((a, p) => a + p[0], 0), sy = pairs.reduce((a, p) => a + p[1], 0);
  const sxx = pairs.reduce((a, p) => a + p[0] * p[0], 0), sxy = pairs.reduce((a, p) => a + p[0] * p[1], 0);
  const T = (n * sxy - sx * sy) / (n * sxx - sx * sx), t0 = (sy - T * sx) / n;
  const resid = pairs.map(([i, t]) => [i, t - (t0 + i * T)]);
  const total = Math.floor((dur - t0) / T) + 1;
  let hit = 0, err = 0, judged = 0;
  for (let i = 0; i < total; i++) {
    const g = t0 + i * T;
    const a = Math.floor(g * sr), z = Math.min(y.length, Math.floor((g + T) * sr)); let s = 0;
    for (let k = a; k < z; k++) s += y[k] * y[k];
    if (Math.sqrt(s / Math.max(1, z - a)) < 0.02) continue; // silence: not judged
    judged++;
    const p = localPeak(fullEnv, g, 0.035); if (p) { hit++; err += Math.abs(p.t - g); }
  }
  const mr = resid.reduce((a, r) => a + r[0], 0) / n, me = resid.reduce((a, r) => a + r[1], 0) / n;
  const slope = resid.reduce((a, r) => a + (r[0] - mr) * (r[1] - me), 0) / resid.reduce((a, r) => a + (r[0] - mr) ** 2, 0);
  return { bpm: 60 / T, T, t0, beats: total, kickOnBeat: n / total, judged, match: hit / judged,
    mean_abs_ms: err / hit * 1000, max_resid_ms: Math.max(...resid.map((r) => Math.abs(r[1]))) * 1000,
    drift_ms_total: slope * total * 1000, first_beat_on_attack: !!localPeak(fullEnv, t0, 0.035) };
}
const base = 60 / fine.bpm;
const candidates = [
  { name: '0.5x', ...fitGrid(base * 2, fine.t0) },
  { name: '1x', ...fitGrid(base, fine.t0) },
  { name: '2x', ...fitGrid(base / 2, fine.t0) },
];
// Per the doc: the right grid puts kicks on whole beats. 2x always "covers" offbeat hats, so require
// match >= 0.98 first, then prefer the highest share of grid beats carrying a kick.
// The local-threshold match saturates at 1.0 for every candidate at this hop, so it cannot pick the
// multiple. Decided by scripts/grid-check.mjs + phase-check*.mjs instead: at 130.00 BPM kick onsets peak at
// phase 0.232 s from the first drum bar to the last (no drift) and hi-hats peak exactly half a beat later
// (0.459 s), the house off-beat pattern. 2x would put every hat on a 'beat'; 0.5x drops half the kicks.
const winner = candidates.find((c) => c.name === '1x');
const best = { bpm: fine.bpm };


const { t0, T } = winner;
const beats = []; for (let i = 0; i < winner.beats; i++) beats.push(+(t0 + i * T).toFixed(5));

// Per-beat RMS (full mix) for the energy structure.
const rms = beats.map((b, i) => {
  const a = Math.floor(b * sr), z = Math.min(y.length, Math.floor((b + T) * sr));
  let s = 0; for (let k = a; k < z; k++) s += y[k] * y[k];
  return +Math.sqrt(s / Math.max(1, z - a)).toFixed(5);
});
const envAt = (env, t) => { const f = Math.round(t * fps); let m = 0; for (let k = f - 2; k <= f + 2; k++) m = Math.max(m, env[k] ?? 0); return m; };
const kickPerBeat = beats.map((b) => envAt(kickEnv, b));

// Sections by 8-beat bars: mean RMS and kick presence.
const sections = [];
for (let i = 0; i + 8 <= beats.length; i += 8) {
  const r = rms.slice(i, i + 8), k = kickPerBeat.slice(i, i + 8);
  sections.push({ beat: i, t: beats[i], rms: +(r.reduce((a, v) => a + v, 0) / 8).toFixed(4), kick: +(k.reduce((a, v) => a + v, 0) / 8).toFixed(3) });
}

const hits = [];
for (const [k, env] of [['kick', kickEnv], ['snare', snareEnv], ['hihat', hatEnv]]) {
  for (const p of peaks(env, sr, 0.1, 0.9)) hits.push({ t: +p.t.toFixed(4), s: +p.s.toFixed(3), k });
}
hits.sort((a, b) => a.t - b.t);

// Strongest whole-beat kicks = slam candidates.
const slamCandidates = kickPerBeat.map((s, n) => ({ n, t: beats[n], s: +s.toFixed(3) })).sort((a, b) => b.s - a.s).slice(0, 20);

fs.writeFileSync(`${outDir}/beat_data.json`, JSON.stringify({ source: wavPath, sr, duration: dur, bpm: winner.bpm, t0, T, beats, hits, rms, kickPerBeat, sections, slamCandidates }, null, 1));
fs.writeFileSync(`${outDir}/grid_drift.json`, JSON.stringify({ autocorrBpm: best.bpm, candidates, winner: winner.name,
  reason: '130.00 BPM: kick onsets at phase 0.232 s in every drum section (grid-check/phase-check), off-beat hats at +T/2; 1x keeps kicks on whole beats' }, null, 1));
console.log(JSON.stringify({ autocorrBpm: +best.bpm.toFixed(2), candidates, winner: winner.name }, null, 1));
console.log('sections (8-beat bars): beat t rms kick');
for (const s of sections) console.log(s.beat, s.t.toFixed(2), s.rms, s.kick);

// Local-threshold coverage (§3 match): a beat counts when the full-mix onset envelope has a local peak
// within ±35 ms that stands 3x above the median of the surrounding 2 s. Quiet beats are reported, not hidden.
{
  const W = Math.round(1.0 * fps), R = Math.round(0.035 * fps);
  let hit = 0, err = 0, judged = 0, silent = 0; const misses = [];
  for (let i = 0; i < beats.length; i++) {
    const c = Math.round(beats[i] * fps);
    if (rms[i] < 0.02) { silent++; continue; }
    judged++;
    const win = Array.from(fullEnv.slice(Math.max(0, c - W), c + W)).sort((a, b) => a - b);
    const med = win[Math.floor(win.length / 2)] || 1e-9;
    let bestF = -1, bestV = 0;
    for (let f = c - R; f <= c + R; f++) if ((fullEnv[f] ?? 0) > bestV) { bestV = fullEnv[f]; bestF = f; }
    if (bestV > 3 * med) { hit++; err += Math.abs(bestF - c) / fps; } else misses.push(i);
  }
  const res = { judged, silent, match: hit / judged, mean_abs_ms: err / hit * 1000, misses: misses.slice(0, 40), missCount: misses.length };
  const gd = JSON.parse(fs.readFileSync(`${outDir}/grid_drift.json`, 'utf8'));
  gd.localCoverage = res; fs.writeFileSync(`${outDir}/grid_drift.json`, JSON.stringify(gd, null, 1));
  console.log('local coverage', JSON.stringify(res));
}
