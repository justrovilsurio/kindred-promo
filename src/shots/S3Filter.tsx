// Shot 3 · Filters — type-and-filter (demos/interaction/type-and-filter/TypeAndFilter.tsx).
// Kept: human-pace operation with a camera that follows the hand (close on the control → wide while the grid
// changes → push into the clicked card), non-targets leaving in reading order 0.4f apart (5f fade + 8px sink +
// slight blur), survivors sliding into real layout slots (10f, bezier .35,0,.2,1, float + widening shadow,
// vertical speed blur), a breath between action and result, double-ring click ripple, selected outline,
// a constant-screen-size pointer.
// Adapted: Kindred filters by chips and selects, not a search box, so the "typing" beat becomes three real
// filter picks (Dogs → Pasig → 1–3 years); the filter bar is swapped to each real captured state.
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { SpeedBlur, velocity } from '../demos/_fixtures/Polish';
import L from '../layout.json';
import { K } from '../brand';

const SLOTS = L.adopt.cards;
const NAMES = L.adopt.names;
const FILTERS = L.adopt.filters;
const PAGE_BG = K.paper;

// Each state: which animals are shown, in layout order (= slot index). Textures carry the matching filter bar.
const STATES = [
  { names: L.adopt.names, tex: 'adopt-full' },
  { names: L.adoptDogs.names, tex: 'adopt-dogs' },
  { names: L.adoptPasig.names, tex: 'adopt-pasig' },
  { names: L.adoptAge.names, tex: 'adopt-age' },
];
const STATE_H = [L.adopt.pageH, L.adoptDogs.pageH, L.adoptPasig.pageH, L.adoptAge.pageH];

// Filter controls (page coords) and the frames they are clicked.
const chipDogs = L.adopt.chips[2];
const selLoc = L.adopt.selects[1];
const selAge = L.adopt.selects[0];
const ctr = (b: { x: number; y: number; w: number; h: number }) => ({ x: b.x + b.w * 0.5, y: b.y + b.h * 0.5 });
const CLICKS = [
  { at: 22, p: ctr(chipDogs) },
  { at: 54, p: { x: selLoc.x + selLoc.w * 0.42, y: selLoc.y + selLoc.h * 0.5 } },
  { at: 84, p: { x: selAge.x + selAge.w * 0.42, y: selAge.y + selAge.h * 0.5 } },
];
const PICK_DELAY = 5; // selects show their focus ring before the value lands
const CHANGE = [CLICKS[0].at + 1, CLICKS[1].at + PICK_DELAY, CLICKS[2].at + PICK_DELAY];
const MANGO = SLOTS[0];
const CARD_CLICK = { at: 114, p: { x: MANGO.x + MANGO.w / 2, y: MANGO.y + MANGO.h * 0.42 } };
export const S3_CLICKS = [...CLICKS.map((c) => c.at), CARD_CLICK.at];

// Camera (page coords): close on the filter bar → wide on the whole grid → push into Mango (hands off to shot 4).
type CamKey = { frame: number; cx: number; cy: number; zoom: number };
const CAM: CamKey[] = [
  { frame: 0, cx: 760, cy: 360, zoom: 1.75 },
  { frame: 16, cx: 760, cy: 360, zoom: 1.75 },
  { frame: 34, cx: 960, cy: 800, zoom: 0.98 },
  { frame: 104, cx: 960, cy: 800, zoom: 0.98 },
  { frame: 138, cx: MANGO.x + MANGO.w / 2, cy: MANGO.y + MANGO.h / 2, zoom: 1.6 },
  { frame: 152, cx: MANGO.x + MANGO.w / 2, cy: MANGO.y + MANGO.h / 2, zoom: 1.6 },
];
export const S3_END_CAM = CAM[CAM.length - 1];
const CAM_EASE = Easing.bezier(0.33, 0, 0.15, 1);
const camAt = (f: number) => {
  for (let i = 0; i < CAM.length - 1; i++) {
    const a = CAM[i], b = CAM[i + 1];
    if (f <= b.frame) {
      const t = interpolate(f, [a.frame, b.frame], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CAM_EASE });
      return { cx: a.cx + (b.cx - a.cx) * t, cy: a.cy + (b.cy - a.cy) * t, zoom: a.zoom + (b.zoom - a.zoom) * t };
    }
  }
  return CAM[CAM.length - 1];
};

