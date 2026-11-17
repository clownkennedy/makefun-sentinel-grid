// SENTINEL GRID — render.js
// All canvas drawing: map, towers, enemies, HUD, panels, screens.
(function () {
  'use strict';
  var SG = window.SG;
  var grassCache = null;

  function buildGrass(ctx) {
    var c = document.createElement('canvas');
    c.width = SG.CANVAS_W; c.height = SG.CANVAS_H;
    var g = c.getContext('2d');
    g.fillStyle = '#14532d'; g.fillRect(0, 0, SG.CANVAS_W, SG.CANVAS_H);
    var seed = 12345;
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    for (var row = 0; row < SG.GRID_ROWS; row++) {
      for (var col = 0; col < SG.GRID_COLS; col++) {
        if (SG.isPathCell(col, row)) continue;
        g.fillStyle = (col + row) % 2 === 0 ? '#166534' : '#15803d';
        g.fillRect(SG.GRID_X + col * SG.CELL, SG.GRID_Y + row * SG.CELL, SG.CELL, SG.CELL);
        g.fillStyle = 'rgba(255,255,255,0.05)';
        for (var k = 0; k < 3; k++) {
          g.fillRect(SG.GRID_X + col * SG.CELL + rnd() * 52 + 4, SG.GRID_Y + row * SG.CELL + rnd() * 52 + 4, 3, 6);
        }
      }
    }
    grassCache = c;
  }

  function drawRoad(ctx) {
    ctx.fillStyle = '#a16207';
    for (var i = 0; i < SG.PATH_CELLS.length; i++) {
      var c = SG.PATH_CELLS[i];
      if (c[0] < 0 || c[0] >= SG.GRID_COLS) continue;
      ctx.fillRect(SG.GRID_X + c[0] * SG.CELL, SG.GRID_Y + c[1] * SG.CELL, SG.CELL, SG.CELL);
    }
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3; ctx.setLineDash([14, 14]);
    ctx.beginPath();
    ctx.moveTo(SG.PATH_POINTS[0].x, SG.PATH_POINTS[0].y);
    for (var j = 1; j < SG.PATH_POINTS.length; j++) ctx.lineTo(SG.PATH_POINTS[j].x, SG.PATH_POINTS[j].y);
    ctx.stroke(); ctx.setLineDash([]);
    // Entry gate and core. The road's last in-grid cell holds the core;
    // the final waypoint sits just past it, under the side panel.
    var s = SG.PATH_POINTS[1], e = SG.PATH_POINTS[SG.PATH_POINTS.length - 2];
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(0, s.y - 26, 14, 52);
    ctx.fillStyle = '#fecaca'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('GATE', 18, s.y + 4);
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(Math.PI / 4);
    var pulse = 0.7 + 0.3 * Math.sin(Date.now() / 300);
    ctx.fillStyle = 'rgba(34,211,238,' + pulse + ')';
    ctx.fillRect(-16, -16, 32, 32);
    ctx.strokeStyle = '#a5f3fc'; ctx.lineWidth = 3; ctx.strokeRect(-16, -16, 32, 32);
    ctx.restore();
    ctx.fillStyle = '#cffafe'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('CORE', e.x, e.y + 34);
  }

  function drawTowerShape(ctx, t) {
    var x = t.x, y = t.y;
    ctx.save();
    ctx.translate(x, y);
    // Base.
    ctx.fillStyle = '#334155';
    ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = t.def.dark; ctx.lineWidth = 3; ctx.stroke();
    ctx.rotate(t.angle);
    ctx.fillStyle = t.def.color;
    if (t.key === 'arrow') {
      ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(-10, -9); ctx.lineTo(-10, 9); ctx.closePath(); ctx.fill();
    } else if (t.key === 'cannon') {
      ctx.fillRect(-6, -10, 26, 20);
      ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
    } else if (t.key === 'frost') {
      ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(0, -12); ctx.lineTo(-14, 0); ctx.lineTo(0, 12); ctx.closePath(); ctx.fill();
    } else {
      ctx.fillRect(-4, -4, 30, 8);
      ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    if (t.flash > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fill();
    }
    // Level pips.
    for (var i = 0; i < t.level; i++) {
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(x - 10 + i * 10, y + 28, 3.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawEnemy(ctx, e) {
    var x = e.x, y = e.y + Math.sin(e.wobble + Date.now() / 240) * 1.5;
    var slowed = !!e.slowed;
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = e.def.color;
    ctx.strokeStyle = slowed ? '#22d3ee' : 'rgba(0,0,0,0.45)';
    ctx.lineWidth = slowed ? 3 : 2;
    if (e.def.shape === 'tri') {
      var a = Math.atan2(0, 1);
      ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-9, -9); ctx.lineTo(-9, 9); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (e.def.shape === 'square') {
      ctx.fillRect(-12, -12, 24, 24); ctx.strokeRect(-12, -12, 24, 24);
      ctx.fillStyle = '#475569'; ctx.fillRect(-6, -6, 12, 12);
    } else if (e.def.shape === 'hex') {
      ctx.beginPath();
      for (var i = 0; i < 6; i++) { var an = i * Math.PI / 3; var px = Math.cos(an) * 22, py = Math.sin(an) * 22; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#701a75'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(0, 0, e.def.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath(); ctx.arc(-4, -3, 2.5, 0, Math.PI * 2); ctx.arc(4, -3, 2.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // HP bar.
    var w = e.def.radius * 2 + 6;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x - w / 2, y - e.def.radius - 12, w, 5);
    ctx.fillStyle = e.hp / e.maxHp > 0.5 ? '#4ade80' : (e.hp / e.maxHp > 0.25 ? '#facc15' : '#ef4444');
    ctx.fillRect(x - w / 2, y - e.def.radius - 12, w * Math.max(0, e.hp / e.maxHp), 5);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  SG.render = function (ctx, s) {
    ctx.save();
    if (s.shake > 0) ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
    if (!grassCache) buildGrass(ctx);
    ctx.drawImage(grassCache, 0, 0);
    drawRoad(ctx);
    // Hover range preview.
    if (s.phase === 'playing' && s.hover && s.selectedType && !s.selectedTower) {
      var cell = s.hover;
      if (!SG.isPathCell(cell.col, cell.row)) {
        var def = SG.TOWERS[s.selectedType];
        var c = SG.cellCenter(cell.col, cell.row);
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.beginPath(); ctx.arc(c.x, c.y, def.range * SG.CELL, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = def.color; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(SG.GRID_X + cell.col * SG.CELL, SG.GRID_Y + cell.row * SG.CELL, SG.CELL, SG.CELL);
      }
    }
    // Selected tower range.
    if (s.selectedTower) {
      var st = SG.towerStats(s.selectedTower);
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      ctx.beginPath(); ctx.arc(s.selectedTower.x, s.selectedTower.y, st.range, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2; ctx.stroke();
    }
    for (var i = 0; i < s.towers.length; i++) drawTowerShape(ctx, s.towers[i]);
    for (var j = 0; j < s.enemies.length; j++) drawEnemy(ctx, s.enemies[j]);
    // Projectiles.
    for (var k = 0; k < s.fx.projectiles.length; k++) {
      var p = s.fx.projectiles[k];
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.kind === 'cannon' ? 6 : 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    // Particles and floating text.
    for (var m = 0; m < s.fx.particles.length; m++) {
      var pt = s.fx.particles[m];
      ctx.globalAlpha = Math.max(0, pt.life / pt.max);
      ctx.fillStyle = pt.color;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
    for (var n = 0; n < s.fx.texts.length; n++) {
      var ft = s.fx.texts[n];
      ctx.globalAlpha = Math.max(0, ft.life / ft.max);
      ctx.fillStyle = ft.color; ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    SG.renderHud(ctx, s);
    SG.renderPanel(ctx, s);
    if (s.bannerTimer > 0 && s.banner) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      roundRect(ctx, 300, 300, 680, 56, 12); ctx.fill();
      ctx.fillStyle = '#fde047'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(s.banner, 640, 338);
    }
    if (s.phase === 'title') SG.renderTitle(ctx, s);
    if (s.phase === 'victory') SG.renderEnd(ctx, s, true);
    if (s.phase === 'defeat') SG.renderEnd(ctx, s, false);
  };

  SG.renderHud = function (ctx, s) {
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, SG.CANVAS_W, SG.HUD_H);
    ctx.fillStyle = '#22d3ee'; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('SENTINEL GRID', 24, 36);
    ctx.fillStyle = '#94a3b8'; ctx.font = '14px sans-serif';
    ctx.fillText('Hold the road. Protect the core.', 24, 60);
    function stat(x, label, value, color) {
      ctx.fillStyle = '#64748b'; ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(label, x, 24);
      ctx.fillStyle = color; ctx.font = 'bold 22px sans-serif';
      ctx.fillText(String(value), x, 52);
    }
    stat(430, 'GOLD', s.gold, '#fde047');
    stat(540, 'LIVES', s.lives + ' / ' + SG.START_LIVES, s.lives <= 5 ? '#ef4444' : '#f87171');
    stat(660, 'WAVE', (s.wave === 0 ? '-' : s.wave) + ' / ' + SG.TOTAL_WAVES, '#e2e8f0');
    stat(790, 'SCORE', s.score, '#e2e8f0');
    stat(910, 'ENEMIES', s.waveRunning ? SG.waveEnemiesLeft(s) : '-', '#e2e8f0');
    ctx.fillStyle = '#334155'; ctx.fillRect(1020, 58, 236, 10);
    ctx.fillStyle = '#22d3ee'; ctx.fillRect(1020, 58, 236 * Math.min(1, Math.max(0, s.wave / SG.TOTAL_WAVES)), 10);
    ctx.fillStyle = '#94a3b8'; ctx.font = '12px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(s.paused ? 'PAUSED (P)' : (s.speed === 2 ? 'SPEED 2x' : 'SPEED 1x'), 1256, 52);
    if (s.message) {
      ctx.fillStyle = '#fca5a5'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(s.message, 640, 84);
    }
  };

  SG.panelButtons = [];
  SG.renderPanel = function (ctx, s) {
    var x = SG.PANEL_X, w = SG.PANEL_W;
    ctx.fillStyle = '#1e293b'; ctx.fillRect(x, SG.HUD_H, w, SG.CANVAS_H - SG.HUD_H);
    ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('BUILD  (keys 1-4)', x + 14, SG.HUD_H + 24);
    SG.panelButtons = [];
    var y = SG.HUD_H + 36;
    SG.TOWER_ORDER.forEach(function (key, idx) {
      var def = SG.TOWERS[key];
      var by = y + idx * 76;
      var sel = s.selectedType === key && !s.selectedTower;
      ctx.fillStyle = sel ? '#334155' : '#0f172a';
      roundRect(ctx, x + 10, by, w - 20, 66, 8); ctx.fill();
      if (sel) { ctx.strokeStyle = def.color; ctx.lineWidth = 2; ctx.stroke(); }
      ctx.fillStyle = def.color; ctx.beginPath(); ctx.arc(x + 32, by + 22, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f1f5f9'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText((idx + 1) + '  ' + def.name + '  —  ' + def.cost + 'g', x + 50, by + 20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '12px sans-serif';
      ctx.fillText(def.desc, x + 50, by + 40);
      ctx.fillText('dmg ' + def.damage + '  ·  rng ' + def.range + '  ·  ' + (def.key === 'cannon' ? 'splash ' + def.splash : (def.key === 'frost' ? 'slow ' + Math.round(def.slowPct * 100) + '%' : 'rate ' + def.rate + '/s')), x + 50, by + 56);
      SG.panelButtons.push({ kind: 'tower', key: key, x: x + 10, y: by, w: w - 20, h: 66 });
    });
    var py = y + 4 * 76 + 8;
    if (s.selectedTower) {
      var t = s.selectedTower, stats = SG.towerStats(t);
      ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 15px sans-serif';
      ctx.fillText('SELECTED: ' + t.def.name + '  Lv ' + t.level, x + 14, py);
      ctx.fillStyle = '#94a3b8'; ctx.font = '13px sans-serif';
      ctx.fillText('Damage ' + stats.damage + '   Range ' + (stats.range / SG.CELL).toFixed(1) + '   Rate ' + stats.rate.toFixed(1) + '/s', x + 14, py + 20);
      var uc = SG.upgradeCost(t);
      ctx.fillStyle = uc === null ? '#475569' : '#4ade80';
      roundRect(ctx, x + 10, py + 32, 110, 34, 7); ctx.fill();
      ctx.fillStyle = '#0f172a'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(uc === null ? 'MAX LEVEL' : 'UPGRADE ' + uc + 'g', x + 65, py + 54);
      ctx.fillStyle = '#facc15';
      roundRect(ctx, x + 130, py + 32, 106, 34, 7); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillText('SELL +' + SG.sellValue(t) + 'g', x + 183, py + 54);
      SG.panelButtons.push({ kind: 'upgrade', x: x + 10, y: py + 32, w: 110, h: 34 });
      SG.panelButtons.push({ kind: 'sell', x: x + 130, y: py + 32, w: 106, h: 34 });
      py += 78;
    }
    var by2 = py + 6;
    function btn(label, kind, bx, bw) {
      ctx.fillStyle = kind === 'start' ? '#16a34a' : '#334155';
      roundRect(ctx, bx, by2, bw, 40, 8); ctx.fill();
      ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(label, bx + bw / 2, by2 + 25);
      SG.panelButtons.push({ kind: kind, x: bx, y: by2, w: bw, h: 40 });
    }
    btn(s.waveRunning ? 'WAVE RUNNING…' : 'START WAVE  (Space)', 'start', x + 10, w - 20);
    by2 += 50;
    btn('SPEED ' + s.speed + 'x', 'speed', x + 10, 110);
    btn(s.paused ? 'RESUME (P)' : 'PAUSE (P)', 'pause', x + 130, 106);
    by2 += 50;
    btn(SG.audio.isMuted() ? 'SOUND OFF (M)' : 'SOUND ON (M)', 'mute', x + 10, 110);
    btn('RESTART (R)', 'restart', x + 130, 106);
    ctx.fillStyle = '#64748b'; ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('Click a grass cell to build.', x + 14, by2 + 62);
    ctx.fillText('Click a tower to upgrade/sell.', x + 14, by2 + 80);
    ctx.fillText('Esc cancels selection.', x + 14, by2 + 98);
  };

  SG.renderTitle = function (ctx, s) {
    ctx.fillStyle = 'rgba(2,6,23,0.78)'; ctx.fillRect(0, 0, SG.CANVAS_W, SG.CANVAS_H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#22d3ee'; ctx.font = 'bold 64px sans-serif';
    ctx.fillText('SENTINEL GRID', 640, 220);
    ctx.fillStyle = '#e2e8f0'; ctx.font = '22px sans-serif';
    ctx.fillText('A tower-defense stand: build sentinels on the grass,', 640, 272);
    ctx.fillText('stop 20 waves of drifters, and protect the core.', 640, 304);
    ctx.fillStyle = '#fde047'; ctx.font = 'bold 18px sans-serif';
    ctx.fillText('Arrow 50g   ·   Cannon 100g   ·   Frost 75g   ·   Sniper 150g', 640, 352);
    ctx.fillStyle = '#94a3b8'; ctx.font = '16px sans-serif';
    ctx.fillText('Click to build  ·  1-4 pick a tower  ·  Space starts a wave / 2x speed', 640, 392);
    ctx.fillText('P pause  ·  M mute  ·  R restart  ·  Esc cancel', 640, 418);
    ctx.fillStyle = '#4ade80'; ctx.font = 'bold 24px sans-serif';
    ctx.fillText('—  CLICK OR PRESS ENTER TO PLAY  —', 640, 480);
    ctx.fillStyle = '#64748b'; ctx.font = '14px sans-serif';
    ctx.fillText('20 lives. Survive wave 20 to win. Bosses arrive on waves 5, 10, 15 and 20.', 640, 520);
  };

  SG.renderEnd = function (ctx, s, won) {
    ctx.fillStyle = 'rgba(2,6,23,0.78)'; ctx.fillRect(0, 0, SG.CANVAS_W, SG.CANVAS_H);
    ctx.textAlign = 'center';
    ctx.fillStyle = won ? '#4ade80' : '#ef4444';
    ctx.font = 'bold 56px sans-serif';
    ctx.fillText(won ? 'OUTPOST HELD!' : 'THE CORE HAS FALLEN', 640, 250);
    ctx.fillStyle = '#e2e8f0'; ctx.font = '22px sans-serif';
    ctx.fillText(won ? 'All 20 waves repelled. The grid stands.' : 'The drifters broke through on wave ' + Math.max(1, s.wave) + '.', 640, 300);
    ctx.fillStyle = '#fde047'; ctx.font = 'bold 26px sans-serif';
    ctx.fillText('SCORE  ' + s.score + '    ·    KILLS  ' + s.kills + '    ·    LIVES LEFT  ' + s.lives, 640, 348);
    ctx.fillStyle = '#94a3b8'; ctx.font = '16px sans-serif';
    if (won) ctx.fillText('Press E for endless mode, or R to play again.', 640, 392);
    else ctx.fillText('Press R or click below to try again.', 640, 392);
    ctx.fillStyle = '#16a34a';
    roundRect(ctx, 520, 420, 240, 52, 10); ctx.fill();
    ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 20px sans-serif';
    ctx.fillText('RESTART  (R)', 640, 453);
    SG.restartButton = { x: 520, y: 420, w: 240, h: 52 };
  };
})();
