// SENTINEL GRID — config.js
// All tuning numbers live here: canvas, grid, towers, enemies, waves.
(function () {
  'use strict';
  window.SG = window.SG || {};
  var SG = window.SG;

  SG.CANVAS_W = 1280;
  SG.CANVAS_H = 720;
  SG.GRID_COLS = 16;
  SG.GRID_ROWS = 10;
  SG.CELL = 60;
  SG.GRID_X = 24;
  SG.GRID_Y = 96;
  SG.PANEL_X = 1000;
  SG.PANEL_W = 256;
  SG.HUD_H = 88;

  SG.START_GOLD = 200;
  SG.START_LIVES = 20;
  SG.TOTAL_WAVES = 20;
  SG.SELL_REFUND = 0.70;

  // Tower definitions. range in cells, rate in shots per second.
  SG.TOWERS = {
    arrow:  { key: 'arrow',  name: 'Arrow',  cost: 50,  range: 2.2, damage: 8,  rate: 2.0, color: '#4ade80', dark: '#166534', desc: 'Cheap, fast shots' },
    cannon: { key: 'cannon', name: 'Cannon', cost: 100, range: 1.8, damage: 22, rate: 0.7, splash: 0.9, color: '#fb923c', dark: '#9a3412', desc: 'Splash damage' },
    frost:  { key: 'frost',  name: 'Frost',  cost: 75,  range: 2.0, damage: 3,  rate: 1.0, slowPct: 0.45, slowSecs: 1.2, color: '#22d3ee', dark: '#155e75', desc: 'Slows enemies' },
    sniper: { key: 'sniper', name: 'Sniper', cost: 150, range: 4.0, damage: 45, rate: 0.4, color: '#c084fc', dark: '#6b21a8', desc: 'Long range, huge hit' }
  };
  SG.TOWER_ORDER = ['arrow', 'cannon', 'frost', 'sniper'];

  // Upgrade multipliers relative to level 1.
  SG.UPGRADES = [
    null,
    { costMult: 0,    dmgMult: 1.0, rangeAdd: 0,   rateMult: 1.00 },
    { costMult: 0.6,  dmgMult: 1.6, rangeAdd: 0.3, rateMult: 1.10 },
    { costMult: 1.0,  dmgMult: 2.5, rangeAdd: 0.6, rateMult: 1.20 }
  ];

  SG.ENEMIES = {
    crawler: { key: 'crawler', name: 'Crawler', hp: 30, speed: 42, gold: 6,  lives: 1, armor: 0, color: '#a3e635', radius: 13, shape: 'circle' },
    dart:    { key: 'dart',    name: 'Dart',    hp: 18, speed: 72, gold: 7,  lives: 1, armor: 0, color: '#facc15', radius: 10, shape: 'tri' },
    mite:    { key: 'mite',    name: 'Mite',    hp: 9,  speed: 55, gold: 3,  lives: 1, armor: 0, color: '#f87171', radius: 7,  shape: 'circle' },
    plate:   { key: 'plate',   name: 'Plate',   hp: 95, speed: 30, gold: 12, lives: 2, armor: 4, color: '#94a3b8', radius: 14, shape: 'square' },
    boss:    { key: 'boss',    name: 'Bulwark', hp: 900, speed: 24, gold: 150, lives: 5, armor: 2, color: '#e879f9', radius: 22, shape: 'hex' }
  };

  // Build one wave's spawn list. Returns array of enemy keys.
  SG.buildWave = function (wave) {
    var list = [];
    var i, n = 6 + wave * 2;
    for (i = 0; i < n; i++) {
      var r = Math.random();
      if (wave >= 6 && r < 0.16) list.push('plate');
      else if (wave >= 4 && r < 0.38) list.push('mite');
      else if (wave >= 3 && r < 0.58) list.push('dart');
      else list.push('crawler');
    }
    // Mites travel in packs: duplicate a few mite entries.
    if (wave >= 4) {
      for (i = 0; i < wave; i++) list.push('mite');
    }
    if (wave % 5 === 0) list.push('boss');
    return list;
  };

  SG.waveHpMult = function (wave) {
    return Math.pow(1.15, wave - 1) + (wave - 1) * 0.05;
  };
  SG.waveSpeedMult = function (wave) {
    return Math.min(1.35, 1 + (wave - 1) * 0.02);
  };
  SG.spawnInterval = function (wave) {
    return Math.max(0.35, 0.95 - wave * 0.03);
  };
  SG.waveClearBonus = function (wave) {
    return 25 + wave * 5;
  };
})();