// Pointer path: glides between targets on a slight arc, arriving 2–3f before each click.
const PTR_KEYS = [
  { frame: 0, ...{ x: 1180, y: 520 } },
  { frame: CLICKS[0].at - 3, ...CLICKS[0].p },
  { frame: CLICKS[1].at - 3, ...CLICKS[1].p },
  { frame: CLICKS[2].at - 3, ...CLICKS[2].p },
  { frame: CARD_CLICK.at - 3, ...CARD_CLICK.p },
];
const ptrAt = (f: number) => {
  for (let i = 0; i < PTR_KEYS.length - 1; i++) {
    const a = PTR_KEYS[i], b = PTR_KEYS[i + 1];
    const start = Math.max(a.frame, b.frame - 16);
    if (f <= b.frame) {
      const t = interpolate(f, [start, b.frame], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.45, 0, 0.2, 1) });
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t + Math.sin(t * Math.PI) * 40 };
    }
  }
  return PTR_KEYS[PTR_KEYS.length - 1];
};

const stateAt = (f: number) => CHANGE.filter((c) => f >= c).length;
const SLIDE = 10;
const slideEase = Easing.bezier(0.35, 0, 0.2, 1);

// Card k's slot as a function of frame: slides from its slot in state s−1 to its slot in state s at CHANGE[s−1].
const slotPos = (name: string, f: number) => {
  let pos = SLOTS[STATES[0].names.indexOf(name)];
  let x = pos.x, y = pos.y;
  for (let s = 1; s < STATES.length; s++) {
    const idx = STATES[s].names.indexOf(name);
    if (idx < 0) break;
    const to = SLOTS[idx];
    const t = interpolate(f, [CHANGE[s - 1], CHANGE[s - 1] + SLIDE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: slideEase });
    x = x + (to.x - x) * t; y = y + (to.y - y) * t;
    pos = to;
  }
  return { x, y };
};

