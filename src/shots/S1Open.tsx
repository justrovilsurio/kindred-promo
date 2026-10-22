// Shot 1 · Opening — type-entrance-moves · letter-drop-physics (demos/typography/type-entrance-moves/LetterDropPhysics.tsx),
// re-skinned to styleframe f1: lime field, Anton headline, blob photo + partner blob, cat-logo sticker, heart/bone doodles.
// Kept from the demo: gravity drop y = −D + D(t/24)², two decaying bounces (30% / 9%), squash/stretch with
// volume preservation, ±6° landing tilt, contact shadows, one collective snap-upright beat (2f inhale + 6f ease-out).
// Adapted: 22 glyphs over two lines, so the staggered starts are compressed into 4→34f (still ever-denser, R2);
// the snap moves to f86 so the blob/sticker beat and a ≥1 s hold fit the 138f shot.
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { EASE, Grain, SpeedBlur, mix, ramp } from '../demos/_fixtures/Polish';
import { Bone, CatLogo, FONT, HERO_BLOB, Heart, K, Paw, Sticker, clamp01 } from '../brand';

const h = (n: number) => { const s = Math.sin(n * 127.3) * 43758.5453; return s - Math.floor(s); };

const LINES = ['Every rescue', 'has a story.'];
const SIZE = 172;
const LINE_H = SIZE * 0.94;
const TOP = 250;
const LEFT = 96;
const DROP = 760;
const T_FALL = 24, T_B1 = 16, T_B2 = 8;
const SNAP = 86, SNAP_DUR = 6;
const PAD = 160;

const GLYPHS = LINES.flatMap((line, li) => Array.from(line).map((ch, ci) => ({ ch, li, ci }))).filter((g) => g.ch !== ' ');
const N = GLYPHS.length;
const startOf = (i: number) => 4 + 30 * (1 - Math.pow(1 - i / (N - 1), 1.5));

const dropY = (t: number): number => {
  if (t <= 0) return -DROP;
  if (t < T_FALL) return -DROP + DROP * (t / T_FALL) ** 2;
  if (t < T_FALL + T_B1) { const u = (t - T_FALL) / T_B1; return -DROP * 0.3 * 4 * u * (1 - u); }
  if (t < T_FALL + T_B1 + T_B2) { const u = (t - T_FALL - T_B1) / T_B2; return -DROP * 0.09 * 4 * u * (1 - u); }
  return 0;
};
const IMPACTS: [number, number][] = [[T_FALL, 1], [T_FALL + T_B1, 0.45], [T_FALL + T_B1 + T_B2, 0.18]];
const squashAt = (t: number) => {
  let s = 0;
  for (const [t0, k] of IMPACTS) { const d = t - t0; if (d >= 0 && d <= 16) s += k * Math.exp(-d / 2.6) * Math.cos(d * 0.85); }
  return s;
};

// Frames when each glyph first touches down (for the SFX table).
export const S1_LANDINGS = GLYPHS.map((_, i) => Math.round(startOf(i) + T_FALL));
export const S1_BLOB_AT = 54;
export const S1_STICKER_AT = 70;

const Glyph: React.FC<{ ch: string; i: number; frame: number; pulse: number; snapRot: number }> = ({ ch, i, frame, pulse, snapRot }) => {
  const t = frame - startOf(i);
  const y = dropY(t);
  const vy = dropY(t + 0.5) - dropY(t - 0.5);
  const tilt = (h(i + 1) - 0.5) * 12;
  const rot = tilt * EASE.out(clamp01((t - T_FALL) / 6)) * (1 - snapRot);
  const jitter = -Math.sin((Math.abs(rot) * Math.PI) / 180) * 40;
  const stretch = Math.min(1, Math.abs(vy) / 60) * 0.1 * (t < T_FALL ? 1 : 0.6);
  const sq = squashAt(t);
  const sy = (1 + stretch) * (1 - 0.2 * sq) + pulse;
  const sx = (1 - stretch * 0.55) * (1 + 0.15 * sq) + pulse;
  const lift = clamp01(-y / 420);
  const shOp = (t < 0 ? 0 : 0.22) * (1 - lift * 0.85) * clamp01((t + 2) / 8);
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{ visibility: 'hidden' }}>{ch}</span>
      <div style={{
        position: 'absolute', left: '50%', top: LINE_H * 0.86, width: '80%', height: 12, borderRadius: '50%', background: K.navy,
        transform: `translateX(-50%) scaleX(${mix(0.74, 1.3, lift).toFixed(3)})`, opacity: shOp, filter: `blur(${mix(6, 24, lift).toFixed(1)}px)`,
      }} />
      <div style={{ position: 'absolute', left: -PAD, right: -PAD, top: -PAD, bottom: -PAD, transform: `translateY(${(y + jitter).toFixed(2)}px)` }}>
        <SpeedBlur vx={0} vy={vy} amount={t < T_FALL ? 0.26 : 0.12} max={16}>
          <div style={{
            position: 'absolute', left: PAD, right: PAD, top: PAD, bottom: PAD, textAlign: 'center',
            transform: `rotate(${rot.toFixed(3)}deg) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`, transformOrigin: '50% 86%',
          }}>{ch}</div>
        </SpeedBlur>
      </div>
    </span>
  );
};

