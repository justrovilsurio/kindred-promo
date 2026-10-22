// Shot 5 · Editor — product-card-progressive-assemble (demos/ui-entrance/product-card-progressive-assemble/
// ProductCardProgressiveAssemble.tsx). Kept: a focus frame that leads each field by 2–3f and morphs between
// field boxes (6f, swift in-out) with a small label chip, skeleton slots that fade as content lands, "rise"
// landings (14f expo-out, 6px blur → 0) for big pieces, tight in-group / wide cross-group spacing, a whole-shot
// breath (1 → 1.035), the frame finally collapsing into the result and fading.
// Adapted: the "card" is the real editor (blank capture of Juniper's draft) with the real "On your page" preview
// card rebuilt from three real layers (photo → + name → full), each landing a few frames after its form field.
// The chip says "Autosaved" — the app's actual draft behaviour — instead of the demo's AUTOFILL.
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { EASE, mix, ramp } from '../demos/_fixtures/Polish';
import L from '../layout.json';
import { FONT, K, clamp01 } from '../brand';

const E = L.editor;
type Box = { x: number; y: number; w: number; h: number };
const CAM = { cx: 815, cy: 470, zoom: 1.3 };

// Field schedule (shot-local frames): when the focus frame arrives on each field. Packed so the finished
// preview card lands by ~f86 and reads for ~0.8 s before the f110 cut (card pitfall: give the result a hold).
// The breed/date row sits under the caption, so the editor caption leaves before F.breed.at (timeline.ts).
const F = {
  thumb: { box: E.thumb as Box, at: 4 },
  name: { box: E.name as Box, at: 12, text: 'Juniper', per: 2 },
  location: { box: E.location as Box, at: 30, text: 'Quezon City', per: 1.2 },
  breed: { box: E.breed as Box, at: 48, text: 'Beagle', per: 1.2 },
  date: { box: E.date as Box, at: 59, text: '9 Oct 2026', per: 1.2 },
  card: { box: E.card as Box, at: 76 },
};
const ORDER = ['thumb', 'name', 'location', 'breed', 'date', 'card'] as const;
const HOP = 6;
const typedEnd = (k: 'name' | 'location' | 'breed' | 'date') => F[k].at + 2 + F[k].text.length * F[k].per;
// Card layers land a beat after their source field is complete.
const CARD_PHOTO = F.thumb.at + 6;
const CARD_NAME = typedEnd('name') + 2;
const CARD_META = typedEnd('date') + 2;
export const S5_TYPING = (['name', 'location', 'breed', 'date'] as const).map((k) => ({ from: F[k].at + 2, to: typedEnd(k) }));
export const S5_LANDS = [CARD_PHOTO, CARD_NAME, CARD_META];

const focusBox = (f: number): Box => {
  let prev = F[ORDER[0]].box;
  for (let i = 0; i < ORDER.length; i++) {
    const cur = F[ORDER[i]];
    if (f < cur.at) {
      const k = i === 0 ? 1 : ramp(f, cur.at - HOP, HOP, EASE.swift);
      return { x: mix(prev.x, cur.box.x, k), y: mix(prev.y, cur.box.y, k), w: mix(prev.w, cur.box.w, k), h: mix(prev.h, cur.box.h, k) };
    }
    prev = cur.box;
  }
  return prev;
};
const rise = (p: number, dist = 16): React.CSSProperties => ({
  opacity: clamp01(p * 1.8), transform: `translateY(${((1 - p) * dist).toFixed(2)}px)`, filter: p < 0.98 ? `blur(${((1 - p) * 6).toFixed(2)}px)` : undefined,
});

const Typed: React.FC<{ k: 'name' | 'location' | 'breed' | 'date'; frame: number }> = ({ k, frame }) => {
  const f = F[k];
  const n = frame < f.at + 2 ? 0 : Math.min(f.text.length, Math.floor((frame - f.at - 2) / f.per) + 1);
  const caret = frame >= f.at && frame < typedEnd(k) + 3;
  return (
    <>
      {frame >= f.at + 2 && <div style={{ position: 'absolute', left: f.box.x + 6, top: f.box.y + 6, width: f.box.w - 12, height: f.box.h - 12, background: K.surface }} />}
      <div style={{ position: 'absolute', left: f.box.x + 17, top: f.box.y, height: f.box.h, display: 'flex', alignItems: 'center', fontFamily: FONT.text, fontSize: 17, color: K.navy }}>
        <span>{f.text.slice(0, n)}</span>
        {caret && <span style={{ display: 'inline-block', width: 1.5, height: 20, marginLeft: 1, background: K.iris }} />}
      </div>
    </>
  );
};

