// Kindred promo — composition. Shot order, seams, captions and audio all derive from src/timeline.ts.
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { bezier, ramp, EASE } from './demos/_fixtures/Polish';
import { CAPTIONS, ORDER, PUSH_DUR, PUSH_INTO, SHOTS, ShotKey } from './timeline';
import { Caption, K } from './brand';
import { SHOT_COMPONENTS } from './shots';
import { Soundtrack } from './audio';

// bottom-push-stack-wipe: 26f heavy ease-out, both layers move together (rigid push), 56px contact shadow
// on the incoming edge + 2px lit lip (demos/transition/bottom-push-stack-wipe).
const heavyEaseOut = bezier(0.12, 0.9, 0.2, 1);
const H = 1080;

export const ShotLayer: React.FC<{ k: ShotKey }> = ({ k }) => {
  const frame = useCurrentFrame(); // local to the shot's Sequence
  const i = ORDER.indexOf(k);
  const next = ORDER[i + 1];
  const { dur } = SHOTS[k];
  const C = SHOT_COMPONENTS[k];
  let y = 0;
  let edge = 0;
  if (PUSH_INTO.includes(k)) {
    const p = ramp(frame, 0, PUSH_DUR, heavyEaseOut);
    y = (1 - p) * H;
    edge = p < 1 ? 1 : 0;
  }
  if (next && PUSH_INTO.includes(next) && frame >= dur) {
    y = -ramp(frame, dur, PUSH_DUR, heavyEaseOut) * H;
  }
  return (
    <AbsoluteFill style={{ transform: `translateY(${y.toFixed(2)}px)` }}>
      <C />
      {edge ? (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, top: -56, height: 56, background: 'linear-gradient(0deg, rgba(10,14,24,0.42), rgba(10,14,24,0))' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 2, background: 'rgba(255,255,255,0.5)' }} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

export const CaptionLayer: React.FC<{ k: ShotKey; text: string; inAt: number; outAt?: number }> = ({ k, text, inAt, outAt }) => {
  const frame = useCurrentFrame();
  const end = outAt ?? SHOTS[k].dur - 2;
  const p = ramp(frame, inAt, 12, EASE.out) * (1 - ramp(frame, end - 6, 6, EASE.exit));
  return p > 0.001 ? <Caption text={text} p={p} /> : null;
};

export const Main: React.FC<{ bgm: boolean }> = ({ bgm }) => (
  <AbsoluteFill style={{ background: K.navy }}>
    {ORDER.map((k, i) => {
      const next = ORDER[i + 1];
      const tail = next && PUSH_INTO.includes(next) ? PUSH_DUR : 0;
      return (
        <Sequence key={k} name={k} from={SHOTS[k].from} durationInFrames={SHOTS[k].dur + tail} layout="none">
          <ShotLayer k={k} />
        </Sequence>
      );
    })}
    {CAPTIONS.map((c) => (
      <Sequence key={c.text} name={`caption-${c.shot}`} from={SHOTS[c.shot].from} durationInFrames={SHOTS[c.shot].dur} layout="none">
        <CaptionLayer k={c.shot} text={c.text} inAt={c.inAt} outAt={c.outAt} />
      </Sequence>
    ))}
    <Soundtrack bgm={bgm} />
  </AbsoluteFill>
);
