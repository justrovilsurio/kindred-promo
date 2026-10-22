// Shot 7 · Section switches — row-embed (demos/ui-entrance/row-embed/RowEmbed.tsx), preceded by the trigger.
// Part A (0–48): close-up on the real "Page sections" panel; the cursor flips "Meet our team" on. The switch is
// drawn with the app's own .kd-switch geometry/tokens (52×32 track, 24px knob, 20px travel, the :active stretch)
// over the real captures, and the row copy cross-fades from the real OFF capture to the real ON capture.
// Part B (48–138): the public page, where the Team section lands in its fixed slot between Events and
// Volunteer. Kept from row-embed: a slot patch in the page's real background with a faint dashed outline,
// rows flying in from the air (perspective translateY(−120·air) + rotateX(16°·air), bezier .5,0,.8,.75 so they
// still carry speed into the slot), scale 1.06→0.995 then a 4f press back to 1, vertical motion blur, a contact
// shadow that tightens as the row nears, a 2px seam lighting from the centre on touchdown, texture crops (never
// redrawn content), a slow camera drift while rows land.
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { EASE, ramp } from '../demos/_fixtures/Polish';
import L from '../layout.json';
import { K } from '../brand';

const D = L.dashboard;
const ROW = D.row, SW = D.switch;
export const S7_CUT = 48;
const CUT = S7_CUT;
const CLICK = 18;
export const S7_CLICK = CLICK;

// Part B geometry (page coords of home-full.png)
const H = L.home;
const TEAM = H.team;
const SPLIT = H.teamGrid.y - 24;
const ROWS = [
  { x: 0, y: TEAM.y, w: 1920, h: SPLIT - TEAM.y },
  { x: 0, y: SPLIT, w: 1920, h: TEAM.y + TEAM.h - SPLIT },
];
const CUES = [CUT + 12, CUT + 22];
const FLY = 12;
export const S7_LANDS = CUES.map((c) => c + FLY);
const FLY_EASE = Easing.bezier(0.5, 0, 0.8, 0.75);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const airOf = (f: number, cue: number) => 1 - interpolate(f, [cue, cue + FLY], [0, 1], { ...clamp, easing: FLY_EASE });

