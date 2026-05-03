export const horizontalLine: DrawCommandLinear = {
  drawCommand: "drawLine",
  id: 123,
  x1: 100,
  y1: 100,
  x2: 200,
  y2: 100,
};

export const verticalLine: DrawCommandLinear = {
  drawCommand: "drawLine",
  id: 234,
  x1: 200,
  y1: 100,
  x2: 200,
  y2: 200,
};

export const diagonalLine: DrawCommandLinear = {
  drawCommand: "drawLine",
  id: 235,
  x1: 200,
  y1: 200,
  x2: 300,
  y2: 300,
};

export const rotate90: DrawCommandRotate = {
  drawCommand: "rotate",
  id: 456,
  previousAngle: 0,
  newAngle: 90,
};
