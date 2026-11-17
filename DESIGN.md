# SENTINEL GRID — Design

## Concept
SENTINEL GRID is an original 2D tower-defense game. The player is the
warden of a grid outpost. Waves of rogue machines ("drifters") march
along a single winding road toward the core at the far end. The player
builds and upgrades sentinel towers on the grass beside the road,
earns gold for every machine destroyed, and must survive 20 waves.
If 20 lives are lost, the core falls. Clear wave 20 and the outpost
holds — victory, with an endless mode offered afterwards.

## Genre and feel
Tower defense, mouse-first, keyboard-assisted. Calm planning between
waves, tense action during waves. Bright, readable, toy-like art:
flat colours, chunky shapes, glowing projectiles, small particle
bursts. No borrowed characters, names, art or music — everything is
drawn with canvas primitives and all sound is synthesised.

## Map
- Canvas 1280 x 720. Top bar (0–88 px) is the HUD. Right panel
  (1000–1264 px) is the shop / selected-tower panel.
- Play grid: 16 columns x 10 rows, cell 60 px, origin (24, 96).
  Grid occupies 960 x 600 px.
- One fixed winding road, entered from the left edge and exiting at
  the bottom-right:
  (-1,1) -> (2,1) -> (2,4) -> (13,4) -> (13,7) -> (6,7) -> (6,9)
  -> (15,9) -> exit.
  Road cells cannot be built on; every other cell is grass and
  buildable. The road is long (about 55 cells of travel), so range
  and placement along bends matter.

## Towers (4)
All towers fire automatically at enemies in range. Range is in cells.

| Tower | Cost | Range | Damage | Rate | Special |
|---|---|---|---|---|---|
| Arrow | 50 | 2.2 | 8 | 2.0/s | Cheap, fast, single target |
| Cannon | 100 | 1.8 | 22 | 0.7/s | Splash 0.9 cell radius |
| Frost | 75 | 2.0 | 3 | 1.0/s | Slows 45% for 1.2 s |
| Sniper | 150 | 4.0 | 45 | 0.4/s | Very long range, big hits |

- Upgrade: level 2 costs 60% of base, level 3 costs 100% of base.
  Each level: damage x1.6 (level 2) / x2.5 (level 3, vs level 1),
  range +0.3 per level, rate +10% per level. Max level 3.
- Sell: refunds 70% of all gold invested in that tower.
- Visual identity: Arrow = green triangle turret on a round base;
  Cannon = orange square barrel; Frost = cyan diamond crystal;
  Sniper = purple long barrel with a scope dot. Level shown by
  pips under the tower and a brighter ring.

## Enemies (5)
- Normal ("crawler"): balanced speed and HP. Grey-green circle.
- Fast ("dart"): 1.7x speed, low HP. Small yellow triangle.
- Armored ("plate"): slow, high HP, flat armor 4 per hit (so fast
  small hits are weak against it, big hits are good). Steel square.
- Swarm ("mite"): very weak, spawns in groups of 3–5, fast-ish.
  Tiny red dots.
- Boss ("bulwark"): every 5th wave (5, 10, 15, 20). Huge HP,
  slow, costs 5 lives if it leaks (others cost 1, armored 2).
  Large magenta hexagon with a crown spike.

HP scales with wave: base HP x 1.18^(wave-1), plus a flat wave
bonus. Speed scales gently (+2% per wave, capped). Composition
shifts as waves rise: early waves are crawlers, darts appear from
wave 3, mites from wave 4, plates from wave 6, bosses on 5/10/15/20.

## Waves and economy
- 20 waves. Wave size grows: about 6 + 2*wave enemies, plus boss
  on multiples of 5. Spawn interval shrinks slightly per wave.
- Gold: start 200. Kill reward 6 + wave (boss 150, plate 12,
  dart 7, mite 3). Wave-clear bonus 25 + 5*wave. Interest: none —
  spending early is the strategy.
- Lives: 20. A leaked enemy costs 1 life (plate 2, boss 5).
- Score: kills x10 + wave-clear bonus x10 + remaining lives x100
  on victory. Score is shown live in the HUD.
