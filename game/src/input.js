// SENTINEL GRID — input.js
// Mouse and keyboard handling, including panel buttons.
(function () {
  'use strict';
  var SG = window.SG;

  SG.handlePanelClick = function (s, mx, my) {
    var btns = SG.panelButtons || [];
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
        if (b.kind === 'tower') { s.selectedType = b.key; s.selectedTower = null; }
        else if (b.kind === 'upgrade') SG.tryUpgrade(s);
        else if (b.kind === 'sell') SG.trySell(s);
        else if (b.kind === 'start') SG.startWave(s);
        else if (b.kind === 'speed') s.speed = s.speed === 1 ? 2 : 1;
        else if (b.kind === 'pause') s.paused = !s.paused;
        else if (b.kind === 'mute') SG.audio.toggleMute();
        else if (b.kind === 'restart') SG.resetGame();
        return true;
      }
    }
    return false;
  };

  SG.handleCanvasClick = function (s, mx, my) {
    SG.audio.unlock();
    if (s.phase === 'title') { SG.startGame(); return; }
    if (s.phase === 'victory' || s.phase === 'defeat') {
      var rb = SG.restartButton;
      if (rb && mx >= rb.x && mx <= rb.x + rb.w && my >= rb.y && my <= rb.y + rb.h) SG.resetGame();
      return;
    }
    if (mx >= SG.PANEL_X) { SG.handlePanelClick(s, mx, my); return; }
    if (!SG.inGrid(mx, my)) return;
    var cell = SG.cellFromPixel(mx, my);
    if (!cell) return;
    // Clicking an existing tower selects it.
    for (var i = 0; i < s.towers.length; i++) {
      if (s.towers[i].col === cell.col && s.towers[i].row === cell.row) {
        s.selectedTower = s.towers[i];
        return;
      }
    }
    s.selectedTower = null;
    SG.tryBuild(s, cell.col, cell.row);
  };

  SG.handleMouseMove = function (s, mx, my) {
    if (SG.inGrid(mx, my)) s.hover = SG.cellFromPixel(mx, my);
    else s.hover = null;
  };

  SG.handleKey = function (s, key) {
    var k = key.toLowerCase();
    if (k === 'enter') {
      if (s.phase === 'title') SG.startGame();
      else if (s.phase === 'victory' || s.phase === 'defeat') SG.resetGame();
      return;
    }
    if (s.phase === 'title') return;
    if (k === 'r') { SG.resetGame(); return; }
    if (s.phase === 'victory' && k === 'e') {
      s.endless = true; s.endlessWave = 0; s.phase = 'playing';
      return;
    }
    if (s.phase !== 'playing') return;
    if (k === '1') { s.selectedType = 'arrow'; s.selectedTower = null; }
    else if (k === '2') { s.selectedType = 'cannon'; s.selectedTower = null; }
    else if (k === '3') { s.selectedType = 'frost'; s.selectedTower = null; }
    else if (k === '4') { s.selectedType = 'sniper'; s.selectedTower = null; }
    else if (k === ' ') {
      if (!s.waveRunning) SG.startWave(s);
      else s.speed = s.speed === 1 ? 2 : 1;
    }
    else if (k === 'p') s.paused = !s.paused;
    else if (k === 'm') SG.audio.toggleMute();
    else if (k === 'escape') { s.selectedTower = null; s.message = null; }
    else if (k === 'u') SG.tryUpgrade(s);
  };
})();
