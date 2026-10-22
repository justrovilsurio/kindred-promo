# Kindred promo: design spec (co-creation, approved 2026-10-22)

The source of truth for production and for the independent final review. Everything below "Approved by user"
was confirmed in conversation. Items marked *production detail* are the producer's own decisions made
after release, within the approved plan.

## 1. Product brief (approved)

| Item | Decision | Evidence |
|---|---|---|
| Product | Kindred: page builder for animal-rescue groups; each group gets one public page plus a private dashboard | the app's `README.md` |
| Audience | Small volunteer-run rescue groups (founder, drivers, vet liaison), no web skills | seed team copy |
| Purpose | Win rescue groups over: "your rescue gets a beautiful page in minutes" | user answer 1 |
| Core selling points | (1) every animal gets its own story page (2) publish only when ready (3) looks good with no design work | draft/pending/live flow, preview, themes |
| Must-show features | animal gallery, adoption filters, animal detail/story, editor + live preview card, publishing (Draft → Live), **section on/off switches** (user: "important") | routes in `src/App.tsx`, user answer |
| Length / format / language | ~40 s (35 s brief + section-switch shot), 1920×1080, 30 fps, English | user approved |
| Music | Upbeat BGM + cinematic SFX, no voice-over; deliver a version with BGM and one without | user approved |
| Data | Sample group "Second Wind Rescue", fictional animals/volunteers kept as-is; user holds rights to `public/photos/*`; `hello@secondwind.ph` kept | user answer 2 |
| CTA | No live domain yet: closing line "Kindred · Pages for animal rescues." | default stated, not objected to |
| Logo | No Kindred logo exists; user chose a cat photo → `saffron-kitten.webp` in a round sticker with lime ring | user instruction |

## 2. Requirements → execution decisions (approved)

| Requirement | Affects | Decision |
|---|---|---|
| Win rescue groups | structure, CTA | payoff first (warm, beautiful page), then how easy; end on brand + tagline |
| Busy volunteers | pace, feature order | few screens with room to breathe; dashboard framed as simple: one form, one Publish |
| Feature list | screens, shots | Public page → animal stories → filters → editor → publish → section switches → brand close |
| 40 s, 16:9, English | shot count, copy | 8 shots + 2 title cards; captions only on feature shots |
| Upbeat BGM | rhythm | Cat Walk (House), beat-grid cut points, ≤3 frame-level hits (2 used) |
| Data | capture | real sample data, no mock or blur |
| Look | everything | Kindred tokens only; no separate promo skin |

## 3. Visual direction: A · Sticker Poster (approved)

Tokens copied from the app's `src/styles/tokens.css` and computed styles:

- Colour: lime `#cadf42`, periwinkle `#c0c4fe`, iris `#8d92fd`, navy `#151f30`, paper `#f5f5f6`, surface `#ffffff`,
  ink-muted `#535a69`, doodle `#b4b6be`, lime-soft `#eff5c8`, brand-soft `#e6e7ff`; status live ink/bg `#3d4b05/#e4efa6`,
  draft `#7a4d06/#fbeacb`.
- Type: display **Anton** 400 (h1 112px/0.98, h2 64px, h3 30px; tracking −0.005em), text **Caladea** 400/700
  (17px/24px body). Video sizes scale these; captions ≥ 54 px (5% of frame height).
- Shape: radius 10/20/32/999; cards white with `--shadow-card`, floating elements `--shadow-float`
  (`0 24px 64px rgba(21,31,48,.2), 0 2px 8px rgba(21,31,48,.08)`).
- Brand marks (verbatim from `src/public/components.tsx`): HERO_BLOB five-lobed path, PawMark, HeartShape, BoneShape;
  partner blob offset `translate(14px,10px) rotate(-11deg) scale(1.03)`.
