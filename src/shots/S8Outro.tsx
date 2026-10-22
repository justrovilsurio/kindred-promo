// Shot 8 · Closing — outro-group-photo-launch (demos/outro/outro-group-photo-launch/OutroGroupPhotoLaunch.tsx),
// on styleframe f3's navy. Kept: one representative element per feature shot flying in from all sides
// (cue every 3f, 12f flights, bezier .34,1.4,.44,1 true overshoot, rot×2 → settled, ×1.12 → 1, directional
// speed blur, a 1.5% landing press with the contact shadow tightening), later arrivals on top, the cast receding
// (−12% opacity, −8% saturation) as the wordmark arrives, a crane-in (rotateX 4°→0, scale 1.06→1) easing into a
// slow push, one light sweep, a stage light behind the wordmark, deterministic dust + foreground bokeh,
// letterpress wordmark, rule with extension lines, tagline, sign-off hold ≥1 s, fade to the base colour.
// Adapted: everything starts 12f later so nothing moves under the push seam; the wordmark (cat logo + Anton
// "Kindred") stamps on frame-level hit #2 (song beat 98); dust is lime/periwinkle instead of gold.
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { EASE, SpeedBlur, ramp, velocity } from '../demos/_fixtures/Polish';
import { CatLogo, FONT, K, LiveSticker } from '../brand';
import { HITS, SHOTS } from '../timeline';

export const S8_STAMP = HITS.wordmark - SHOTS.outro.from; // 56
const STAMP = S8_STAMP;
const OFF = 12;
const DUR = SHOTS.outro.dur;
const FLY_EASE = Easing.bezier(0.34, 1.4, 0.44, 1);
const CRANE_EASE = Easing.bezier(0.3, 0, 0.2, 1);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

type El = { key: string; w: number; h: number; cx: number; cy: number; scale: number; rot: number; dx: number; dy: number; radius: number; cue: number; file?: string; sticker?: boolean };
const C = { w: 275, h: 431 };
const ELS: El[] = [
  { key: 'mango', file: 'textures/adopt-card-0.png', ...C, cx: 150, cy: 150, scale: 0.9, rot: -12, dx: -520, dy: -60, radius: 32, cue: OFF + 0 },
  { key: 'saffron', file: 'textures/adopt-card-2.png', ...C, cx: 1770, cy: 140, scale: 0.85, rot: 11, dx: 520, dy: -80, radius: 32, cue: OFF + 3 },
  { key: 'team', file: 'textures/team-section.png', w: 1920, h: 852, cx: 1300, cy: 160, scale: 0.21, rot: 4, dx: 260, dy: -420, radius: 6, cue: OFF + 6 },
  { key: 'atlas', file: 'textures/adopt-card-4.png', ...C, cx: 110, cy: 830, scale: 0.85, rot: 6, dx: -520, dy: 160, radius: 32, cue: OFF + 9 },
  { key: 'juniper', file: 'textures/card-full.png', w: 220, h: 275, cx: 600, cy: 150, scale: 0.9, rot: -7, dx: -160, dy: -420, radius: 30, cue: OFF + 12 },
  { key: 'tala', file: 'textures/adopt-card-5.png', ...C, cx: 1810, cy: 800, scale: 0.85, rot: -13, dx: 520, dy: 140, radius: 32, cue: OFF + 15 },
  { key: 'kiko', file: 'textures/adopt-card-1.png', ...C, cx: 470, cy: 960, scale: 0.78, rot: 8, dx: -120, dy: 420, radius: 32, cue: OFF + 18 },
  { key: 'bruno', file: 'textures/adopt-card-3.png', ...C, cx: 1450, cy: 960, scale: 0.78, rot: -8, dx: 120, dy: 420, radius: 32, cue: OFF + 21 },
  { key: 'dogs', file: 'textures/chip-dogs-on.png', w: 67, h: 42, cx: 330, cy: 560, scale: 2.1, rot: -9, dx: -420, dy: 0, radius: 21, cue: OFF + 24 },
  { key: 'live', w: 170, h: 170, cx: 1640, cy: 520, scale: 1, rot: 10, dx: 420, dy: 0, radius: 85, cue: OFF + 27, sticker: true },
];

