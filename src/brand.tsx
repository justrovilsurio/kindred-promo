// Kindred visual system for the promo: tokens copied from the app's src/styles/tokens.css, the app's own
// brand marks (src/public/components.tsx), fonts, and the shared caption / sticker / logo pieces.
import React from 'react';
import { Img, staticFile } from 'remotion';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadCaladea } from '@remotion/google-fonts/Caladea';

const anton = loadAnton('normal', { weights: ['400'], subsets: ['latin'] });
const caladea = loadCaladea('normal', { weights: ['400', '700'], subsets: ['latin'] });

export const FONT = { display: `${anton.fontFamily}, "Arial Narrow", sans-serif`, text: `${caladea.fontFamily}, Cambria, Georgia, serif` };

export const K = {
  lime: '#cadf42', peri: '#c0c4fe', iris: '#8d92fd', navy: '#151f30', paper: '#f5f5f6', surface: '#ffffff',
  inkMuted: '#535a69', line: '#dfe0e6', doodle: '#b4b6be', limeSoft: '#eff5c8', brandSoft: '#e6e7ff', navy2: '#2a3550',
  liveInk: '#3d4b05', liveBg: '#e4efa6', draftInk: '#7a4d06', draftBg: '#fbeacb',
  shadowCard: '0 1px 2px rgba(21,31,48,0.06), 0 10px 28px -12px rgba(21,31,48,0.16)',
  shadowFloat: '0 24px 64px rgba(21,31,48,0.2), 0 2px 8px rgba(21,31,48,0.08)',
} as const;

export const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

// Motion tokens (spec §3): the app's kd-drop curve for landings, snappy push for slides.
export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

// ───────── Brand marks, verbatim paths from src/public/components.tsx ─────────
export const HERO_BLOB = 'M200 8C233.4 8 260 48.3 292.9 72.2C325.7 96.1 372.3 108.9 382.6 140.7C392.9 172.5 362.8 210.2 350.3 248.8C337.7 287.5 339.9 335.7 312.9 355.3C285.8 375 240.6 358 200 358C159.4 358 114.2 375 87.1 355.3C60.1 335.7 62.3 287.5 49.7 248.8C37.2 210.2 7.1 172.5 17.4 140.7C27.7 108.9 74.3 96.1 107.1 72.2C140 48.3 166.6 8 200 8Z';

export const Paw: React.FC<{ size: number; color: string; style?: React.CSSProperties }> = ({ size, color, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
    <ellipse cx="7.6" cy="8.4" rx="2.1" ry="2.6" transform="rotate(-12 7.6 8.4)" />
    <ellipse cx="16.4" cy="8.4" rx="2.1" ry="2.6" transform="rotate(12 16.4 8.4)" />
    <ellipse cx="4" cy="13.2" rx="1.9" ry="2.3" transform="rotate(-28 4 13.2)" />
    <ellipse cx="20" cy="13.2" rx="1.9" ry="2.3" transform="rotate(28 20 13.2)" />
    <path d="M12 12.2c-3 0-5.4 3.1-5.4 5.3 0 1.6 1.2 2.6 2.8 2.6 1.1 0 1.7-.5 2.6-.5s1.5.5 2.6.5c1.6 0 2.8-1 2.8-2.6 0-2.2-2.4-5.3-5.4-5.3z" />
  </svg>
);

export const Heart: React.FC<{ width: number; color: string; style?: React.CSSProperties }> = ({ width, color, style }) => (
  <svg width={width} height={width * 0.9} viewBox="0 0 40 36" style={style}>
    <path fill={color} d="M20 35C8 26 1 19.5 1 11.2 1 5.5 5.3 1 10.8 1c3.9 0 7.2 2.3 9.2 5.6C22 3.3 25.3 1 29.2 1 34.7 1 39 5.5 39 11.2 39 19.5 32 26 20 35z" />
  </svg>
);

export const Bone: React.FC<{ width: number; color: string; style?: React.CSSProperties }> = ({ width, color, style }) => (
  <svg width={width} height={width / 2} viewBox="0 0 120 60" fill="none" stroke={color} strokeWidth={4} strokeLinejoin="round" style={style}>
    <path d="M30 22H90a10 10 0 1 1 13 9.6A10 10 0 1 1 90 38H30a10 10 0 1 1-13-9.6A10 10 0 1 1 30 22z" />
  </svg>
);

// The user's chosen logo: Saffron the kitten in a round sticker with a lime ring (styleframes f1/f3).
export const CatLogo: React.FC<{ size: number; ring?: number; style?: React.CSSProperties }> = ({ size, ring, style }) => {
  const r = ring ?? Math.max(4, size * 0.05);
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flex: 'none', boxShadow: `0 0 0 ${r}px ${K.lime}, 0 ${size * 0.1}px ${size * 0.25}px rgba(0,0,0,0.28)`, ...style }}>
      <Img src={staticFile('photos/saffron-kitten.webp')} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 35%' }} />
    </div>
  );
};

// Round sticker with a paper ring + float shadow (the app's hero logo badge treatment).
export const Sticker: React.FC<{ size: number; bg: string; children: React.ReactNode; ring?: number; style?: React.CSSProperties }> = ({ size, bg, children, ring = 10, style }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', background: bg, display: 'grid', placeItems: 'center',
    boxShadow: `0 0 0 ${ring}px ${K.paper}, ${K.shadowFloat}`, ...style,
  }}>{children}</div>
);

export const LiveSticker: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <Sticker size={size} bg={K.lime} ring={size * 0.05} style={style}>
    <div style={{ textAlign: 'center', color: K.navy }}>
      <Paw size={size * 0.22} color={K.navy} style={{ display: 'block', margin: '0 auto' }} />
      <div style={{ fontFamily: FONT.display, fontSize: size * 0.3, lineHeight: 1, marginTop: size * 0.01 }}>LIVE</div>
    </div>
  </Sticker>
);

// Narration caption: navy pill, Caladea 56px (Q11: ≥5% of frame height), bottom centre.
export const Caption: React.FC<{ text: string; p: number }> = ({ text, p }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 64, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
    <div style={{
      fontFamily: FONT.text, fontSize: 56, lineHeight: 1.2, color: K.paper, background: K.navy, padding: '18px 40px 20px',
      borderRadius: 999, boxShadow: '0 18px 40px rgba(21,31,48,0.28)', opacity: clamp01(p * 1.6),
      transform: `translateY(${((1 - p) * 24).toFixed(2)}px)`, whiteSpace: 'nowrap',
    }}>{text}</div>
  </div>
);
