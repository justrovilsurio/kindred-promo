// Shot 4 · Animal story — card-flip-reveal (demos/transition/card-flip-reveal/CardFlipReveal.tsx).
// Kept: 4f anticipation (−10°) → 16f accelerating flip to 194° (bezier .55,0,.3,1) → spring back to 180°
// (damping 15, stiffness 190), lift on the flip, face shading by |cos θ| plus a narrow edge light that sweeps
// with the angle between 56° and 124°, semantically paired faces (the card → the page it opens), ≥40f still end.
// Adapted: a single card; the back face is the real detail overlay, so the box grows from card size to
// panel size during the flip (ease in-out, so the swap happens near the edge-on moment), the page behind dims
// to the app's own scrim, then a slow push-in onto "Personality" (storyboard).
// Opens on the exact framing shot 3 ends on (Mango centred at zoom 1.6) so the cut is invisible.
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { EASE, bezier, mix, ramp } from '../demos/_fixtures/Polish';
import { springAt } from '../demos/_fixtures/Look';
import L from '../layout.json';
import { K, clamp01 } from '../brand';
import { S3_END_CAM } from './S3Filter';

const CARD = L.adopt.cards[0];
const PANEL = L.detail.panel; // viewport px of the overlay panel at 1920×1080
const PERS = L.detail.personality;
const cam = S3_END_CAM;

const PRE = 4, FLIP = 16, PEAK = 194;
const S0 = 10; // flip starts (after a short breath on the cut)
export const S4_FLIP_AT = S0 + PRE;
export const S4_LAND_AT = S0 + PRE + FLIP;
const flipEase = bezier(0.55, 0, 0.3, 1);
const angleAt = (f: number) => {
  if (f < S0 + PRE) return -10 * ramp(f, S0, PRE, EASE.out);
  if (f < S0 + PRE + FLIP) return mix(-10, PEAK, ramp(f, S0 + PRE, FLIP, flipEase));
  return PEAK - (PEAK - 180) * springAt(f, S0 + PRE + FLIP, { damping: 15, stiffness: 190 });
};

// Screen boxes: the card as shot 3 left it, and the panel at its on-screen size after the flip.
const cardBox = { w: CARD.w * cam.zoom, h: CARD.h * cam.zoom, cx: 960, cy: 540 };
const PSCALE = 1.32;
const panelBox = { w: PANEL.w * PSCALE, h: PANEL.h * PSCALE, cx: 960, cy: 540 };

const FaceLight: React.FC<{ angle: number; strength: number }> = ({ angle, strength }) => {
  const c = Math.abs(Math.cos((angle * Math.PI) / 180));
  const band = Math.max(0, 1 - Math.abs(angle - 90) / 34);
  const pos = mix(-20, 120, clamp01((angle - 56) / 68));
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: (1 - c) * strength }} />
      {band > 0.01 && <div style={{ position: 'absolute', inset: 0, opacity: band * 0.35, background: `linear-gradient(100deg, rgba(255,255,255,0) ${pos - 12}%, rgba(255,255,255,0.9) ${pos}%, rgba(255,255,255,0) ${pos + 12}%)` }} />}
    </>
  );
};

export const S4Story: React.FC = () => {
  const frame = useCurrentFrame();
  const angle = angleAt(frame);
  const lift = Math.max(0, Math.sin((Math.min(180, Math.max(0, angle)) * Math.PI) / 180));
  const grow = ramp(frame, S0 + PRE, FLIP + 4, EASE.smooth);
  const w = mix(cardBox.w, panelBox.w, grow), h = mix(cardBox.h, panelBox.h, grow);
  const scrim = ramp(frame, S0 + 2, 20, EASE.out);
  const outline = 1 - ramp(frame, S0, 6, EASE.out);
  // Push-in on "Personality" after the panel lands.
  const push = ramp(frame, 52, 58, EASE.smooth);
  const px = (PERS.x - PANEL.x + 230) * PSCALE - panelBox.w / 2; // focus point relative to panel centre (screen px)
  const py = (PERS.y - PANEL.y + 60) * PSCALE - panelBox.h / 2;
  const z = mix(1, 1.45, push);

  return (
    <AbsoluteFill style={{ background: K.paper, overflow: 'hidden' }}>
      {/* The filtered page behind, at shot 3's final framing; Mango's baked card is patched out (he is the flyer). */}
      <div style={{ position: 'absolute', width: 1920, height: L.adoptAge.pageH, transform: `translate(${960 - cam.cx * cam.zoom}px, ${540 - cam.cy * cam.zoom}px) scale(${cam.zoom})`, transformOrigin: '0 0' }}>
        <Img src={staticFile('textures/adopt-age.png')} style={{ position: 'absolute', width: 1920, height: L.adoptAge.pageH }} />
        <div style={{ position: 'absolute', left: CARD.x - 20, top: CARD.y - 20, width: CARD.w + 40, height: CARD.h + 40, background: K.paper }} />
      </div>
      <AbsoluteFill style={{ background: 'rgba(13,19,31,0.6)', opacity: scrim }} />

      <AbsoluteFill style={{ transform: `scale(${z.toFixed(4)}) translate(${(-px * push).toFixed(2)}px, ${(-py * push).toFixed(2)}px)`, transformOrigin: '50% 50%' }}>
        <div style={{ position: 'absolute', left: 960 - w / 2, top: 540 - h / 2, width: w, height: h, perspective: 2200 }}>
          {/* iris selection ring carried over from shot 3, released as the flip begins */}
          {outline > 0.01 && <div style={{ position: 'absolute', inset: -6 * cam.zoom, borderRadius: 38 * cam.zoom, border: `${4 * cam.zoom}px solid ${K.iris}`, opacity: outline }} />}
          <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateZ(${(lift * 80).toFixed(2)}px) rotateY(${angle.toFixed(3)}deg)` }}>
            {/* Front: Mango's real card */}
            <div style={{
              position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 32 * cam.zoom, overflow: 'hidden', background: K.surface,
              boxShadow: `0 ${10 + 40 * lift}px ${30 + 60 * lift}px rgba(21,31,48,${0.18 + 0.2 * lift})`,
            }}>
              <Img src={staticFile('textures/adopt-card-0.png')} style={{ position: 'absolute', left: '50%', top: 0, height: '100%', width: 'auto', transform: 'translateX(-50%)' }} />
              <FaceLight angle={angle} strength={0.45} />
            </div>
            {/* Back: his real detail overlay */}
            <div style={{
              position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: 20 * PSCALE, overflow: 'hidden', background: K.surface,
              boxShadow: `0 ${30 + 30 * lift}px ${80 + 40 * lift}px rgba(8,12,20,0.45)`,
            }}>
              <Img src={staticFile('textures/detail-panel.png')} style={{ position: 'absolute', left: 0, top: '50%', width: '100%', height: 'auto', transform: 'translateY(-50%)' }} />
              <FaceLight angle={180 - angle} strength={0.35} />
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
