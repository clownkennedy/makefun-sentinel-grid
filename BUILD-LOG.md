# SENTINEL GRID — Build Log

Game: SENTINEL GRID (tower defense 2D, vanilla JS + canvas 2D)
Build dir: ~/workspace/makefun-sentinel-grid/
Target repo (parent to create): clownkennedy/makefun-sentinel-grid
Status: LOCAL BUILD ONLY — not submitted, no GitHub repo created,
no browser login, no wallet/keypair used, nothing paid.

## Steps taken
1. Read the kit rules and the submission requirements (how_to_submit)
   before writing any code. Followed the static-game constraints:
   all files under game/, no build step, no network requests, no
   external assets, no CDN.
2. Wrote DESIGN.md first (genre, mechanics, 4 towers, 5 enemy types,
   20 waves, economy, controls, visuals, audio, file layout).
3. Copied starter infra only, by `cp` without opening the files:
   main.ts, serve.ts, vendor/makefun-game.ts, LICENSE.
   No game code was taken from the starter or from any earlier
   makefun-* build directory (none were opened).
4. Wrote all game code from DESIGN.md, in small files with one job
   each: config, level, audio, enemies, towers, effects, game,
   render, input, shots, main (+ index.html). Vanilla JS, classic
   scripts, canvas 2D, system font only, synthesised WebAudio.
5. Revisions: fixed the enemy `slowed` flag (render used wall-clock
   instead of game time), removed an unused HUD variable, lowered
   wave HP scaling from 1.18 to 1.15 per wave after the first
   balance check, and fixed two visual defects found in the
   screenshots (core hidden under the side panel; tower-card text
   truncated). Screenshots were retaken after the fixes.
6. Wrote shots.json (4 shots), README.md (template), .makefun/
   owner.json (wallet 63T8hDszaYhRPuUWXdCctuCy5icDHWswjShi6dKzJb2X),
   this BUILD-LOG.md.

## Verification
- `node --check` on all 11 game JS files: OK.
- Smoke test (Node VM harness, /tmp/sg-smoke.js): waves 1-3 cleared
  with 0 leaks and 20/20 lives using 7 towers; a no-tower wave 1
  leaked 8 enemies (20 -> 12 lives); sell refunded 70% (35g on a
  50g tower); wave 5 list includes a boss; wave 20 spawns 67 enemies.
- Full auto-play (greedy builder, /tmp/sg-auto.js): all 20 waves
  cleared, VICTORY, final score 12070, 15/20 lives left. First
  leaks only on wave 20 — hard but beatable, as designed.
- `node serve.ts` + curl: root, index.html and all 11 JS files
  returned HTTP 200.
- Screenshots: headless chromium (chrome-headless-shell, --no-sandbox)
  at 1280x720, --virtual-time-budget=4000, via ?shot=start/play/
  boss/end. All 4 PNGs are 1280x720 and 129-155 KiB (under the
  256 KiB cap). Visually checked: title screen, mid-wave play with
  HUD + range preview, boss wave 10, victory screen.
- `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`: exit 0.
  out/ holds game/ (index.html + 11 src files), screenshots/
  (4 PNGs) and dossier.json (832,985 bytes, under the 1.5 MiB cap).

## Known issues / remaining
- None blocking. Minor: enemies walk ~60 px past the visible core
  before despawning (the leak point sits just past the last in-grid
  cell, under the side panel) — visually negligible.
- The game has no persistent high-score storage (by design: static
  files only, no localStorage dependency for core play).
- Audio only starts after the first user gesture (browser policy);
  the game runs silently before that and never errors without audio.
