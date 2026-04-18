import React from "react";

export const Turtle = ({ x, y, angle }: TurtleState) => {
  const buildPoints = (x: number, y: number) =>
    `${x - 5},${y + 5}, ${x},${y - 7}, ${x + 5},${y + 5
    }`;

  const buildRotation = (angle: number, x: number, y: number) =>
    `${angle + 90}, ${x}, ${y}`;

  return (
    <polygon
      points={buildPoints(x, y)}
      fill="green"
      strokeWidth="2"
      stroke="black"
      transform={`rotate(${buildRotation(
        angle,
        x,
        y
      )})`}
    />
  );
};
