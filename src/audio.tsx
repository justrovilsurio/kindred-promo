// Soundtrack: BGM bed (toggle with the `bgm` prop for the SFX-only master) + the SFX pin table.
// Every pin is relative (SHOTS.x.from + a shot's exported action frame) and lands the sample's measured
// perceived peak on that frame: from = target − peak lag − output offset (sound-design §4.5/§4.6).
// Peak lags / levels: src/sfx_peaks.json (scripts/sfx-peaks.mjs; kept inside src/ so the workbench link sees it).
import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import { PUSH_INTO, SHOTS } from './timeline';
import PEAKS from './sfx_peaks.json';
import { S1_BLOB_AT, S1_LANDINGS, S1_STICKER_AT } from './shots/S1Open';
import { S2_DEAL_CUES } from './shots/S2Deal';
import { S3_CLICKS } from './shots/S3Filter';
import { S4_FLIP_AT, S4_LAND_AT } from './shots/S4Story';
import { S5_LANDS, S5_TYPING } from './shots/S5Editor';
import { S6_CLICK, S6_IMPACT } from './shots/S6Publish';
import { S7_CLICK, S7_CUT, S7_LANDS } from './shots/S7Sections';
import { S8_STAMP } from './shots/S8Outro';

// Measured output-track offset of this render pipeline (Remotion 4.0.484, AAC, mp4); set from the
// post-render cross-correlation check (scripts/av-check.mjs): click-camera 1.27f, switch-tap 1.29f, pop 1.27f
// (2026-10-22) — the AAC encoder priming signature.
export const OUTPUT_AUDIO_OFFSET_F = 1.28;

type Pin = { at: number; src: string; volume: number; dur?: number; note: string };
const lag = (src: string) => (PEAKS as Record<string, { hit_lag_f: number }>)[src]?.hit_lag_f ?? 0;
export const fromOf = (p: Pin) => Math.round(p.at - lag(p.src) - OUTPUT_AUDIO_OFFSET_F);

const S = SHOTS;
const WORD_STARTS = [0, 5, 11, 14, 15]; // first glyph of Every / rescue / has / a / story.

export const SFX: Pin[] = [
  // 1 · Opening: one soft landing per word (alternating samples, stepping down), blob swing, sticker pop
  ...WORD_STARTS.map((g, k) => ({ at: S.open.from + S1_LANDINGS[g], src: k % 2 ? 'bass-hit-short.mp3' : 'hit-weak.mp3', volume: (k % 2 ? 0.2 : 0.5) - k * 0.03, note: `word ${k + 1} lands` })),
  { at: S.open.from + S1_BLOB_AT + 10, src: 'transition-soft.mp3', volume: 0.4, note: 'blob photo swings in' },
  { at: S.open.from + S1_STICKER_AT + 4, src: 'pop.mp3', volume: 0.45, note: 'paw sticker pops' },
  // push seams (bottom-push-stack-wipe): one sweep each, peaking as the new field arrives
  ...PUSH_INTO.map((k) => ({ at: S[k].from + 8, src: 'sweep-fast.mp3', volume: 0.32, note: `push into ${k}` })),
  // 2 · Deal: pull-back whoosh, then card flicks (two samples alternating, stepping down)
  { at: S.deal.from + 62, src: 'whoosh-big.mp3', volume: 0.35, note: 'orbit pulls back, board lights up' },
  ...S2_DEAL_CUES.map((c, k) => ({ at: S.deal.from + c + 8, src: k % 2 ? 'paper-slide.mp3' : 'paper-move-quick.mp3', volume: (k % 2 ? 0.34 : 0.9) * (1 - k * 0.07), note: `card ${k + 1} lands` })),
  // 3 · Filters: real clicks (loudest UI sound), push-in after the last click
  ...S3_CLICKS.map((c, k) => ({ at: S.filter.from + c, src: 'click-camera.mp3', volume: 0.6, note: ['Dogs chip', 'Pasig', '1–3 years', 'Mango card'][k] })),
  { at: S.filter.from + S3_CLICKS[3] + 12, src: 'swoosh-quick.mp3', volume: 0.3, note: 'push into Mango' },
  // 4 · Story: flip whoosh, settle
  { at: S.story.from + S4_FLIP_AT + 8, src: 'swoosh-quick.mp3', volume: 0.45, note: 'card flips' },
  { at: S.story.from + S4_LAND_AT, src: 'paper-page-turn.mp3', volume: 0.45, note: 'detail page lands' },
  // 5 · Editor: keyboard cut to each typing run, small pops as the preview card builds
  ...S5_TYPING.map((t, k) => ({ at: S.editor.from + t.from, src: 'keyboard.mp3', volume: 0.32, dur: t.to - t.from + 3, note: `typing field ${k + 1}` })),
  ...S5_LANDS.map((f, k) => ({ at: S.editor.from + f + 2, src: 'pop.mp3', volume: 0.3 - k * 0.03, note: `preview layer ${k + 1}` })),
  // 6 · Publish: click → impact (hit #1, song beat 74) → sparkle tail
  { at: S.publish.from + S6_CLICK, src: 'click-camera.mp3', volume: 0.6, note: 'Publish click' },
  { at: S.publish.from + S6_IMPACT, src: 'impact-epic-trailer.mp3', volume: 0.5, note: 'LIVE sticker slams (hit #1)' },
  { at: S.publish.from + S6_IMPACT + 12, src: 'sparkle-touch.mp3', volume: 0.35, note: 'sparkle tail' },
  // 7 · Sections: real switch, cut whoosh, rows land
  { at: S.sections.from + S7_CLICK, src: 'switch-tap.mp3', volume: 0.55, note: 'team switch on' },
  { at: S.sections.from + S7_CUT, src: 'transition-soft.mp3', volume: 0.32, note: 'cut to the public page' },
  ...S7_LANDS.map((f, k) => ({ at: S.sections.from + f, src: 'hit-weak.mp3', volume: 0.4 - k * 0.06, note: `team row ${k + 1} lands` })),
  // 8 · Outro: riser → impact (hit #2, song beat 98, loudest SFX) → sparkle
  { at: S.outro.from + S8_STAMP - 35, src: 'riser-cine.mp3', volume: 0.4, note: 'riser into the group photo' },
  { at: S.outro.from + 22, src: 'whoosh-fast.mp3', volume: 0.35, note: 'cast flies in' },
  { at: S.outro.from + S8_STAMP, src: 'impact-deep-whoosh.mp3', volume: 0.6, note: 'wordmark stamps (hit #2)' },
  { at: S.outro.from + S8_STAMP + 25, src: 'sparkle.mp3', volume: 0.5, note: 'rule sparkle' },
];

export const BGM_SRC = 'audio/bgm/cat-walk-promo.wav';
export const BGM_VOLUME = 0.34;

export const Soundtrack: React.FC<{ bgm: boolean }> = ({ bgm }) => (
  <>
    {bgm ? (
      // Pre-trimmed bed (scripts/bgm-fade.mjs): starts at song beat 18 + the measured output offset, fades baked in.
      <Audio src={staticFile(BGM_SRC)} volume={BGM_VOLUME} />
    ) : null}
    {SFX.map((p, i) => (
      <Sequence key={i} name={`sfx ${p.note}`} from={Math.max(0, fromOf(p))} durationInFrames={p.dur ?? 150} layout="none">
        <Audio src={staticFile(`audio/sfx/${p.src}`)} volume={p.volume} />
      </Sequence>
    ))}
  </>
);
