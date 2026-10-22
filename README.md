# Kindred promo

A Remotion promo video for Kindred, a page builder for animal-rescue groups.

```sh
npm install
npm run dev      # Remotion Studio
npm run render   # out/promo.mp4
```

## Audio not included

Music and sound effects are not committed because their licenses don't allow redistribution.
Before rendering, add them under `public/audio/`:

- `public/audio/bgm/cat-walk.mp3`: "Cat Walk" by Arulo, from [Mixkit](https://mixkit.co/free-stock-music/).
  The render plays `public/audio/bgm/cat-walk-promo.wav`, a trimmed cut of the track with its fades
  baked in by `scripts/bgm-fade.mjs`.
- `public/audio/sfx/*.mp3`: the cue names used in `src/audio.tsx`.

## License

The code is under the MIT license. The images are not licensed for reuse. See [LICENSE](LICENSE).
