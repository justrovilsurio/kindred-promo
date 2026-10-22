// Shot 6 · Publish — slam-entrance-moves · impact-burst-kit (demos/effects/slam-entrance-moves/ImpactBurstKit.tsx).
// Kept: hover-and-charge above the landing spot (scale 1.55→1.6, lifted, depth-blurred, contact shadow
// firming up), 6f ease-in-cubic drop, impact frame firing squash + spring, a ring on a white pressure disc
// (expand out-cubic / fade linear, decoupled), 18 debris bits stretched along their path, a 4f 8px screen shake
// (frame-level hit #1, pinned to song beat 74 — the strongest kick), neighbours pushed 3f after impact by the
// wave front with cos(t/2)·e^(−t/8) and a hard clamp at 40f, ≥45f still end.
// Adapted (styleframe f2): the "main card" is the lime LIVE sticker, the page is Juniper's real editor flipping
// Draft → Published on a real Publish click; ring/debris use iris/lime/navy; the headline's second line lands
// with the slam.
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { EASE, SpeedBlur, bezier, mix, ramp } from '../demos/_fixtures/Polish';
import { springAt } from '../demos/_fixtures/Look';
import L from '../layout.json';
import { FONT, K, LiveSticker, clamp01 } from '../brand';
import { HITS, SHOTS } from '../timeline';

export const S6_CLICK = 14;
export const S6_IMPACT = HITS.live - SHOTS.publish.from; // 27
const IMPACT = S6_IMPACT;
const DROP0 = IMPACT - 6;
const HOVER0 = S6_CLICK + 1;
const HIT = IMPACT + 3;
const EASE_IN_CUBIC = bezier(0.55, 0.055, 0.675, 0.19);

// Screen geometry: the editor capture at 0.66 inside a tilted frame (styleframe f2).
const SCR = { x: 700, y: 110, s: 0.66, w: 1920 * 0.66, h: 1000 * 0.66 };
const CALL = { x: 600, y: 726, w: 1240 };
const CALL_S = CALL.w / L.editor.publishing.w;
const BTN = { x: CALL.x + (L.editor.publishBtn.x - L.editor.publishing.x + L.editor.publishBtn.w / 2) * CALL_S, y: CALL.y + (L.editor.publishBtn.y - L.editor.publishing.y + L.editor.publishBtn.h / 2) * CALL_S };
const STK = { cx: 1690, cy: 300, size: 220 };

const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const BITS = Array.from({ length: 18 }, (_, i) => ({
  ang: -Math.PI / 2 + (rnd(i + 1) - 0.5) * Math.PI * 1.75, dist: 220 + rnd(i + 40) * 280, size: 12 + rnd(i + 80) * 16,
  color: [K.lime, K.iris, K.navy][i % 3], spin: (rnd(i + 120) - 0.5) * 720, ratio: 0.35 + rnd(i + 9) * 0.5,
}));
const pushEnv = (f: number) => { const t = f - HIT; return t < 0 || t >= 40 ? 0 : Math.cos(t * 0.5) * Math.exp(-t / 8); };

