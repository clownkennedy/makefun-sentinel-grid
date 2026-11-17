// SENTINEL GRID — towers.js
// Tower creation, targeting, firing, upgrade and sell.
(function () {
  'use strict';
  var SG = window.SG;

  SG.makeTower = function (key, col, row) {
    var def = SG.TOWERS[key];
    var c = SG.cellCenter(col, row);
    return {
      key: key, def: def, col: col, row: row,
      x: c.x, y: c.y, level: 1, invested: def.cost,
      cooldown: 0, angle: -Math.PI / 2, flash: 0
    };
  };

  SG.towerStats = function (t) {
    var up = SG.UPGRADES[t.level];
    return {
      damage: Math.round(t.def.damage * up.dmgMult),
      range: (t.def.range + up.rangeAdd) * SG.CELL,
      rate: t.def.rate * up.rateMult,
      splash: t.def.splash ? t.def.splash * SG.CELL : 0
    };
  };

  SG.upgradeCost = function (t) {
    if (t.level >= 3) return null;
    return Math.round(t.def.cost * SG.UPGRADES[t.level + 1].costMult);
  };

  SG.sellValue = function (t) {
    return Math.floor(t.invested * SG.SELL_REFUND);
  };

  // Pick the enemy furthest along the road that is in range.
  SG.pickTarget = function (t, enemies, range) {
    var best = null;
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (e.dead || e.leaked) continue;
      var dx = e.x - t.x, dy = e.y - t.y;
      if (dx * dx + dy * dy > range * range) continue;
      if (!best || e.dist > best.dist) best = e;
    }
    return best;
  };

  // Fire one shot. Returns a projectile object or null.
  SG.fireTower = function (t, target, stats, now) {
    t.cooldown = 1 / stats.rate;
    t.angle = Math.atan2(target.y - t.y, target.x - t.x);
    t.flash = 0.12;
    SG.audio.shoot(t.key);
    return {
      x: t.x, y: t.y, target: target, kind: t.key,
      damage: stats.damage, splash: stats.splash || 0,
      slowPct: t.def.slowPct || 0, slowSecs: t.def.slowSecs || 0,
      speed: 520, color: t.def.color, dead: false
    };
  };
})();