export const S5Editor: React.FC = () => {
  const frame = useCurrentFrame();
  const breath = 1 + 0.035 * ramp(frame, 0, 111, EASE.swift);
  const fb = focusBox(frame);
  const fIn = ramp(frame, 2, 6, EASE.out);
  const fOut = ramp(frame, F.card.at + 6, 8, EASE.exit);
  const pad = 8 * (1 - fOut * 0.5);
  const thumb = ramp(frame, F.thumb.at + 2, 14, EASE.snappy);
  const h1 = ramp(frame, typedEnd('name'), 14, EASE.snappy);
  const cPhoto = ramp(frame, CARD_PHOTO, 14, EASE.snappy);
  const cName = ramp(frame, CARD_NAME, 10, EASE.out);
  const cMeta = ramp(frame, CARD_META, 10, EASE.out);
  const C = E.card as Box;

  return (
    <AbsoluteFill style={{ background: K.paper, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', width: 1920, height: 1080,
        transform: `translate(${960 - CAM.cx * CAM.zoom * breath}px, ${540 - CAM.cy * CAM.zoom * breath}px) scale(${CAM.zoom * breath})`, transformOrigin: '0 0',
      }}>
        <Img src={staticFile('textures/editor-blank.png')} style={{ position: 'absolute', width: 1920, height: 1080 }} />

        {/* Page title "Juniper" lands once the name is typed (crop of the real draft capture) */}
        <div style={{ position: 'absolute', left: 270, top: 66, width: 340, height: 78, backgroundImage: `url(${staticFile('textures/editor-draft.png')})`, backgroundSize: '1920px 1080px', backgroundPosition: '-270px -66px', ...rise(h1, 18) }} />

        {/* Cover thumbnail lands in the Photos panel */}
        <div style={{ position: 'absolute', left: E.thumb.x, top: E.thumb.y, width: E.thumb.w, height: E.thumb.h, borderRadius: 12, overflow: 'hidden', backgroundImage: `url(${staticFile('textures/editor-draft.png')})`, backgroundSize: '1920px 1080px', backgroundPosition: `-${E.thumb.x}px -${E.thumb.y}px`, ...rise(thumb, 14) }} />

        <Typed k="name" frame={frame} />
        <Typed k="location" frame={frame} />
        <Typed k="breed" frame={frame} />
        <Typed k="date" frame={frame} />

        {/* Preview card: skeleton → photo → + name → full card (real layers) */}
        <div style={{ position: 'absolute', left: C.x, top: C.y, width: C.w, height: C.h, borderRadius: 32, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: '#ebebef', opacity: 1 - cPhoto }} />
          <div style={{ position: 'absolute', left: 18, right: 60, bottom: 52, height: 26, borderRadius: 8, background: '#dfe0e6', opacity: 1 - cName }} />
          <div style={{ position: 'absolute', left: 18, right: 90, bottom: 22, height: 14, borderRadius: 7, background: '#dfe0e6', opacity: 1 - cMeta }} />
          <Img src={staticFile('textures/card-photo.png')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', ...rise(cPhoto, 20), transform: `${rise(cPhoto, 20).transform} scale(${mix(1.06, 1, cPhoto)})` }} />
          <Img src={staticFile('textures/card-name.png')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: cName }} />
          <Img src={staticFile('textures/card-full.png')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: cMeta }} />
        </div>

        {/* Focus frame + "Autosaved" chip */}
        {fIn * (1 - fOut) > 0.01 && (
          <div style={{
            position: 'absolute', left: fb.x - pad, top: fb.y - pad, width: fb.w + pad * 2, height: fb.h + pad * 2, borderRadius: 16,
            border: `2.5px solid ${K.iris}`, background: 'rgba(141,146,253,0.05)', opacity: fIn * (1 - fOut),
            boxShadow: '0 0 0 5px rgba(141,146,253,0.12), 0 8px 24px rgba(141,146,253,0.18)',
          }}>
            <div style={{ position: 'absolute', right: 12, top: -14, height: 26, padding: '0 10px', borderRadius: 13, background: K.navy, color: K.paper, display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONT.text, fontSize: 14, whiteSpace: 'nowrap' }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: K.lime }} />Autosaved
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
