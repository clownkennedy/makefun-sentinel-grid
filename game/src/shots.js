// SENTINEL GRID — shots.js
// Screenshot presets: ?shot=start | play | boss | end
// These only arrange a pre-built scene for screenshots; normal play
// never uses them.
(function () {
  'use strict';
  var SG = window.SG;

  function place(s, key, col, row, level) {
    var t = SG.makeTower(key, col, row);
    if (level) {
      t.level = level;
      t.invested = t.def.cost + (level >= 2 ? Math.round(t.def.cost * 0.6) : 0) + (level >= 3 ? t.def.cost : 0);
    }
    s.towers.push(t);
    return t;
  }

  SG.applyShot = function (s, shot) {
    if (!shot) return false;
    if (shot === 'start') {
      s.phase = 'title';
      return true;
    }
    if (shot === 'play') {
      s.phase = 'playing';
      s.gold = 342; s.score = 1240; s.wave = 4; s.kills = 87;
      place(s, 'arrow', 1, 2, 2); place(s, 'arrow', 3, 2, 1);
      place(s, 'cannon', 1, 3, 1); place(s, 'frost', 3, 5, 2);
      place(s, 'sniper', 4, 3, 1); place(s, 'arrow', 12, 3, 1);
      place(s, 'cannon', 12, 5, 2); place(s, 'frost', 5, 6, 1);
      s.spawnQueue = [];
      s.waveRunning = true;
      var kinds = ['crawler', 'dart', 'crawler', 'mite', 'dart', 'crawler', 'plate'];
      for (var i = 0; i < kinds.length; i++) {
        var e = SG.makeEnemy(kinds[i], 4);
        // Spread them along the first stretch of the road.
        var wp = 2 + i * 3;
        if (wp >= SG.PATH_POINTS.length) wp = SG.PATH_POINTS.length - 1;
        var pt = SG.PATH_POINTS[wp];
        e.x = pt.x; e.y = pt.y; e.wp = Math.min(wp + 1, SG.PATH_POINTS.length - 1);
        e.dist = wp * 60;
        s.enemies.push(e);
      }
      s.selectedType = 'cannon';
      s.hover = { col: 4, row: 5 };
      return true;
    }
    if (shot === 'boss') {
      s.phase = 'playing';
      s.gold = 218; s.score = 4860; s.wave = 10; s.kills = 312; s.lives = 14;
      place(s, 'arrow', 1, 2, 3); place(s, 'cannon', 3, 2, 2);
      place(s, 'cannon', 1, 3, 3); place(s, 'frost', 3, 5, 3);
      place(s, 'sniper', 4, 3, 2); place(s, 'sniper', 11, 3, 2);
      place(s, 'cannon', 12, 5, 3); place(s, 'frost', 5, 6, 2);
      place(s, 'arrow', 7, 6, 2); place(s, 'cannon', 5, 8, 2);
      place(s, 'frost', 13, 6, 2); place(s, 'arrow', 14, 8, 1);
      s.spawnQueue = ['crawler', 'mite', 'mite'];
      s.waveRunning = true;
      var boss = SG.makeEnemy('boss', 10);
      var bp = SG.PATH_POINTS[4];
      boss.x = bp.x; boss.y = bp.y; boss.wp = 5; boss.dist = 240;
      s.enemies.push(boss);
      for (var j = 0; j < 4; j++) {
        var m = SG.makeEnemy(j % 2 ? 'dart' : 'crawler', 10);
        var mp = SG.PATH_POINTS[2 + j];
        m.x = mp.x; m.y = mp.y; m.wp = 3 + j; m.dist = (2 + j) * 60;
        s.enemies.push(m);
      }
      // A couple of projectiles in flight for action.
      s.fx.projectiles.push({ x: 300, y: 220, target: boss, kind: 'sniper', damage: 45, splash: 0, slowPct: 0, slowSecs: 0, speed: 520, color: '#c084fc', dead: false });
      return true;
    }
    if (shot === 'end') {
      s.phase = 'victory';
      s.gold = 640; s.score = 12480; s.wave = 20; s.kills = 512; s.lives = 11;
      place(s, 'arrow', 1, 2, 3); place(s, 'cannon', 3, 2, 3);
      place(s, 'sniper', 4, 3, 3); place(s, 'frost', 3, 5, 3);
      return true;
    }
    return false;
  };
})();