- Stickers: round, paper ring (`0 0 0 10px paper`) + float shadow.
- Motion tokens (preset "playful/cheerful" tuned toward "friendly"): main duration ~24f, entrance
  `cubic-bezier(0.34,1.56,0.64,1)` (the site's own `kd-drop` curve), overshoot ≤1.08, squash ≤0.15;
  push/slide `cubic-bezier(0.16,1,0.3,1)`; no handheld shake; at most one light accent per shot.
- Styleframes: `spec/styleframes/{f1,f2,f3}.png`.

## 4. Feature → shot mapping (approved)

| # | Feature | Card · style | Backup |
|---|---|---|---|
| 1 | Opening | `type-entrance-moves · letter-drop-physics` | `blur-slide` |
| 2 | Animal gallery | `deck-deal-flyin` (re-skinned to paper/lime) | `card-stack` |
| 3 | Filters | `type-and-filter` (Dogs chip + Pasig → Mango) | `chip-grid-single-select-blackout` |
| 4 | Animal story | `card-flip-reveal` | `element-body-moves · contact-shadow-lift` |
| T | Title cards ×2 | `paper-title-card` (re-skinned to lime/periwinkle + Anton) | `blur-slide` |
| 5 | Editor | `product-card-progressive-assemble` | `row-embed` |
| 6 | Publish | `slam-entrance-moves · impact-burst-kit` | `draw-svg-trace` |
| 7 | Section switches | `row-embed` | `interaction/segmented-thumb-hero` |
| 8 | Closing | `outro-group-photo-launch` | `logo-shrink-wordmark-lockup` |
| — | Seams | `bottom-push-stack-wipe` | `shot-transitions · whip-pan` |

## 5. Storyboard (approved; frame numbers re-anchored to the beat grid, see §6)

| # | Video beats | Frames | Action | Source | Copy | SFX |
|---|---|---|---|---|---|---|
| 1 | v0–v10 | 0–138 | Lime field; "Every rescue has a story." letters drop, bounce, settle; blob photo + partner blob swing in, cat-logo sticker pops; hold ≥1 s | styleframe f1 | headline; small "Kindred" + cat logo | soft drop thuds, sticker pop |
| ↳ | seam v10 | | paper pushes lime up | | | whoosh |
| 2 | v10–v22 | 138–305 | Orbit on a stack of 7 real adoption cards; dealt one by one into their real grid slots on For Adoption; 0.5 s rest | `/second-wind/adopt` cards + empty-grid backplate | "Every animal gets its own card." | card flicks, gradually quieter |
| 3 | v22–v33 | 305–457 | Cursor taps **Dogs**, picks **Pasig**; grid converges to Mango; cursor clicks him (human pace) | filtered states | "Adopters filter by type, age and place." | real clicks |
| 4 | v33–v42 | 457–582 | Mango's card flips over into his detail page; slow push-in on "Personality"; hold | `/second-wind/adopt/mango` | "Every animal gets a full story page." | flip whoosh |
| ↳ | seam v42 | | periwinkle pushes up | | | whoosh |
| T1 | v42–v46 | 582–637 | Periwinkle; words press on in Anton, one word lime | tokens | "Your team runs it from **one** dashboard." | — |
| 5 | v46–v54 | 637–748 | Juniper draft editor; "On your page" preview builds photo → name → "Rescued 9 Oct 2026" as fields fill | `/dashboard/edit/rescues/juniper` | "Fill in a form. See the card as you go." | keyboard |
| 6 | v54–v62 | 748–858 | Cursor clicks **Publish** (v55); Draft → Published; lime **LIVE** sticker slams (v56, **big hit #1**); toast slides up; 0.5 s hold | same editor, before/after | "One tap. It's live." on the periwinkle panel | click → impact → sparkle |
| ↳ | seam v62 | | lime pushes up | | | whoosh |
| T2 | v62–v66 | 858–914 | Lime; words press on | tokens | "Show only the sections your rescue needs." | — |
| 7 | v66–v76 | 914–1052 | Close-up: "Meet our team" switch flips on → public page: Team section drops in, rotateX flattens, embeds with lime seam; hold | `/dashboard` sections panel → `/second-wind` | "Sections switch on and off. The order never changes." | real switch click, soft land |
| ↳ | seam v76 | | navy pushes up | | | riser starts |
| 8 | v76–v88 | 1052–1218 | Adoption cards, LIVE sticker, Team section, Dogs chip fly in around cat logo + "Kindred"; wordmark lands v80 (**big hit #2**); tagline v82; hold to end | styleframe f3 | "Kindred" · "Pages for animal rescues." | riser → impact → sparkle |

Checks: each card is the featured move exactly once (the seam technique is not a featured move); 2 frame-level hits,
24 beats apart (≥16); brand holds ≥1 s; group moves end with 0.5 s rest; captions ≥54 px, none on title cards/outro.

## 6. Music & beat grid (production detail)

- Track: `cat-walk.mp3` (Arulo, House, Mixkit Stock Music Free License; https://assets.mixkit.co/music/371/371.mp3).
- Grid: **130.00 BPM**, T = 0.4615412 s, t0 = 0.23595 s; kick onsets at phase 0.232 s in every drum section, off-beat
  hats at +T/2 (0.459 s) → 1x grid. Coverage 248/248 non-silent beats within ±35 ms, mean 13 ms. Analysis:
  `analysis/beat_data.json`, `analysis/grid_drift.json`, `scripts/{analyze-beat,grid-check,phase-check}.mjs`.
- Song structure: intro b0–31 (quiet), build b32–63, drop b64–127, breakdown b128–191, drop b192–239.
- **Audio starts at song beat 18** (8.5437 s) so video beat v = song beat − 18:
  big hit #1 v56 = song b74 (strongest kick in the track, 5.15); big hit #2 v80 = song b98 (3.49, top-10);
  the drop (song b64) lands on the cut into shot 5 (v46). Opening sits in the quiet intro, the gallery deal rides the build.
- Cut points: `beatF(v) = round(v × T × 30)`; BGM fades out over the last 2 beats.
- Deliverables: `out/promo.mp4` (BGM) and `out/promo-nobgm.mp4` (SFX only) from the same timeline via the `bgm` prop.

## 7. Production notes — adaptations made during build (for the final review)

Approved plan unchanged in order, copy and shot styles; these are implementation-level adaptations:

| Shot | Adaptation | Why |
|---|---|---|
| 1 | Letter starts compressed (−8 + 34·(…)) so glyphs are already falling at f0 | avoid an empty-lime first second; still ever-denser stagger (R2) |
| 2 | Table = brand navy (not off-white); 7 real cards, no duplicated "extras"; harder deal acceleration (D + 6k − 0.45k(k−1)); gentle overhead instead of 26-card runway | the card's "never replace the dark table with white paper" pitfall; duplicated named animals would read as a bug |
| 3 | "Typing" beat becomes three real filter picks: **Dogs → Pasig → 1–3 years** (storyboard said Dogs → Pasig) | Dogs + Pasig leaves Mango **and Domino** in the real app; adding the age filter makes "Mango alone" true and matches the caption "type, age and place" |
| 4 | Single card; back face = real detail overlay; box grows card → panel during the flip; scrim = app's --scrim | semantic pairing card → page; storyboard asked for the full detail page |
| T1/T2 | Accent word marked with a partner-colour marker swipe (Anton has no italic); no fade-out, hard cut on beat | brand fonts; beat cuts |
| 5 | Field focus chip reads "Autosaved" (real app behaviour) instead of AUTOFILL; Breed field also typed ("Beagle") | truthful copy; continuity into shot 6's real draft capture |
| 6 | Sticker lands beside the "On your page" card; neighbours pushed = editor screen + publishing bar; headline line 2 lands with the slam | f2 layout |
| 7 | Switch redrawn with the app's exact .kd-switch geometry/tokens over real captures (the knob must travel); team section lands as two full-width rows (heading band, cards band) | row-embed needs rows; texture crops only |
| 8 | Elements cue +12f (static under the push seam); dust lime/periwinkle; cast = 6 adoption cards (Domino left out), Juniper preview card, Team section, Dogs chip, LIVE sticker | Q8: one representative per feature shot |
| Audio | BGM pre-trimmed to `public/audio/bgm/cat-walk-promo.wav` (starts at song beat 18 + 1.28f output offset; 0.2 s fade-in and fade-out from beat 86 baked in) | workbench manifest has no start offset/envelope; identical file in render and workbench |

Post-render measurements (2026-10-22, Remotion 4.0.484, AAC mp4):
- Output audio offset 1.27–1.29f (click-camera / switch-tap / pop cross-correlation) → `OUTPUT_AUDIO_OFFSET_F = 1.28`; residuals after compensation ≤0.4f.
- Cut/hit vs. nearest kick onset in the rendered mix: max |err| 2.41f (all ≤3f). Mix peak −3.9 dBFS.

Independent final review (2026-10-22) — blocking findings and fixes:
- Shot 3 filter bar flashed back to the unfiltered state for 3 frames in one master only (CSS `backgroundImage` not awaited by the renderer). All four filter-bar states are now mounted `<Img>` layers switched by opacity, so both masters render the same frames.
- Shot 6 toast covered "Unpublish". The bar is re-captured without the toast and the toast is captured on its own (`scripts/capture-toast.mjs`), then placed in the bar's free span. It rises in 4 frames after the slam.
- Shot 8 logo photo sat low in its ring because the inline `<Img>` inherited the 260px wordmark line box. Fixed with `display: block` in `CatLogo`.
- Shot 5 field schedule tightened. The preview card now finishes about frame 86 (about 0.8 s hold). The caption leaves (frame 47) before the breed/date row it covers is typed.
- Title cards: words start at frame 5, 2 frames apart, so each card is fully formed by about frame 26 and rests about 1 s.
- Open: Domino's photo, from the app's sample data, carries a visible photographer credit ("Michelle Wrighton"). Flagged for the client; not altered.