export const S3Filter: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = camAt(frame);
  const st = stateAt(frame);
  const ptr = ptrAt(frame);
  const ptrO = interpolate(frame, [2, 8, CARD_CLICK.at + 6, CARD_CLICK.at + 12], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const press = (at: number) => interpolate(frame, [at - 1, at + 1, at + 5], [1, 0.86, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ptrPress = Math.min(press(CLICKS[0].at), press(CLICKS[1].at), press(CLICKS[2].at), press(CARD_CLICK.at));

  // Leave order: reading order of the cards that drop out at each change.
  const leaveCue = (name: string): number | null => {
    for (let s = 1; s < STATES.length; s++) {
      if (!STATES[s].names.includes(name)) {
        const leavers = STATES[s - 1].names.filter((n) => !STATES[s].names.includes(n));
        return CHANGE[s - 1] + leavers.indexOf(name) * 0.4;
      }
    }
    return null;
  };

  // Select focus rings (iris = the app's --focus family), lit between click and value change.
  const focusRing = (b: { x: number; y: number; w: number; h: number }, at: number) => {
    const o = interpolate(frame, [at, at + 2, at + PICK_DELAY + 6, at + PICK_DELAY + 12], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return o > 0 ? <div style={{ position: 'absolute', left: b.x - 3, top: b.y - 3, width: b.w + 6, height: b.h + 6, borderRadius: 12, border: `2px solid ${K.iris}`, boxShadow: `0 0 0 4px ${'rgba(141,146,253,0.25)'}`, opacity: o, zIndex: 3 }} /> : null;
  };

  return (
    <AbsoluteFill style={{ background: PAGE_BG, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', width: 1920, height: L.adopt.pageH,
        transform: `translate(${960 - cam.cx * cam.zoom}px, ${540 - cam.cy * cam.zoom}px) scale(${cam.zoom})`, transformOrigin: '0 0',
      }}>
        <Img src={staticFile('textures/adopt-empty.png')} style={{ position: 'absolute', width: 1920, height: L.adopt.pageH }} />
        {/* Filter bar + result count in each real state. All four are mounted as <Img> (render waits for
            every load) and switched by opacity, so no frame can show a texture that has not decoded yet. */}
        <div style={{ position: 'absolute', left: FILTERS.x - 4, top: FILTERS.y - 4, width: FILTERS.w + 8, height: FILTERS.h + 8, overflow: 'hidden' }}>
          {STATES.map((s, si) => (
            <Img key={s.tex} src={staticFile(`textures/${s.tex}.png`)} style={{
              position: 'absolute', left: -(FILTERS.x - 4), top: -(FILTERS.y - 4), width: 1920, height: STATE_H[si], maxWidth: 'none', opacity: si === st ? 1 : 0,
            }} />
          ))}
        </div>
        {focusRing(selLoc, CLICKS[1].at)}
        {focusRing(selAge, CLICKS[2].at)}

        {NAMES.map((name, i) => {
          const cue = leaveCue(name);
          if (cue !== null && frame >= cue + 5) return null;
          const outT = cue === null ? 0 : interpolate(frame, [cue, cue + 5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
          const p = slotPos(name, frame);
          const vy = velocity((f) => slotPos(name, f).y, frame);
          const vx = velocity((f) => slotPos(name, f).x, frame);
          const moving = Math.hypot(vx, vy) > 0.5;
          const float = moving ? Math.min(1, Math.hypot(vx, vy) / 40) : 0;
          return (
            <SpeedBlur key={name} vx={vx} vy={vy} amount={0.04} max={7} style={{ zIndex: moving ? 2 : 1 }}>
              <div style={{
                position: 'absolute', left: p.x, top: p.y, width: SLOTS[0].w, height: SLOTS[0].h, borderRadius: 32, overflow: 'hidden',
                transform: `translateY(${8 * outT}px) scale(${(1 - 0.015 * outT + 0.02 * float).toFixed(4)})`, opacity: 1 - outT,
                filter: outT > 0.02 ? `blur(${(1.5 * outT).toFixed(2)}px)` : undefined,
                boxShadow: `0 ${2 + 18 * float}px ${8 + 30 * float}px rgba(21,31,48,${(0.08 + 0.12 * float).toFixed(3)})`,
              }}>
                <Img src={staticFile(`textures/adopt-card-${i}.png`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
              </div>
            </SpeedBlur>
          );
        })}

        {/* Click ripples: two concentric rings (iris + lime), 3f apart */}
        {[...CLICKS, CARD_CLICK].flatMap((c, ci) => [0, 1].map((r) => {
          const start = c.at + r * 3;
          if (frame < start || frame > start + 10) return null;
          const t = interpolate(frame, [start, start + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
          const rad = 14 + t * (r === 0 ? 40 : 64);
          return <div key={`${ci}-${r}`} style={{ position: 'absolute', left: c.p.x - rad, top: c.p.y - rad, width: rad * 2, height: rad * 2, borderRadius: '50%', border: `${r === 0 ? 3 : 2}px solid ${r === 0 ? K.iris : K.lime}`, opacity: 1 - t, zIndex: 5 }} />;
        }))}

        {/* Selected outline on Mango, concentric with the card radius (32 + 6) */}
        {frame >= CARD_CLICK.at + 2 ? (
          <div style={{
            position: 'absolute', left: MANGO.x - 6, top: MANGO.y - 6, width: MANGO.w + 12, height: MANGO.h + 12, borderRadius: 38,
            border: `4px solid ${K.iris}`, boxShadow: '0 0 0 5px rgba(141,146,253,0.18), 0 10px 34px -6px rgba(141,146,253,0.5)', zIndex: 4,
            opacity: interpolate(frame, [CARD_CLICK.at + 2, CARD_CLICK.at + 5], [0.5, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            transform: `scale(${interpolate(frame, [CARD_CLICK.at + 2, CARD_CLICK.at + 7], [1.015, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })})`,
          }} />
        ) : null}

        {ptrO > 0.001 ? (
          <svg width={28} height={28} viewBox="0 0 28 28" style={{
            position: 'absolute', left: ptr.x - 2, top: ptr.y - 1, zIndex: 6, opacity: ptrO, overflow: 'visible', transformOrigin: '2px 1px',
            transform: `scale(${((1 / cam.zoom) * ptrPress * 1.7).toFixed(4)})`,
            filter: 'drop-shadow(0 0.6px 0.6px rgba(20,14,8,0.35)) drop-shadow(0 3px 5px rgba(20,14,8,0.25))',
          }}>
            <path d="M2 1 L2 23 L8 17.5 L11.5 25 L15.5 23.2 L12 15.8 L20 15 Z" fill={K.navy} stroke="#ffffff" strokeWidth={1.6} strokeLinejoin="round" />
          </svg>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
