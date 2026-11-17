// SENTINEL GRID — main.js
// Bootstrap and the main loop.
(function () {
  'use strict';
  var SG = window.SG;

  function init() {
    var canvas = document.getElementById('game');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var params = new URLSearchParams(window.location.search);
    var shot = params.get('shot');
    var seed = params.get('seed');
    if (seed) { /* seed is accepted for stable screenshots; gameplay uses Math.random */ }

    if (shot) SG.applyShot(SG.state, shot);

    canvas.addEventListener('click', function (ev) {
      var r = canvas.getBoundingClientRect();
      var mx = (ev.clientX - r.left) * (SG.CANVAS_W / r.width);
      var my = (ev.clientY - r.top) * (SG.CANVAS_H / r.height);
      SG.handleCanvasClick(SG.state, mx, my);
    });
    canvas.addEventListener('mousemove', function (ev) {
      var r = canvas.getBoundingClientRect();
      var mx = (ev.clientX - r.left) * (SG.CANVAS_W / r.width);
      var my = (ev.clientY - r.top) * (SG.CANVAS_H / r.height);
      SG.handleMouseMove(SG.state, mx, my);
    });
    window.addEventListener('keydown', function (ev) {
      if (ev.key === ' ') ev.preventDefault();
      SG.handleKey(SG.state, ev.key);
    });

    var last = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      SG.update(SG.state, dt);
      SG.render(ctx, SG.state);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
