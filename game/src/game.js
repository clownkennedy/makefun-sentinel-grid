// SENTINEL GRID — game.js
// Game state, waves, economy, win/lose and the update loop.
(function () {
  'use strict';
  var SG = window.SG;

  SG.newGame = function () {
    return {
      phase: 'title', // title | playing | victory | defeat
      gold: SG.START_GOLD, lives: SG.START_LIVES, score: 0,
      wave: 0, // wave in progress (1-based), 0 = none started
      waveRunning: false, spawnQueue: [], spawnTimer: 0,
      enemies: [], towers: [], fx: SG.makeEffects(),
      selectedType: 'arrow', selectedTower: null,
      hover: null, speed: 1, paused: false,
      banner: null, bannerTimer: 0, shake: 0,
      kills: 0, time: 0, endless: false, endlessWave: 0,
      message: null
    };
  };

  SG.state = SG.newGame();

  SG.resetGame = function () {
    var keepMuted = SG.audio.isMuted();
    SG.state = SG.newGame();
    if (keepMuted && !SG.audio.isMuted()) SG.audio.toggleMute();
    SG.state.phase = 'playing';
  };

  SG.startGame = function () {
    SG.audio.unlock();
    if (SG.state.phase === 'title') SG.state.phase = 'playing';
  };

  SG.currentWaveNumber = function (s) {
    return s.endless ? SG.TOTAL_WAVES + s.endlessWave : s.wave;
  };

  SG.startWave = function (s) {
    if (s.waveRunning || s.phase !== 'playing') return false;
    if (s.wave >= SG.TOTAL_WAVES && !s.endless) return false;
    if (s.endless) s.endlessWave++;
    else s.wave++;
    var n = SG.currentWaveNumber(s);
    s.spawnQueue = SG.buildWave(n);
    s.spawnTimer = 0.3;
    s.waveRunning = true;
    s.selectedTower = null;
    return true;
  };

  SG.waveEnemiesLeft = function (s) {
    var alive = 0;
    for (var i = 0; i < s.enemies.length; i++) if (!s.enemies[i].dead && !s.enemies[i].leaked) alive++;
    return alive + s.spawnQueue.length;
  };

  SG.onKill = function (s, e) {
    s.gold += e.def.gold;
    s.score += 10;
    s.kills++;
    SG.burst(s.fx, e.x, e.y, e.def.color, e.kind === 'boss' ? 22 : 9, 130);
    SG.floatText(s.fx, e.x, e.y - 14, '+' + e.def.gold + 'g', '#fde047');
    SG.audio.die();
    if (e.kind === 'boss') s.shake = 0.35;
  };

  SG.onLeak = function (s, e) {
    s.lives -= e.def.lives;
    s.shake = 0.3;
    SG.floatText(s.fx, e.x, e.y - 14, '-' + e.def.lives + ' life', '#f87171');
    SG.audio.leak();
    if (s.lives <= 0) {
      s.lives = 0;
      s.phase = 'defeat';
      s.waveRunning = false;
      SG.audio.lose();
    }
  };

  SG.endWave = function (s) {
    s.waveRunning = false;
    var n = SG.currentWaveNumber(s);
    var bonus = SG.waveClearBonus(Math.min(n, SG.TOTAL_WAVES));
    s.gold += bonus;
    s.score += bonus * 2;
    s.banner = 'WAVE ' + n + ' CLEARED!  +' + bonus + ' GOLD';
    s.bannerTimer = 2.2;
    SG.audio.clear();
    if (!s.endless && s.wave >= SG.TOTAL_WAVES) {
      s.score += s.lives * 100;
      s.phase = 'victory';
      SG.audio.win();
    }
  };

  SG.tryBuild = function (s, col, row) {
    if (SG.isPathCell(col, row)) { s.message = 'Cannot build on the road'; SG.audio.error(); return false; }
    for (var i = 0; i < s.towers.length; i++) {
      if (s.towers[i].col === col && s.towers[i].row === row) { s.message = 'Cell occupied'; SG.audio.error(); return false; }
    }
    var def = SG.TOWERS[s.selectedType];
    if (s.gold < def.cost) { s.message = 'Not enough gold (' + def.cost + 'g)'; SG.audio.error(); return false; }
    s.gold -= def.cost;
    var t = SG.makeTower(s.selectedType, col, row);
    s.towers.push(t);
    var c = SG.cellCenter(col, row);
    SG.burst(s.fx, c.x, c.y, def.color, 8, 80);
    SG.audio.build();
    s.message = null;
    return true;
  };

  SG.tryUpgrade = function (s) {
    var t = s.selectedTower;
    if (!t) return false;
    var cost = SG.upgradeCost(t);
    if (cost === null) { s.message = 'Already max level'; return false; }
    if (s.gold < cost) { s.message = 'Need ' + cost + 'g to upgrade'; SG.audio.error(); return false; }
    s.gold -= cost; t.invested += cost; t.level++;
    SG.burst(s.fx, t.x, t.y, t.def.color, 12, 110);
    SG.audio.build();
    return true;
  };

  SG.trySell = function (s) {
    var t = s.selectedTower;
    if (!t) return false;
    var v = SG.sellValue(t);
    s.gold += v;
    for (var i = 0; i < s.towers.length; i++) {
      if (s.towers[i] === t) { s.towers.splice(i, 1); break; }
    }
    SG.floatText(s.fx, t.x, t.y - 14, '+' + v + 'g', '#fde047');
    s.selectedTower = null;
    SG.audio.build();
    return true;
  };

  SG.update = function (s, rawDt) {
    var dt = rawDt * (s.paused ? 0 : s.speed);
    s.time += rawDt;
    if (s.bannerTimer > 0) s.bannerTimer -= rawDt;
    if (s.shake > 0) s.shake -= rawDt;
    for (var i = 0; i < s.towers.length; i++) {
      if (s.towers[i].flash > 0) s.towers[i].flash -= rawDt;
    }
    if (s.phase !== 'playing' || s.paused || dt <= 0) {
      SG.updateParticles(s.fx, rawDt);
      return;
    }
    // Spawning.
    if (s.waveRunning && s.spawnQueue.length > 0) {
      s.spawnTimer -= dt;
      if (s.spawnTimer <= 0) {
        var kind = s.spawnQueue.shift();
        s.enemies.push(SG.makeEnemy(kind, SG.currentWaveNumber(s)));
        s.spawnTimer = SG.spawnInterval(SG.currentWaveNumber(s));
      }
    }
    // Towers fire.
    for (var ti = 0; ti < s.towers.length; ti++) {
      var t = s.towers[ti];
      t.cooldown -= dt;
      var stats = SG.towerStats(t);
      if (t.cooldown <= 0) {
        var target = SG.pickTarget(t, s.enemies, stats.range);
        if (target) s.fx.projectiles.push(SG.fireTower(t, target, stats, s.time));
      }
    }
    SG.updateProjectiles(s.fx, s.enemies, dt, s.time, function (e) { SG.onKill(s, e); });
    // Enemies move.
    for (var ei = s.enemies.length - 1; ei >= 0; ei--) {
      var e = s.enemies[ei];
      if (e.dead) { s.enemies.splice(ei, 1); continue; }
      if (SG.updateEnemy(e, dt, s.time) === 'leaked') {
        s.enemies.splice(ei, 1);
        SG.onLeak(s, e);
        if (s.phase !== 'playing') break;
      }
    }
    SG.updateParticles(s.fx, dt);
    // Wave finished?
    if (s.waveRunning && s.spawnQueue.length === 0 && SG.waveEnemiesLeft(s) === 0) {
      SG.endWave(s);
    }
  };
})();
