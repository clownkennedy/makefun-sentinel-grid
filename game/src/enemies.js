// SENTINEL GRID — enemies.js
// Enemy creation and movement along the road.
(function () {
  'use strict';
  var SG = window.SG;

  SG.makeEnemy = function (kind, wave) {
    var def = SG.ENEMIES[kind];
    var start = SG.PATH_POINTS[0];
    return {
      kind: kind, def: def,
      x: start.x, y: start.y,
      wp: 1, // next waypoint index
      hp: Math.round(def.hp * SG.waveHpMult(wave)),
      maxHp: Math.round(def.hp * SG.waveHpMult(wave)),
      speed: def.speed * SG.waveSpeedMult(wave),
      slowUntil: 0, slowPct: 0,
      dist: 0, dead: false, leaked: false,
      wobble: Math.random() * Math.PI * 2
    };
  };

  // Move one enemy dt seconds. Returns 'leaked' when it reaches the core.
  SG.updateEnemy = function (e, dt, now) {
    if (e.dead) return null;
    var slow = (now < e.slowUntil) ? (1 - e.slowPct) : 1;
    e.slowed = now < e.slowUntil;
    var step = e.speed * slow * dt;
    while (step > 0 && e.wp < SG.PATH_POINTS.length) {
      var t = SG.PATH_POINTS[e.wp];
      var dx = t.x - e.x, dy = t.y - e.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d <= step) {
        e.x = t.x; e.y = t.y; e.dist += d; step -= d; e.wp++;
      } else {
        e.x += dx / d * step; e.y += dy / d * step; e.dist += step; step = 0;
      }
    }
    if (e.wp >= SG.PATH_POINTS.length) { e.leaked = true; return 'leaked'; }
    return null;
  };

  SG.applySlow = function (e, pct, secs, now) {
    e.slowPct = Math.max(e.slowPct, pct);
    e.slowUntil = now + secs;
  };

  // Damage after flat armor. Returns true if the enemy died.
  SG.damageEnemy = function (e, raw) {
    var dmg = Math.max(1, Math.round(raw - e.def.armor));
    e.hp -= dmg;
    if (e.hp <= 0) { e.dead = true; return true; }
    return false;
  };
})();
