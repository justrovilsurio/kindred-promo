// Shot 2 · Animal gallery — deck-deal-flyin (demos/ui-entrance/deck-deal-flyin/DeckDealFlyin.tsx).
// Kept: physical card pile with 3px layer height and deterministic jitter, orbit close-up on monotone Hermite
// camera splines, a paragraph-level anticipation beat (pile −48px, top card pulled back 30px), hard-accelerating
// deal, 8f dive with z-arc + 4f overshoot settle (y1>1) + 2f press, ghost trails, lagged shadow settle,
// the light opening from the pile across the dark board, dark table framing kept to the last frame.
// Adapted (spec §4/§5): Kindred has 7 real adoption cards — no duplicated "extras" (a second Mango would read
// as a bug), so the deal accelerates harder over 7 cards (cue = D + 6k − 0.45k(k−1)) and the camera settles on a
// gentle overhead of the whole For Adoption page instead of the 26-card runway. Table material = brand navy
// (the dark/light contrast the card insists on, in Kindred's own colour). First 12f stay still under the push seam.
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { EASE, ramp } from '../demos/_fixtures/Polish';
import L from '../layout.json';
import { FONT, K, clamp01 } from '../brand';

const cards = L.adopt.cards.map((c, i) => ({ ...c, file: `textures/adopt-card-${i}.png` }));
const PAGE_H = L.adopt.pageH;
const BOARD = { x: 330, w: 1260, h: 1400 };
const CARD_W = cards[0].w;
const CARD_H = cards[0].h;
const PILE = { x: 1660, y: 470 };
const PILE_CX = PILE.x + CARD_W / 2;
const PILE_CY = PILE.y + CARD_H / 2;
const N = cards.length;
const STACK_STEP = 3;
const DEAL_START = 52;
const ANTICIPATE = { from: 42, to: 52, pileDown: 48, topPull: 30 };
const HOVER_H = 40;
const SETTLE_EASE = Easing.bezier(0.3, 0, 0.25, 1.15);
const DIVE_EASE = Easing.bezier(0.3, 0, 0.2, 1);

const grid = cards.map((c, k) => ({
  ...c,
  cue: DEAL_START + 6 * k - 0.45 * k * (k - 1),
  px: PILE.x + (((k * 7) % 9) - 4) * 2,
  py: PILE.y + (((k * 5) % 7) - 3) * 2,
  protZ: ((k * 11) % 7) - 3,
  pz: (N - k) * STACK_STEP,
}));
export const S2_DEAL_CUES = grid.map((c) => Math.round(c.cue));