- After wave 20 is cleared: VICTORY screen, with an option to
  keep playing endless waves (difficulty keeps scaling) or restart.
- Balance target: waves 1–3 are easy with 2–3 arrow towers;
  wave 5 boss needs a cannon or sniper; wave 20 boss is hard but
  beatable with a full upgraded line along the bends. Tested by
  simulation in the smoke test (see BUILD-LOG.md).

## Controls
- Mouse: click a grass cell to build the selected tower; click a
  built tower to select it (panel shows upgrade / sell); click a
  tower card in the right panel to select that tower type.
- Keys 1–4: select Arrow / Cannon / Frost / Sniper.
- Space: start the next wave when idle; during a wave, toggle
  speed 1x / 2x.
- P: pause. Esc: cancel current selection. M: mute. R: restart
  (from end screens, or any time). Enter: start / confirm on
  title and end screens.
- Buttons in the right panel (mouse): Start Wave, Speed 1x/2x,
  Pause, Mute, Restart — all clickable, so the game is fully
  playable with the mouse alone.

## HUD and screens
- Top bar: gold, lives (hearts), wave (current / 20), score,
  enemies remaining in the current wave, speed and pause state.
- Right panel: four tower cards (name, cost, damage, range),
  selected-tower detail (level, damage, range, upgrade cost,
  sell value), wave progress bar, and the action buttons.
- Title screen: game name, one-line goal, controls, "Click or
  press Enter to play". The grid and road are visible behind it.
- Wave-clear banner: "WAVE N CLEARED! +bonus gold" for ~2 s.
- Victory screen: "OUTPOST HELD!", final score, endless / restart.
- Defeat screen: "THE CORE HAS FALLEN", wave reached, score,
  restart. Both end screens have a Restart button.
- Feedback everywhere: range preview circle when a tower type is
  selected and the mouse hovers a buildable cell; red tint on
  invalid cells; gold flash on kill; damage numbers are skipped
  (kept readable) in favour of hit particles and HP bars.

## Visuals
- Canvas 2D only, no images. Grass: two-tone checker with subtle
  speckles (seeded, drawn once to an offscreen canvas). Road:
  sandy brown with dashed centre line and darker edges. Core:
  a glowing cyan diamond at the exit. Towers and enemies are
  distinct silhouettes and colours, each with a small HP bar
  (enemies) or level pips (towers). Projectiles: small glowing
  dots / lines per tower type. Particles: 6–10 sparks on death,
  small ring on splash. Screen shake: tiny, only on boss death
  and on a leak.

## Audio
- Optional WebAudio, no audio files. Short synthesised beeps:
  shoot (short square blip, pitch per tower), enemy death
  (noise-ish descending blip), leak (low buzz), wave clear
  (two-note chime), victory (four-note arpeggio), defeat
  (descending notes). A Mute button and M key toggle it; if
  AudioContext is unavailable the game runs silently and never
  errors. Audio starts only after the first user gesture.

## Files (all under game/, no build step, no network)
- game/index.html — page, canvas, HUD shell, loads the scripts below.
- game/src/config.js — constants, tower/enemy/wave definitions.
- game/src/level.js — grid, road path, cell helpers.
- game/src/audio.js — WebAudio synth effects + mute.
- game/src/enemies.js — enemy creation, movement, slow/armor.
- game/src/towers.js — tower creation, targeting, firing, upgrade/sell.
- game/src/effects.js — projectiles, particles, floating text.
- game/src/game.js — game state, waves, economy, win/lose, update loop.
- game/src/render.js — all canvas drawing (map, towers, enemies, HUD, panels, screens).
- game/src/input.js — mouse + keyboard handling, panel buttons.
- game/src/main.js — bootstrap, shot modes for screenshots, main loop.
- game/src/shots.js — screenshot presets (?shot=start|play|boss|end).

## Screenshot plan (1280x720, screenshots/)
- 1-start.png — title screen over the map.
- 2-play.png — mid-wave, towers placed, enemies on the road, HUD live.
- 3-boss.png — boss wave (wave 10/20) with many towers and projectiles.
- 4-end.png — victory screen with final score.
