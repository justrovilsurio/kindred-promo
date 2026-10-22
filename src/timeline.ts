// Single source of truth for timing. Every shot boundary, caption and SFX pin derives from the beat grid
// (analysis/beat_data.json, spec §6). Video beat v = song beat − 18.
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const SOURCE_BEAT0 = 0.23595; // t0 of the song grid, seconds (audit value, never edited)
export const BEAT_INT = 0.4615412; // T, seconds (130.00 BPM)
export const SONG_START_BEAT = 18; // the music starts here so the big hits land on the strongest kicks
export const AUDIO_START_SEC = SOURCE_BEAT0 + SONG_START_BEAT * BEAT_INT;
export const OUTPUT_AUDIO_OFFSET_SEC = 0; // filled from the post-render check if the output track is offset

export const beatT = (v: number) => v * BEAT_INT + OUTPUT_AUDIO_OFFSET_SEC; // video beat → seconds
export const beatF = (v: number) => Math.round(beatT(v) * FPS); // video beat → frame

type Shot = { from: number; to: number; dur: number };
const shot = (a: number, b: number): Shot => ({ from: beatF(a), to: beatF(b), dur: beatF(b) - beatF(a) });

export const SHOTS = {
  open: shot(0, 10),
  deal: shot(10, 22),
  filter: shot(22, 33),
  story: shot(33, 42),
  tc1: shot(42, 46),
  editor: shot(46, 54), // the drop (song beat 64) lands on this cut
  publish: shot(54, 62),
  tc2: shot(62, 66),
  sections: shot(66, 76),
  outro: shot(76, 88),
} as const;
export type ShotKey = keyof typeof SHOTS;
export const ORDER: ShotKey[] = ['open', 'deal', 'filter', 'story', 'tc1', 'editor', 'publish', 'tc2', 'sections', 'outro'];
export const DURATION = SHOTS.outro.to;

// Frame-level hits (≤3, ≥16 beats apart): LIVE sticker slam and the wordmark stamp.
export const HITS = { live: beatF(56), wordmark: beatF(80) };
// Local frame of a video beat inside a shot.
export const local = (k: ShotKey, v: number) => beatF(v) - SHOTS[k].from;

// bottom-push-stack-wipe seams: the next shot pushes the previous one up, starting on the cut beat.
export const PUSH_DUR = 26;
export const PUSH_INTO: ShotKey[] = ['deal', 'tc1', 'tc2', 'outro'];

// Narration captions (feature shots only; none on title cards or the outro).
export const CAPTIONS: { shot: ShotKey; text: string; inAt: number; outAt?: number }[] = [
  { shot: 'deal', text: 'Every animal gets its own card.', inAt: 60 },
  { shot: 'filter', text: 'Adopters filter by type, age and place.', inAt: 10 },
  { shot: 'story', text: 'Every animal gets a full story page.', inAt: 30 },
  { shot: 'editor', text: 'Fill in a form. See the card as you go.', inAt: 8 },
  { shot: 'sections', text: 'Sections switch on and off. The order never changes.', inAt: 12 },
];