export const S1Open: React.FC = () => {
  const frame = useCurrentFrame();
  const inhale = ramp(frame, SNAP - 2, 2, EASE.out);
  const snap = ramp(frame, SNAP, SNAP_DUR, EASE.snappy);
  const snapRot = ramp(frame, SNAP, SNAP_DUR + 2, EASE.overshoot);
  const pulse = 0.06 * inhale * (1 - snap);

  // Hero art: the app's own kd-blob / kd-back / kd-pop keyframes, retimed to frames.
  const pic = ramp(frame, S1_BLOB_AT, 24, EASE.out);
  const back = ramp(frame, S1_BLOB_AT + 2, 30, EASE.out);
  const pop = ramp(frame, S1_STICKER_AT, 15, EASE.overshoot);
  const doodle = ramp(frame, S1_BLOB_AT + 10, 18, EASE.out);
  const float = (s: number, d: number) => Math.sin(((frame - S1_BLOB_AT) / (s * 30)) * Math.PI * 2 + d) * 8 * doodle;
  const sub = ramp(frame, SNAP + 8, 18, EASE.out);
  const chip = ramp(frame, SNAP + 14, 16, EASE.out);
  const mark = ramp(frame, 0, 14, EASE.out);

  let gi = 0;
  return (
    <AbsoluteFill style={{ background: K.lime, overflow: 'hidden' }}>
      {/* soft key light so the lime is not dead flat */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 70% at 30% 20%, rgba(255,255,255,0.22), rgba(255,255,255,0) 70%)' }} />

      <div style={{ position: 'absolute', left: 96, top: 66, display: 'flex', alignItems: 'center', gap: 18, opacity: mark, fontFamily: FONT.display, fontSize: 44, color: K.navy }}>
        <CatLogo size={64} ring={4} style={{ boxShadow: `0 0 0 4px ${K.navy}` }} />
        Kindred
      </div>

      {/* Hero art (styleframe f1 geometry: 790px box, right 60, top 150) */}
      <div style={{ position: 'absolute', left: 1920 - 60 - 790, top: 150, width: 790, height: 790 }}>
        <svg viewBox="0 0 400 400" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', filter: 'drop-shadow(0 34px 40px rgba(21,31,48,0.22))' }}>
          <defs><clipPath id="s1blob"><path d={HERO_BLOB} /></clipPath></defs>
          <path d={HERO_BLOB} fill={K.peri} opacity={back} style={{
            transformBox: 'fill-box', transformOrigin: '50% 52%',
            transform: `translate(${14 * back}px, ${10 * back}px) rotate(${-11 * back}deg) scale(${mix(0.96, 1.03, back)})`,
          }} />
          <g clipPath="url(#s1blob)" opacity={pic} style={{ transformBox: 'fill-box', transformOrigin: '50% 55%', transform: `scale(${mix(0.92, 1, pic)}) rotate(${mix(-6, 0, pic)}deg)` }}>
            <rect width="400" height="400" fill={K.lime} />
            <image href={staticFile('photos/pippa-corgi.webp')} width="400" height="400" preserveAspectRatio="xMidYMid slice" />
          </g>
        </svg>
        <Heart width={92} color={K.peri} style={{ position: 'absolute', right: 110, top: -6, opacity: doodle, transform: `translateY(${float(5, 0) - 20 * (1 - doodle)}px) rotate(-14deg)` }} />
        <Heart width={50} color={K.peri} style={{ position: 'absolute', right: 40, top: -56, opacity: doodle, transform: `translateY(${float(6, 1) - 20 * (1 - doodle)}px) rotate(12deg)` }} />
        <Bone width={220} color={K.navy} style={{ position: 'absolute', right: -14, bottom: 120, opacity: doodle, transform: `rotate(${-28 + 8 * (1 - doodle)}deg)` }} />
        <Sticker size={164} bg={K.navy} style={{ position: 'absolute', left: 14, top: 545, opacity: clamp01(pop * 3), transform: `rotate(-8deg) scale(${mix(0.85, 1, pop)})` }}>
          <Paw size={92} color={K.lime} />
        </Sticker>
      </div>

      {/* Headline: two lines of dropping glyphs; slots by natural text flow, motion by transform only */}
      <div style={{ position: 'absolute', left: LEFT, top: TOP, fontFamily: FONT.display, fontSize: SIZE, lineHeight: `${LINE_H}px`, color: K.navy, letterSpacing: '-0.005em' }}>
        {LINES.map((line, li) => (
          <div key={li} style={{ whiteSpace: 'pre', height: LINE_H }}>
            {Array.from(line).map((ch, ci) => (ch === ' ' ? <span key={ci}> </span> : <Glyph key={ci} ch={ch} i={gi++} frame={frame} pulse={pulse} snapRot={snapRot} />))}
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', left: 100, top: 690, width: 780, fontFamily: FONT.text, fontSize: 38, lineHeight: 1.35, color: K.navy, opacity: sub, transform: `translateY(${((1 - sub) * 16).toFixed(2)}px)` }}>
        Give it a page as good as the animal. Built for rescue groups, run by volunteers.
      </div>
      <div style={{
        position: 'absolute', left: 100, top: 840, display: 'inline-flex', alignItems: 'center', gap: 12, padding: '18px 30px', borderRadius: 999,
        background: K.navy, color: K.lime, fontFamily: FONT.text, fontSize: 30, opacity: chip, transform: `translateY(${((1 - chip) * 16).toFixed(2)}px)`,
      }}>
        <Paw size={30} color={K.lime} />Second Wind Rescue · Quezon City
      </div>
      <Grain opacity={0.04} />
    </AbsoluteFill>
  );
};
