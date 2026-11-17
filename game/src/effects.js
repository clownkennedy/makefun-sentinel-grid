// SENTINEL GRID — effects.js
// Projectiles, particles and floating text.
(function () {
  'use strict';
  var SG = window.SG;

  SG.makeEffects = function () {
    return { projectiles: [], particles: [], texts: [] };
  };

  SG.burst = function (fx, x, y, color, n, speed) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2;
      var s = (speed || 90) * (0.4 + Math.random() * 0.8);
      fx.particles.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.45, max: 0.45, color: color, r: 2 + Math.random() * 2.5 });
    }
  };

  SG.floatText = function (fx, x, y, text, color) {
    fx.texts.push({ x: x, y: y, text: text, color: color, life: 0.9, max: 0.9 });
  };

  SG.updateProjectiles = function (fx, enemies, dt, now, onKill) {
    var ps = fx.projectiles;
    for (var i = ps.length - 1; i >= 0; i--) {
      var p = ps[i];
      if (p.dead) { ps.splice(i, 1); continue; }
      var t = p.target;
      if (!t || t.dead || t.leaked) { p.dead = true; ps.splice(i, 1); continue; }
      var dx = t.x - p.x, dy = t.y - p.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      var step = p.speed * dt;
      if (d <= step + 6) {
        // Hit.
        if (p.splash > 0) {
          SG.burst(fx, t.x, t.y, '#fb923c', 10, 120);
          for (var j = 0; j < enemies.length; j++) {
            var e = enemies[j];
            if (e.dead || e.leaked) continue;
            var ex = e.x - t.x, ey = e.y - t.y;
            if (ex * ex + ey * ey <= p.splash * p.splash) {
              if (SG.damageEnemy(e, p.damage)) onKill(e);
            }
          }
        } else {
          if (SG.damageEnemy(t, p.damage)) onKill(t);
          if (p.slowPct > 0) SG.applySlow(t, p.slowPct, p.slowSecs, now);
          SG.burst(fx, t.x, t.y, p.color, 4, 60);
        }
        ps.splice(i, 1);
      } else {
        p.x += dx / d * step; p.y += dy / d * step;
      }
    }
  };

  SG.updateParticles = function (fx, dt) {
    var i;
    for (i = fx.particles.length - 1; i >= 0; i--) {
      var p = fx.particles[i];
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.92; p.vy *= 0.92;
      if (p.life <= 0) fx.particles.splice(i, 1);
    }
    for (i = fx.texts.length - 1; i >= 0; i--) {
      var t = fx.texts[i];
      t.life -= dt; t.y -= 28 * dt;
      if (t.life <= 0) fx.texts.splice(i, 1);
    }
  };
})();