export const S6Publish: React.FC = () => {
  const frame = useCurrentFrame();
  const live = frame > S6_CLICK;
  const swap = ramp(frame, S6_CLICK + 1, 3, EASE.out);

  // Sticker: hover/charge → drop → squash + spring
  const wind = ramp(frame, HOVER0, DROP0 - HOVER0, EASE.smooth);
  const drop = ramp(frame, DROP0, 6, EASE_IN_CUBIC);
  const mScale = mix(1.55 + 0.05 * wind, 1, drop);
  const mDy = mix(-110 - 20 * wind, 0, drop);
  const lift = clamp01((mScale - 1) / 0.6);
  const squash = frame < IMPACT ? 0 : frame < IMPACT + 3 ? ramp(frame, IMPACT, 3, EASE.out) : 1 - springAt(frame, IMPACT + 3, { damping: 12, stiffness: 320 });
  const sOp = ramp(frame, HOVER0, 5, EASE.out);

  const ringP = ramp(frame, IMPACT, 16, EASE.snappy), ringLin = ramp(frame, IMPACT, 16, EASE.linear);
  const ringOn = frame >= IMPACT && frame < IMPACT + 16;
  const ringR = mix(100, 1000, ringP);
  const pT = ramp(frame, IMPACT, 22, EASE.out), pLin = ramp(frame, IMPACT, 22, EASE.linear);
  const pOn = frame >= IMPACT && frame < IMPACT + 22;
  const env = pushEnv(frame);
  const envV = pushEnv(frame + 0.5) - pushEnv(frame - 0.5);

  let shakeX = 0, shakeY = 0;
  if (frame >= IMPACT && frame < IMPACT + 4) {
    const amp = 8 * (1 - (frame - IMPACT) / 4);
    shakeX = (rnd(frame * 3.7) - 0.5) * 2 * amp;
    shakeY = (frame === IMPACT ? 1 : (rnd(frame * 7.1 + 13) - 0.5) * 2) * amp;
  }

  const ptrT = ramp(frame, 0, S6_CLICK - 3, EASE.swift);
  const ptr = { x: mix(BTN.x - 380, BTN.x, ptrT), y: mix(BTN.y - 120, BTN.y, ptrT) + Math.sin(ptrT * Math.PI) * 30 };
  const ptrO = 1 - ramp(frame, S6_CLICK + 6, 6, EASE.out);
  const ptrPress = frame >= S6_CLICK - 1 && frame <= S6_CLICK + 4 ? 0.86 : 1;
  const line2 = ramp(frame, IMPACT, 9, bezier(0.2, 0.75, 0.3, 1));
  const sub = ramp(frame, IMPACT + 12, 14, EASE.out);

  return (
    <AbsoluteFill style={{ background: K.paper, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${shakeX.toFixed(2)}px, ${shakeY.toFixed(2)}px)` }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 720, background: K.peri }} />
        <div style={{ position: 'absolute', left: 96, top: 270, fontFamily: FONT.display, fontSize: 150, lineHeight: 0.98, color: K.navy }}>
          <div>One tap.</div>
          <div style={{ opacity: line2, transform: `scale(${1.28 - 0.28 * line2})`, transformOrigin: '0% 60%', filter: `blur(${((1 - line2) * 7).toFixed(2)}px)` }}>It&apos;s live.</div>
        </div>
        <div style={{ position: 'absolute', left: 100, top: 640, width: 540, fontFamily: FONT.text, fontSize: 34, lineHeight: 1.4, color: K.navy, opacity: sub, transform: `translateY(${((1 - sub) * 12).toFixed(2)}px)` }}>
          New animals start as private drafts. Publish when the story&apos;s ready.
        </div>

        {/* The editor screen (neighbour: nudged away from the impact) */}
        <SpeedBlur vx={-20 * envV} vy={10 * envV} amount={0.2} max={6}>
          <div style={{ position: 'absolute', left: SCR.x, top: SCR.y, width: SCR.w, height: SCR.h, perspective: 2400, transform: `translate(${(-18 * env).toFixed(2)}px, ${(10 * env).toFixed(2)}px) rotate(${(-1.2 * env).toFixed(3)}deg)` }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', boxShadow: K.shadowFloat, transform: 'rotateY(-9deg) rotateX(3deg)', transformOrigin: '0 50%', background: K.paper }}>
              <Img src={staticFile('textures/editor-draft.png')} style={{ position: 'absolute', width: 1920 * SCR.s, height: 1080 * SCR.s }} />
              <Img src={staticFile('textures/editor-live.png')} style={{ position: 'absolute', width: 1920 * SCR.s, height: 1080 * SCR.s, opacity: live ? swap : 0 }} />
            </div>
          </div>
        </SpeedBlur>

        {/* Publishing bar callout, enlarged (neighbour) */}
        <SpeedBlur vx={0} vy={24 * envV} amount={0.2} max={6}>
          <div style={{ position: 'absolute', left: CALL.x, top: CALL.y, width: CALL.w, borderRadius: 26, overflow: 'hidden', boxShadow: '0 40px 90px rgba(21,31,48,0.3), 0 2px 8px rgba(21,31,48,0.1)', transform: `translateY(${(24 * env).toFixed(2)}px) rotate(${(0.8 * env).toFixed(3)}deg)` }}>
            <Img src={staticFile('textures/pubbar-draft.png')} style={{ display: 'block', width: '100%' }} />
            <Img src={staticFile('textures/pubbar-live.png')} style={{ position: 'absolute', left: 0, top: 0, width: '100%', opacity: live ? swap : 0 }} />
          </div>
        </SpeedBlur>

        {/* Click ripple on Publish */}
        {[0, 1].map((r) => {
          const st = S6_CLICK + r * 3;
          if (frame < st || frame > st + 10) return null;
          const t = ramp(frame, st, 10, EASE.out);
          const rad = 16 + t * (r === 0 ? 46 : 70);
          return <div key={r} style={{ position: 'absolute', left: BTN.x - rad, top: BTN.y - rad, width: rad * 2, height: rad * 2, borderRadius: '50%', border: `${r === 0 ? 3 : 2}px solid ${r === 0 ? K.iris : K.lime}`, opacity: 1 - t }} />;
        })}

        {/* Contact shadow firming up under the sticker */}
        <div style={{
          position: 'absolute', left: STK.cx - STK.size * 0.6, top: STK.cy + STK.size * 0.28, width: STK.size * 1.2, height: STK.size * 0.4, borderRadius: '50%',
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(21,31,48,0.3), rgba(21,31,48,0) 70%)',
          opacity: frame < IMPACT ? mix(0.2, 1, drop) * sOp : 1 - ramp(frame, IMPACT, 6, EASE.out), transform: `scale(${mix(1.5, 1, drop).toFixed(3)})`,
        }} />

        {ringOn && <div style={{ position: 'absolute', left: STK.cx - ringR * 0.9, top: STK.cy - ringR * 0.9, width: ringR * 1.8, height: ringR * 1.8, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,255,255,0) 40%, rgba(255,255,255,${(0.55 * (1 - ringLin)).toFixed(3)}) 68%, rgba(255,255,255,0) 72%)` }} />}

        <div style={{
          position: 'absolute', left: STK.cx - STK.size / 2, top: STK.cy - STK.size / 2 + mDy, width: STK.size, height: STK.size, opacity: sOp,
          transform: `rotate(10deg) scale(${(mScale * (1 + 0.06 * squash)).toFixed(4)}, ${(mScale * (1 - 0.085 * squash)).toFixed(4)})`, transformOrigin: '50% 90%',
          filter: lift * 7 > 0.4 ? `blur(${(lift * 7).toFixed(2)}px)` : undefined,
        }}>
          <LiveSticker size={STK.size} />
        </div>

        {pOn && BITS.map((b, i) => {
          const sp = Math.pow(1 - pT, 2 / 3);
          const px = STK.cx + Math.cos(b.ang) * (120 + b.dist * pT);
          const py = STK.cy + Math.sin(b.ang) * (120 + b.dist * pT) * 0.85 + 120 * pLin * pLin;
          const s = b.size * (1 - 0.6 * pLin);
          return (
            <div key={i} style={{ position: 'absolute', left: px - s / 2, top: py - (s * b.ratio) / 2, width: s, height: s * b.ratio, transform: `rotate(${((b.ang * 180) / Math.PI).toFixed(1)}deg) scaleX(${(1 + Math.min(1.6, sp * 1.6)).toFixed(3)})`, opacity: pLin < 0.65 ? 1 : 1 - (pLin - 0.65) / 0.35 }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 2, background: b.color, transform: `rotate(${(b.spin * pT).toFixed(1)}deg)` }} />
            </div>
          );
        })}

        {ringOn && <div style={{
          position: 'absolute', left: STK.cx - ringR, top: STK.cy - ringR, width: ringR * 2, height: ringR * 2, borderRadius: '50%', boxSizing: 'border-box', opacity: mix(0.95, 0, ringLin),
          border: `${mix(10, 1.5, ringP).toFixed(2)}px solid rgba(141,146,253,0.9)`, boxShadow: `0 0 ${(18 + ringP * 30).toFixed(0)}px rgba(141,146,253,0.35)`,
        }} />}

        {ptrO > 0.01 && (
          <svg width={28} height={28} viewBox="0 0 28 28" style={{ position: 'absolute', left: ptr.x - 2, top: ptr.y - 1, opacity: ptrO, overflow: 'visible', transformOrigin: '2px 1px', transform: `scale(${1.7 * ptrPress})`, filter: 'drop-shadow(0 3px 5px rgba(20,14,8,0.25))' }}>
            <path d="M2 1 L2 23 L8 17.5 L11.5 25 L15.5 23.2 L12 15.8 L20 15 Z" fill={K.navy} stroke="#ffffff" strokeWidth={1.6} strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </AbsoluteFill>
  );
};
