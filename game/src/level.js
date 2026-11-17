// SENTINEL GRID — level.js
// Grid geometry and the fixed winding road.
(function () {
  'use strict';
  var SG = window.SG;

  // Waypoints in cell coordinates; (-1,1) is off-grid entry, (16,9) exit.
  SG.PATH_CELLS = (function () {
    var pts = [[-1, 1], [2, 1], [2, 4], [13, 4], [13, 7], [6, 7], [6, 9], [15, 9], [16, 9]];
    var cells = [];
    var i, j;
    for (i = 0; i < pts.length - 1; i++) {
      var x0 = pts[i][0], y0 = pts[i][1], x1 = pts[i + 1][0], y1 = pts[i + 1][1];
      var dx = x1 > x0 ? 1 : (x1 < x0 ? -1 : 0);
      var dy = y1 > y0 ? 1 : (y1 < y0 ? -1 : 0);
      var x = x0, y = y0;
      while (true) {
        var last = cells[cells.length - 1];
        if (!last || last[0] !== x || last[1] !== y) cells.push([x, y]);
        if (x === x1 && y === y1) break;
        x += dx; y += dy;
      }
    }
    return cells;
  })();

  SG.isPathCell = function (col, row) {
    for (var i = 0; i < SG.PATH_CELLS.length; i++) {
      if (SG.PATH_CELLS[i][0] === col && SG.PATH_CELLS[i][1] === row) return true;
    }
    return false;
  };

  SG.cellCenter = function (col, row) {
    return { x: SG.GRID_X + col * SG.CELL + SG.CELL / 2, y: SG.GRID_Y + row * SG.CELL + SG.CELL / 2 };
  };

  // Pixel waypoints along the road centre, for enemy movement.
  SG.PATH_POINTS = SG.PATH_CELLS.map(function (c) {
    return SG.cellCenter(c[0], c[1]);
  });

  SG.cellFromPixel = function (px, py) {
    var col = Math.floor((px - SG.GRID_X) / SG.CELL);
    var row = Math.floor((py - SG.GRID_Y) / SG.CELL);
    if (col < 0 || col >= SG.GRID_COLS || row < 0 || row >= SG.GRID_ROWS) return null;
    return { col: col, row: row };
  };

  SG.inGrid = function (px, py) {
    return px >= SG.GRID_X && px < SG.GRID_X + SG.GRID_COLS * SG.CELL &&
           py >= SG.GRID_Y && py < SG.GRID_Y + SG.GRID_ROWS * SG.CELL;
  };
})();
