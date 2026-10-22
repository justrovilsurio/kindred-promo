// Workbench manifest (references/workbench.md §2): every table is imported from the render's own sources
// (timeline.ts / audio.tsx), never copied, so the imported project renders identically to Main.
import React from 'react';
import { CAPTIONS, DURATION, FPS, HEIGHT, ORDER, PUSH_DUR, PUSH_INTO, SHOTS, WIDTH, type ShotKey } from './timeline';
import { BGM_SRC, BGM_VOLUME, SFX, fromOf } from './audio';
import { CaptionLayer, Main, ShotLayer } from './Main';
import { K } from './brand';

const LABELS: Record<ShotKey, string> = {
  open: 'S1 Opening · letter drop', deal: 'S2 Gallery · deck deal', filter: 'S3 Filters', story: 'S4 Story · card flip',
  tc1: 'T1 Title card', editor: 'S5 Editor · assemble', publish: 'S6 Publish · LIVE slam', tc2: 'T2 Title card',
  sections: 'S7 Section switch · row embed', outro: 'S8 Group photo outro',
};

// One wrapper per shot so the push seam (and its tail into the next shot) travels with the clip.
const shotUnit = (k: ShotKey) => {
  const C: React.FC = () => React.createElement(ShotLayer, { k });
  C.displayName = `Shot_${k}`;
  return C;
};

const CaptionUnit: React.FC<Record<string, unknown>> = (p) =>
  React.createElement(CaptionLayer, { k: p.shot as ShotKey, text: String(p.text), inAt: Number(p.inAt), outAt: p.outAt as number | undefined });
CaptionUnit.displayName = 'CaptionUnit';

export const WORKBENCH = {
  name: 'Kindred · Sticker Poster promo',
  fps: FPS, width: WIDTH, height: HEIGHT, total: DURATION,
  background: K.navy,
  shots: ORDER.map((k, i) => {
    const next = ORDER[i + 1];
    const tail = next && PUSH_INTO.includes(next) ? PUSH_DUR : 0;
    return { id: k, label: LABELS[k], from: SHOTS[k].from, duration: SHOTS[k].dur + tail, component: shotUnit(k) };
  }),
  captions: CAPTIONS.map((c) => ({
    id: `caption-${c.shot}`, label: c.text, from: SHOTS[c.shot].from, duration: SHOTS[c.shot].dur,
    component: CaptionUnit, cardId: 'caption', cardName: 'Caption',
    props: { shot: c.shot, text: c.text, inAt: c.inAt, outAt: c.outAt },
    schema: [{ type: 'text', key: 'text', label: 'Caption', default: '' }],
  })),
  sfx: SFX.map((p) => ({ from: Math.max(0, fromOf(p)), duration: p.dur ?? 150, src: `audio/sfx/${p.src}`, volume: p.volume, label: p.note })),
  bgm: [{ from: 0, duration: DURATION, src: BGM_SRC, volume: BGM_VOLUME, label: 'Cat Walk (Arulo, Mixkit)' }],
  order: ['transitions', 'captions', 'overlays'] as ('transitions' | 'captions' | 'overlays')[],
  original: Main as unknown as React.ComponentType<Record<string, unknown>>,
};