const DUST = Array.from({ length: 20 }, (_, i) => ({
  x: (i * 439 + 137) % 1920, y0: (i * 613 + 271) % 1080, rise: 0.3 + (i % 5) * 0.11, swayAmp: 9 + (i % 4) * 5,
  swayFreq: 0.022 + (i % 3) * 0.008, phase: (i * 0.83) % (Math.PI * 2), size: 2.4 + (i % 3) * 0.9, opacity: 0.35 + ((i * 7) % 5) * 0.09, lime: i % 2 === 0,
}));
const BOKEH = Array.from({ length: 6 }, (_, i) => ({ x: (i * 701 + 260) % 1920, y0: (i * 389 + 640) % 1080, rise: 0.55 + (i % 3) * 0.2, size: 14 + (i % 3) * 7, opacity: 0.1 + (i % 2) * 0.06 }));
const LETTERS = 'Kindred'.split('');

export const S8Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const craneT = interpolate(frame, [OFF, OFF + 40], [0, 1], { ...clamp, easing: CRANE_EASE });
  const pushT = ramp(frame, OFF + 36, DUR - OFF - 36, EASE.smooth);
  const camScale = 1.06 - 0.06 * craneT + 0.035 * pushT;
  const camTilt = 4 * (1 - craneT);
  const recede = interpolate(frame, [STAMP - 6, STAMP + 2], [0, 1], clamp);
  const sweepX = interpolate(frame, [OFF + 2, OFF + 14], [-700, 2020], { ...clamp, easing: Easing.bezier(0.4, 0, 0.6, 1) });
  const sweepO = interpolate(frame, [OFF + 2, OFF + 5, OFF + 11, OFF + 14], [0, 0.14, 0.14, 0], clamp);
  const stage = interpolate(frame, [STAMP - 6, STAMP + 2, STAMP + 10], [0, 0.6, 0.38], clamp);
  const logoT = interpolate(frame, [STAMP - 4, STAMP + 2], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.75, 0.3, 1) });
  const rule = interpolate(frame, [STAMP + 4, STAMP + 16], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1) });
  const ruleExt = interpolate(frame, [STAMP + 4, STAMP + 12], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1) });
  const ruleExtFade = interpolate(frame, [STAMP + 12, STAMP + 18], [1, 0], clamp);
  const tag = ramp(frame, STAMP + 14, 12, EASE.out);
  const fadeOut = 1 - ramp(frame, DUR - 12, 11, EASE.exit);

  return (
    <AbsoluteFill style={{ background: K.navy, overflow: 'hidden' }}>
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <AbsoluteFill style={{ background: `radial-gradient(1200px 800px at 50% 46%, ${'rgba(42,53,80,0.9)'}, rgba(21,31,48,0) 70%)` }} />
        <AbsoluteFill style={{ transform: `perspective(1400px) rotateX(${camTilt}deg) scale(${camScale})`, transformOrigin: '50% 45%' }}>
          {ELS.map((el) => {
            if (frame < el.cue) return null;
            const posAt = (fr: number) => { const tt = interpolate(fr, [el.cue, el.cue + 12], [0, 1], { ...clamp, easing: FLY_EASE }); return [el.dx * (1 - tt), el.dy * (1 - tt)]; };
            const t = interpolate(frame, [el.cue, el.cue + 12], [0, 1], { ...clamp, easing: FLY_EASE });
            const [x, y] = posAt(frame);
            const vx = velocity((fr) => posAt(fr)[0], frame), vy = velocity((fr) => posAt(fr)[1], frame);
            const op = interpolate(frame, [el.cue, el.cue + 3], [0, 1], clamp) * (1 - 0.12 * recede);
            const land = interpolate(frame, [el.cue + 9, el.cue + 12, el.cue + 16], [0, 1, 0], clamp);
            const air = Math.max(0, 1 - t);
            const shadow = `0 ${10 + 26 * air - 5 * land}px ${24 + 46 * air - 12 * land}px rgba(0,0,0,${0.3 + 0.12 * air + 0.06 * land}), 0 2px 6px rgba(0,0,0,0.18)`;
            const tf = `translate(${x}px, ${y}px) rotate(${el.rot * (2 - t)}deg) scale(${el.scale * (1.12 - 0.12 * t) * (1 - 0.015 * land)})`;
            return (
              <SpeedBlur key={el.key} vx={vx} vy={vy} amount={0.3} max={22}>
                {el.sticker ? (
                  <div style={{ position: 'absolute', left: el.cx - el.w / 2, top: el.cy - el.h / 2, width: el.w, height: el.h, transform: tf, opacity: op, filter: `saturate(${1 - 0.08 * recede})` }}>
                    <LiveSticker size={el.w} />
                  </div>
                ) : (
                  <div style={{ position: 'absolute', left: el.cx - el.w / 2, top: el.cy - el.h / 2, width: el.w, height: el.h, transform: tf, borderRadius: el.radius / el.scale, overflow: 'hidden', boxShadow: shadow, opacity: op, filter: `saturate(${1 - 0.08 * recede})` }}>
                    <Img src={staticFile(el.file!)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                  </div>
                )}
              </SpeedBlur>
            );
          })}
        </AbsoluteFill>

        {/* lime / periwinkle dust + foreground bokeh */}
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          {DUST.map((d, i) => {
            const y = (((d.y0 - frame * d.rise) % 1080) + 1080) % 1080;
            const x = d.x + Math.sin(frame * d.swayFreq + d.phase) * d.swayAmp;
            const c = d.lime ? K.lime : K.peri;
            return <div key={i} style={{ position: 'absolute', left: x, top: y, width: d.size, height: d.size, borderRadius: '50%', background: c, opacity: d.opacity * (0.7 + 0.3 * Math.sin(frame * 0.21 + d.phase * 3)), boxShadow: `0 0 ${d.size * 2.5}px ${d.size * 0.6}px ${c}88` }} />;
          })}
          {BOKEH.map((b, i) => {
            const y = (((b.y0 - frame * b.rise) % 1180) + 1180) % 1180 - 50;
            return <div key={`b${i}`} style={{ position: 'absolute', left: b.x, top: y, width: b.size, height: b.size, borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,231,255,0.9) 0%, rgba(230,231,255,0.35) 55%, rgba(230,231,255,0) 72%)', opacity: b.opacity, filter: 'blur(2px)' }} />;
          })}
        </AbsoluteFill>

        {sweepO > 0 && (
          <AbsoluteFill style={{ mixBlendMode: 'screen' }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: sweepX - 300, width: 600, background: 'linear-gradient(90deg, rgba(230,231,255,0), rgba(230,231,255,1) 50%, rgba(230,231,255,0))', opacity: sweepO }} />
          </AbsoluteFill>
        )}
        {stage > 0 && <AbsoluteFill style={{ background: 'radial-gradient(760px 380px at 960px 470px, rgba(192,196,254,0.55), rgba(192,196,254,0.18) 55%, rgba(192,196,254,0) 75%)', opacity: stage }} />}

        {/* Wordmark: cat logo + Anton "Kindred", letterpress; stamps on hit #2 */}
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', transform: 'translateY(-40px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.display, fontSize: 260, lineHeight: 1, color: K.paper, textShadow: '0 18px 40px rgba(0,0,0,0.35)' }}>
              <div style={{ marginRight: 44, opacity: logoT, transform: `translateY(${(1 - logoT) * 28}px) scale(${1.35 - 0.35 * logoT})`, filter: logoT < 0.995 ? `blur(${(1 - logoT) * 8}px)` : undefined }}>
                <CatLogo size={200} ring={10} />
              </div>
              {LETTERS.map((ch, i) => {
                const d = STAMP - 8 + i * 1.2;
                const t = interpolate(frame, [d, d + 8], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.75, 0.3, 1) });
                return <span key={i} style={{ display: 'inline-block', opacity: t, transform: `translateY(${(1 - t) * 28}px) scale(${1.35 - 0.35 * t})`, filter: `blur(${((1 - t) * 8).toFixed(2)}px)` }}>{ch}</span>;
              })}
            </div>
            <div style={{ position: 'relative', height: 6, width: 280, margin: '36px auto 0' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 3, background: K.lime, transform: `scaleX(${rule})` }} />
              {ruleExt > 0 && ruleExtFade > 0 && (
                <>
                  <div style={{ position: 'absolute', top: 2.5, height: 1, right: '100%', width: 200 * ruleExt, background: K.lime, opacity: ruleExtFade }} />
                  <div style={{ position: 'absolute', top: 2.5, height: 1, left: '100%', width: 200 * ruleExt, background: K.lime, opacity: ruleExtFade }} />
                </>
              )}
            </div>
            <div style={{ fontFamily: FONT.text, fontSize: 48, color: K.peri, marginTop: 30, opacity: tag, transform: `translateY(${(1 - tag) * 8}px)` }}>Pages for animal rescues.</div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