type Cam = { cx: number; cy: number; zoom: number; rotX: number; rotY: number; rotZ: number; persp: number; sx: number };
const ANCHORS: (Cam & { frame: number })[] = [
  { frame: 0, cx: PILE_CX - 30, cy: PILE_CY + 50, zoom: 1.7, rotX: 48, rotY: -30, rotZ: 9, persp: 1100, sx: 0 },
  { frame: 12, cx: PILE_CX - 30, cy: PILE_CY + 50, zoom: 1.7, rotX: 48, rotY: -30, rotZ: 9, persp: 1100, sx: 0 },
  { frame: 44, cx: PILE_CX + 20, cy: PILE_CY + 30, zoom: 1.6, rotX: 42, rotY: 24, rotZ: -6, persp: 1100, sx: 0 },
  { frame: 72, cx: 1040, cy: 720, zoom: 0.86, rotX: 22, rotY: 0, rotZ: 2, persp: 1700, sx: 120 },
  { frame: 100, cx: 960, cy: 860, zoom: 0.76, rotX: 32, rotY: -4, rotZ: -7, persp: 2600, sx: 230 },
  { frame: 166, cx: 960, cy: 860, zoom: 0.775, rotX: 32, rotY: -4, rotZ: -7, persp: 2600, sx: 230 },
];
const PARAMS: (keyof Cam)[] = ['cx', 'cy', 'zoom', 'rotX', 'rotY', 'rotZ', 'persp', 'sx'];
const hermite = (xs: number[], ys: number[]) => {
  const n = xs.length;
  const d = xs.slice(0, -1).map((x, i) => (ys[i + 1] - ys[i]) / (xs[i + 1] - x));
  const m = xs.map((_, i) => (i === 0 ? d[0] : i === n - 1 ? 0 : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], h = a * a + b * b;
    if (h > 9) { const k = 3 / Math.sqrt(h); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (i < n - 2 && x > xs[i + 1]) i++;
    const hh = xs[i + 1] - xs[i], t = (x - xs[i]) / hh, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * hh * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * hh * m[i + 1];
  };
};
const CURVES = Object.fromEntries(PARAMS.map((p) => [p, hermite(ANCHORS.map((k) => k.frame), ANCHORS.map((k) => k[p]))])) as Record<keyof Cam, (x: number) => number>;
const camAt = (f: number): Cam => Object.fromEntries(PARAMS.map((p) => [p, CURVES[p](f)])) as Cam;

const BRUSH_TILE = (() => {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='640'>` +
    `<filter id='b' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='0.0018 0.62' numOctaves='3' seed='11' stitchTiles='stitch'/>` +
    `<feColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.3 0.3 0.3 0 -0.4'/>` +
    `</filter><rect width='100%' height='100%' filter='url(#b)'/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
})();
const T = 4000;

export const S2Deal: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = camAt(frame);
  const lightUp = interpolate(frame, [44, 76], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.5, 0, 0.6, 1) });
  const holeR = 2600 * lightUp;
  const feather = 500 + 800 * lightUp;
  const antT = interpolate(frame, [ANTICIPATE.from, ANTICIPATE.to], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const landed = grid.filter((c) => frame >= c.cue + 8).length;
  const statIn = ramp(frame, 60, 12, EASE.out);

  const tableBg = [
    `radial-gradient(${1100 + 1400 * lightUp}px ${800 + 1400 * lightUp}px at ${T + PILE_CX - 600 * lightUp}px ${T + PILE_CY + 300 * lightUp}px, rgba(202,223,66,${0.1 - 0.04 * lightUp}), rgba(192,196,254,0.05) 45%, transparent 70%)`,
    `linear-gradient(104deg, transparent ${T + PILE_CX - 1600}px, rgba(192,196,254,0.06) ${T + PILE_CX - 500}px, rgba(230,231,255,0.1) ${T + PILE_CX}px, rgba(192,196,254,0.04) ${T + PILE_CX + 600}px, transparent ${T + PILE_CX + 1800}px)`,
    `${BRUSH_TILE} 0 0 / 640px 640px repeat`,
    `linear-gradient(115deg, #121a29 0%, ${K.navy} 30%, #111827 56%, #1a2538 80%, #0e1522 100%)`,
  ].join(', ');

  return (
    <AbsoluteFill style={{ background: '#0e1522', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `translateX(${cam.sx.toFixed(2)}px)`, perspective: `${(cam.persp * cam.zoom).toFixed(2)}px`, perspectiveOrigin: '960px 540px' }}>
        <div style={{
          position: 'absolute', width: 1920, height: BOARD.h, zoom: cam.zoom,
          transform: `translate(${(960 / cam.zoom - cam.cx).toFixed(3)}px, ${(540 / cam.zoom - cam.cy).toFixed(3)}px) rotateY(${cam.rotY.toFixed(3)}deg) rotateX(${cam.rotX.toFixed(3)}deg) rotateZ(${cam.rotZ.toFixed(3)}deg)`,
          transformOrigin: `${cam.cx.toFixed(2)}px ${cam.cy.toFixed(2)}px`, transformStyle: 'preserve-3d',
        }}>
          <div style={{
            position: 'absolute', left: -T, top: -T, width: 1920 + 2 * T, height: BOARD.h + 2 * T, background: tableBg,
            WebkitMaskImage: `radial-gradient(ellipse 2600px 3000px at ${T + 960}px ${T + BOARD.h / 2}px, #000 40%, transparent 100%)`,
            maskImage: `radial-gradient(ellipse 2600px 3000px at ${T + 960}px ${T + BOARD.h / 2}px, #000 40%, transparent 100%)`,
          }} />
          {/* The For Adoption page as a board on the table (real capture, cards hidden) */}
          <div style={{
            position: 'absolute', left: BOARD.x, top: 0, width: BOARD.w, height: BOARD.h, overflow: 'hidden', borderRadius: 24, background: K.paper,
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 60px 160px rgba(0,0,0,0.6), 0 12px 40px rgba(0,0,0,0.45)',
          }}>
            <Img src={staticFile('textures/adopt-empty.png')} style={{ position: 'absolute', left: -BOARD.x, top: 0, width: 1920, height: PAGE_H }} />
            {lightUp < 1 && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(14,21,34,0.88)',
                WebkitMaskImage: lightUp > 0 ? `radial-gradient(circle at ${PILE_CX - BOARD.x}px ${PILE_CY}px, transparent ${holeR.toFixed(0)}px, #000 ${(holeR + feather).toFixed(0)}px)` : undefined,
                maskImage: lightUp > 0 ? `radial-gradient(circle at ${PILE_CX - BOARD.x}px ${PILE_CY}px, transparent ${holeR.toFixed(0)}px, #000 ${(holeR + feather).toFixed(0)}px)` : undefined,
              }} />
            )}
          </div>

          {grid.map((c, i) => {
            const { cue } = c;
            const diveT = interpolate(frame, [cue, cue + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: DIVE_EASE });
            const settleT = interpolate(frame, [cue + 8, cue + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: SETTLE_EASE });
            const dx = (c.px - c.x) * (1 - diveT);
            const dy = (c.py - c.y) * (1 - diveT);
            const rotFlight = c.protZ * (1 - diveT);
            const arc = Math.sin(diveT * Math.PI) * 110;
            const zDive = interpolate(diveT, [0, 1], [c.pz, HOVER_H]) + arc;
            const z = frame < cue ? c.pz : zDive * (1 - settleT);
            const press = interpolate(frame, [cue + 10, cue + 11, cue + 12], [1, 0.996, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const scale = (1 + Math.sin(diveT * Math.PI) * 0.06) * press;
            const isLanded = frame >= cue + 12;
            const inPile = frame < cue;
            const antDy = inPile ? ANTICIPATE.pileDown * antT * (frame < ANTICIPATE.to + 2 ? 1 : 0) : 0;
            const antPull = i === 0 && inPile ? ANTICIPATE.topPull * antT : 0;
            const transform = isLanded
              ? 'translate3d(0px, 0px, 0px)'
              : inPile
                ? `translate3d(${c.px - c.x - antPull}px, ${c.py - c.y + antDy}px, ${c.pz}px) rotateZ(${c.protZ}deg)`
                : `translate3d(${dx}px, ${dy}px, ${z}px) rotateZ(${rotFlight}deg) scale(${scale})`;
            const shadowLag = interpolate(frame, [cue + 8, cue + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.out });
            const shadow = isLanded
              ? `0 ${(2 + 14 * (1 - shadowLag)).toFixed(1)}px ${(6 + 30 * (1 - shadowLag)).toFixed(1)}px rgba(21,31,48,${(0.1 + 0.12 * (1 - shadowLag)).toFixed(3)})`
              : inPile
                ? i === N - 1 ? '0 1px 3px rgba(0,0,0,.4), 0 26px 60px rgba(0,0,0,0.75)' : '0 1px 2px rgba(0,0,0,.35)'
                : `0 ${36 - 24 * settleT}px ${70 - 50 * settleT}px rgba(0,0,0,${(0.45 - 0.25 * settleT).toFixed(3)})`;
            const showGhost = diveT > 0.02 && diveT < 0.98;
            const dist = Math.hypot(c.x + c.w / 2 - PILE_CX, c.y + c.h / 2 - PILE_CY);
            const dark = clamp01((dist - holeR) / feather) * 0.88 * (lightUp < 1 ? 1 : 0);
            const pileShade = inPile ? 0.1 * (1 - lightUp) : diveT > 0.6 ? dark * Math.min(1, (diveT - 0.6) / 0.4) : 0;
            return (
              <div key={i} style={{ transformStyle: 'preserve-3d' }}>
                {showGhost ? (
                  <div style={{
                    position: 'absolute', left: c.x, top: c.y, width: c.w, height: c.h, borderRadius: 32, overflow: 'hidden',
                    transform: `translate3d(${dx + (c.px - c.x) * 0.06}px, ${dy + (c.py - c.y) * 0.06}px, ${z}px) rotateZ(${rotFlight}deg) scale(${scale})`,
                    opacity: 0.28 * (1 - diveT), filter: 'blur(7px)',
                  }}>
                    <Img src={staticFile(c.file)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                  </div>
                ) : null}
                <div style={{ position: 'absolute', left: c.x, top: c.y, width: c.w, height: c.h, transform, boxShadow: shadow, borderRadius: 32, overflow: 'hidden' }}>
                  <Img src={staticFile(c.file)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                  {pileShade > 0.005 && <div style={{ position: 'absolute', inset: 0, background: `rgba(14,21,34,${pileShade.toFixed(3)})` }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(ellipse 75% 75% at 55% 46%, transparent 45%, rgba(8,12,20,0.55) 100%)' }} />

      {/* Count line: follows the cards as they land; the number is the page's own "7 animals looking for a home" */}
      <div style={{ position: 'absolute', left: 110, top: 80, display: 'flex', alignItems: 'baseline', gap: 18, opacity: statIn, color: K.paper }}>
        <span style={{ fontFamily: FONT.display, fontSize: 96, lineHeight: 1, color: K.lime, minWidth: '1.1ch', fontVariantNumeric: 'tabular-nums' }}>{String(landed)}</span>
        <span style={{ fontFamily: FONT.text, fontSize: 40 }}>animals looking for a home</span>
      </div>
    </AbsoluteFill>
  );
};
