// SENTINEL GRID — audio.js
// Synthesised WebAudio effects. No audio files. Never throws.
(function () {
  'use strict';
  var SG = window.SG;
  var ctx = null;
  var muted = false;

  function ensureCtx() {
    if (ctx) return ctx;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch (e) { ctx = null; }
    return ctx;
  }

  function beep(freq, dur, type, vol, slideTo) {
    if (muted) return;
    var c = ensureCtx();
    if (!c) return;
    try {
      if (c.state === 'suspended') c.resume();
      var o = c.createOscillator();
      var g = c.createGain();
      o.type = type || 'square';
      o.frequency.setValueAtTime(freq, c.currentTime);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), c.currentTime + dur);
      g.gain.setValueAtTime(vol || 0.05, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + dur);
    } catch (e) { /* audio is optional */ }
  }

  SG.audio = {
    unlock: function () { ensureCtx(); },
    toggleMute: function () { muted = !muted; return muted; },
    isMuted: function () { return muted; },
    shoot: function (kind) {
      if (kind === 'sniper') beep(880, 0.08, 'square', 0.05, 220);
      else if (kind === 'cannon') beep(160, 0.14, 'triangle', 0.07, 60);
      else if (kind === 'frost') beep(1200, 0.07, 'sine', 0.04, 900);
      else beep(660, 0.05, 'square', 0.03, 440);
    },
    die: function () { beep(320, 0.12, 'sawtooth', 0.04, 90); },
    leak: function () { beep(140, 0.3, 'sawtooth', 0.08, 70); },
    build: function () { beep(520, 0.09, 'triangle', 0.06, 780); },
    error: function () { beep(180, 0.12, 'square', 0.05, 120); },
    clear: function () { beep(523, 0.12, 'sine', 0.06); setTimeout(function () { beep(784, 0.16, 'sine', 0.06); }, 110); },
    win: function () { var n = [523, 659, 784, 1046]; n.forEach(function (f, i) { setTimeout(function () { beep(f, 0.2, 'sine', 0.06); }, i * 130); }); },
    lose: function () { var n = [392, 330, 262, 196]; n.forEach(function (f, i) { setTimeout(function () { beep(f, 0.25, 'triangle', 0.06); }, i * 150); }); }
  };
})();
