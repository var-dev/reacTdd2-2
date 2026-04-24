import { describe, it, beforeEach } from "node:test";
import React from "react";
import '../../test/builders/domSetup.js'
import { render } from "@testing-library/react";
import { Turtle } from "./Turtle.jsx";
import { strictEqual } from "assert";

describe("Turtle", () => {
  beforeEach(() => {
  });

  const renderSvg = (component: React.ReactElement) =>
    render(<svg>{component}</svg>);

  it("draws a polygon at the x,y co-ordinate", () => {
    const {container} = renderSvg(<Turtle x={10} y={10} angle={10} />);
    const polygon = container.querySelector<SVGAElement>('polygon[points="5,15, 10,3, 15,15"]');
    strictEqual(
      polygon?.getAttribute('points'),
      "5,15, 10,3, 15,15"
    );
  });

  it("sets a stroke width of 2", () => {
    const {container} = renderSvg(<Turtle x={10} y={10} angle={10} />);
    const polygon = container.querySelector<SVGAElement>('polygon[points="5,15, 10,3, 15,15"]');
    strictEqual(
      polygon?.getAttribute("stroke-width"),
      "2");
  });

  it("sets a stroke color of black", () => {
    const {container} = renderSvg(<Turtle x={10} y={10} angle={10} />);
    const polygon = container.querySelector<SVGAElement>('polygon[points="5,15, 10,3, 15,15"]');
    strictEqual(
      polygon?.getAttribute("stroke"),
      "black"
    );
  });

  it("sets a fill of green", () => {
    const {container} = renderSvg(<Turtle x={10} y={10} angle={10} />);
    const polygon = container.querySelector<SVGAElement>('polygon[points="5,15, 10,3, 15,15"]');
    strictEqual(
      polygon?.getAttribute("fill"),
      "green"
    );
  });

  it("sets a transform with the angle", () => {
    const {container} = renderSvg(<Turtle x={10} y={20} angle={30} />);
    const polygon = container.querySelector<SVGAElement>('polygon[fill="green"]');
    strictEqual(
      polygon?.getAttribute("transform"),
      "rotate(120, 10, 20)");
  });
});
