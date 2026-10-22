// Title cards T1/T2 — paper-title-card (demos/typography/paper-title-card/PaperTitleCard.tsx), re-skinned to
// Sticker Poster: a saturated Kindred field (periwinkle / lime) instead of paper, Anton instead of serif.
// Kept: word-by-word letterpress (delay = start + 4i, 9f, bezier .2,.75,.3,1; scale 1.28→1 + blur 7→0),
// exactly one accent word per line (C2: the feature/benefit word), a rule that scales in as the closing signal.
// Adapted: Anton has no italic, so the accent word gets a marker swipe in the partner colour behind it;
// words start late in the push seam (see START); no fade-out —
// the card hard-cuts on the next beat.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { FONT, K, Paw } from '../brand';

type Word = { text: string; accent?: boolean; br?: boolean };
// Words start while the push seam is ~80% in and step 2f apart (demo: 4f), so each card is fully formed by
// ~f26 and rests ≥1 s before the beat cut (aesthetic-rules R1).
const START = 5;
const STEP = 2;

const Card: React.FC<{ bg: string; marker: string; words: Word[] }> = ({ bg, marker, words }) => {
  const frame = useCurrentFrame();
  const rule = interpolate(frame, [START + 8, START + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.3, 0, 0.2, 1) });
  return (
    <AbsoluteFill style={{ background: bg, justifyContent: 'center', alignItems: 'center' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 40%, rgba(255,255,255,0.22), rgba(255,255,255,0) 70%)' }} />
      <div style={{ textAlign: 'center', maxWidth: 1600 }}>
        <div style={{ fontFamily: FONT.display, fontSize: 156, lineHeight: 1.04, color: K.navy, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '0.24em' }}>
          {words.map((w, i) => {
            const delay = START + i * STEP;
            const t = interpolate(frame, [delay, delay + 9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.2, 0.75, 0.3, 1) });
            const swipe = interpolate(frame, [delay + 6, delay + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
            return (
              <React.Fragment key={i}>
                <span style={{ position: 'relative', display: 'inline-block', opacity: t, transform: `scale(${1.28 - 0.28 * t})`, filter: `blur(${((1 - t) * 7).toFixed(2)}px)` }}>
                  {w.accent ? (
                    <span style={{ position: 'absolute', left: '-0.08em', right: '-0.08em', top: '0.18em', bottom: '0.06em', background: marker, borderRadius: '0.12em 0.2em 0.16em 0.1em', transform: `scaleX(${swipe})`, transformOrigin: 'left center' }} />
                  ) : null}
                  <span style={{ position: 'relative' }}>{w.text}</span>
                </span>
                {w.br && <span style={{ flexBasis: '100%', height: 0 }} />}
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 44 }}>
          <div style={{ height: 6, width: 160, borderRadius: 3, background: K.navy, transform: `scaleX(${rule})`, transformOrigin: 'right center' }} />
          <Paw size={40} color={K.navy} style={{ opacity: rule, transform: `scale(${0.6 + 0.4 * rule})` }} />
          <div style={{ height: 6, width: 160, borderRadius: 3, background: K.navy, transform: `scaleX(${rule})`, transformOrigin: 'left center' }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const TitleCard1: React.FC = () => (
  <Card bg={K.peri} marker={K.lime} words={[
    { text: 'Your' }, { text: 'team' }, { text: 'runs' }, { text: 'it', br: true }, { text: 'from' }, { text: 'one', accent: true }, { text: 'dashboard.' },
  ]} />
);

export const TitleCard2: React.FC = () => (
  <Card bg={K.lime} marker={K.peri} words={[
    { text: 'Show' }, { text: 'only' }, { text: 'the' }, { text: 'sections', accent: true, br: true }, { text: 'your' }, { text: 'rescue' }, { text: 'needs.' },
  ]} />
);