const PartA: React.FC<{ frame: number }> = ({ frame }) => {
  // Camera: close on the team row, a gentle push while the switch flips.
  const zoom = 2.3 + 0.12 * ramp(frame, 0, CUT, EASE.smooth);
  const cx = ROW.x + ROW.w * 0.55, cy = ROW.y + ROW.h / 2;
  const on = ramp(frame, CLICK + 1, 7, EASE.overshoot); // knob travel (app: 220ms ease-out)
  const pressed = frame >= CLICK - 1 && frame <= CLICK + 3;
  const copy = ramp(frame, CLICK + 4, 8, EASE.out);
  const ptrT = ramp(frame, 0, CLICK - 3, EASE.swift);
  const ptr = { x: SW.x + SW.w * 0.62 + (1 - ptrT) * 140, y: SW.y + SW.h * 0.55 + (1 - ptrT) * 60 + Math.sin(ptrT * Math.PI) * 14 };
  const ptrO = 1 - ramp(frame, CLICK + 10, 8, EASE.out);
  const track = on > 0.5 ? K.navy : '#ebebef';
  return (
    <AbsoluteFill style={{ background: K.paper, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 1920, height: 1080, transform: `translate(${960 - cx * zoom}px, ${540 - cy * zoom}px) scale(${zoom})`, transformOrigin: '0 0' }}>
        <Img src={staticFile('textures/dash-team-on.png')} style={{ position: 'absolute', width: 1920, height: 1080 }} />
        <Img src={staticFile('textures/row-team-off.png')} style={{ position: 'absolute', left: ROW.x, top: ROW.y, width: ROW.w, height: ROW.h, opacity: 1 - copy }} />
        {/* the switch, redrawn with .kd-switch geometry so the knob can travel */}
        <div style={{ position: 'absolute', left: SW.x - 2, top: SW.y - 2, width: SW.w + 4, height: SW.h + 4, background: K.surface }} />
        <div style={{ position: 'absolute', left: SW.x, top: SW.y, width: 52, height: 32, borderRadius: 999, background: track, boxShadow: on > 0.5 ? 'none' : 'inset 0 0 0 1.5px #858a98' }}>
          <div style={{
            position: 'absolute', top: 4, left: 4, height: 24, width: pressed ? 28 : 24, borderRadius: 12,
            background: on > 0.5 ? K.lime : '#858a98', transform: `translateX(${(20 * on - (pressed && on > 0.5 ? 4 : 0)).toFixed(2)}px)`,
          }} />
        </div>
        {[0, 1].map((r) => {
          const st = CLICK + r * 3;
          if (frame < st || frame > st + 10) return null;
          const t = ramp(frame, st, 10, EASE.out);
          const rad = 8 + t * (r === 0 ? 22 : 34);
          return <div key={r} style={{ position: 'absolute', left: SW.x + 36 - rad, top: SW.y + 16 - rad, width: rad * 2, height: rad * 2, borderRadius: '50%', border: `${r === 0 ? 1.5 : 1}px solid ${r === 0 ? K.iris : K.lime}`, opacity: 1 - t }} />;
        })}
        {ptrO > 0.01 && (
          <svg width={28} height={28} viewBox="0 0 28 28" style={{ position: 'absolute', left: ptr.x - 2, top: ptr.y - 1, opacity: ptrO, overflow: 'visible', transformOrigin: '2px 1px', transform: `scale(${(1.7 / zoom) * (pressed ? 0.86 : 1)})`, filter: 'drop-shadow(0 2px 3px rgba(20,14,8,0.25))' }}>
            <path d="M2 1 L2 23 L8 17.5 L11.5 25 L15.5 23.2 L12 15.8 L20 15 Z" fill={K.navy} stroke="#ffffff" strokeWidth={1.6} strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </AbsoluteFill>
  );
};

const PartB: React.FC<{ frame: number }> = ({ frame }) => {
  const t = ramp(frame, CUT, 90, EASE.smooth);
  const zoom = 0.94 + 0.05 * t;
  const cx = 960, cy = TEAM.y + TEAM.h / 2 - 20 + 40 * t;
  const src = staticFile('textures/home-full.png');
  return (
    <AbsoluteFill style={{ background: K.paper, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 1920, height: H.pageH, transform: `translate(${960 - cx * zoom}px, ${540 - cy * zoom}px) scale(${zoom})`, transformOrigin: '0 0' }}>
        <Img src={src} style={{ position: 'absolute', width: 1920, height: H.pageH }} />
        {ROWS.map((r, i) => {
          const cue = CUES[i], land = cue + FLY;
          const patchO = interpolate(frame, [land, land + 2], [1, 0], clamp);
          const hint = interpolate(frame, [cue - 6, cue + 4], [0.55, 1], clamp);
          let flyer: React.ReactNode = null, contact: React.ReactNode = null, seam: React.ReactNode = null;
          if (frame >= cue && frame < land + 4) {
            const air = airOf(frame, cue);
            const p = 1 - air;
            const appear = interpolate(frame, [cue, cue + 3], [0, 1], clamp);
            const scale = frame < land ? 1.06 - 0.065 * p : interpolate(frame, [land, land + 4], [0.995, 1], { ...clamp, easing: Easing.out(Easing.quad) });
            const vy = 120 * (airOf(frame - 0.5, cue) - airOf(frame + 0.5, cue));
            const mb = frame < land ? Math.min(3.2, vy * 0.22) : 0;
            flyer = (
              <div style={{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, opacity: appear, zIndex: 3, transform: `perspective(900px) translateY(${(-120 * air).toFixed(2)}px) rotateX(${(16 * air).toFixed(3)}deg) scale(${scale.toFixed(4)})`, filter: mb > 0.25 ? `url(#s7mb${i})` : undefined }}>
                {mb > 0.25 && <svg width={0} height={0} style={{ position: 'absolute' }}><filter id={`s7mb${i}`} x="-5%" y="-30%" width="110%" height="160%"><feGaussianBlur stdDeviation={`0 ${mb.toFixed(2)}`} /></filter></svg>}
                <div style={{
                  position: 'absolute', inset: 0, backgroundImage: `url(${src})`, backgroundSize: `1920px ${H.pageH}px`, backgroundPosition: `-${r.x}px -${r.y}px`,
                  boxShadow: `0 ${(34 * air).toFixed(1)}px ${(64 * air).toFixed(1)}px -${(10 * air).toFixed(1)}px rgba(21,31,48,${(0.28 * air).toFixed(3)}), 0 ${(6 * air).toFixed(1)}px ${(14 * air).toFixed(1)}px rgba(21,31,48,${(0.12 * air).toFixed(3)})`,
                }} />
              </div>
            );
            const near = interpolate(air, [0, 0.5], [1, 0], clamp);
            const cOp = frame < land ? near * 0.5 : interpolate(frame, [land, land + 3], [0.5, 0], clamp);
            contact = <div style={{ position: 'absolute', left: r.x + 10, top: r.y + 6, width: r.w - 20, height: r.h - 6, boxShadow: `0 ${(2 + 6 * air).toFixed(1)}px ${(6 + 18 * air).toFixed(1)}px rgba(21,31,48,${(0.22 * cOp).toFixed(3)})`, zIndex: 2 }} />;
          }
          if (frame >= land && frame < land + 8) {
            const spread = interpolate(frame, [land, land + 5], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
            const so = interpolate(frame, [land, land + 2, land + 8], [1, 1, 0], clamp);
            const sw = r.w * spread;
            seam = <div style={{ position: 'absolute', left: r.x + (r.w - sw) / 2, top: r.y + r.h - 2, width: sw, height: 2, background: `linear-gradient(90deg, rgba(141,146,253,0) 0%, ${K.iris} 18%, ${K.navy} 50%, ${K.iris} 82%, rgba(141,146,253,0) 100%)`, boxShadow: '0 0 7px rgba(141,146,253,0.5)', opacity: so, zIndex: 4 }} />;
          }
          return (
            <React.Fragment key={i}>
              {patchO > 0 && (
                <div style={{ position: 'absolute', left: r.x - 3, top: r.y - 3, width: r.w + 6, height: r.h + 6, background: K.paper, opacity: patchO, zIndex: 1 }}>
                  <div style={{ position: 'absolute', left: 380, right: 380, top: 14, bottom: 14, borderRadius: 32, border: '2px dashed rgba(21,31,48,0.2)', background: 'rgba(21,31,48,0.02)', opacity: hint }} />
                </div>
              )}
              {contact}{flyer}{seam}
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const S7Sections: React.FC = () => {
  const frame = useCurrentFrame();
  return frame < CUT ? <PartA frame={frame} /> : <PartB frame={frame} />;
};
