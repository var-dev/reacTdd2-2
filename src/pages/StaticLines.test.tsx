import { describe, it } from "node:test";
import React from "react";
import '../test/domSetup.js'
import { render } from "@testing-library/react";
import { StaticLines } from "./StaticLines.js";
import {
  horizontalLine,
  verticalLine,
  diagonalLine,
} from "./sampleInstructions.js";
import { strictEqual } from "assert";

describe("StaticLines", () => {
  const renderSvg = (component: React.ReactNode) =>
    render(<svg>{component}</svg>);

  it("renders a line with the line coordinates", () => {
    const {container} = renderSvg(<StaticLines lineCommands={[horizontalLine]} />);
    const line = container.querySelector<SVGAElement>('line');
    strictEqual(line!.getAttribute("x1"), "100", 'expect x1="100"');
    strictEqual(line!.getAttribute("y1"), "100", 'expect y1="100"');
    strictEqual(line!.getAttribute("x2"), "200", 'expect x2="200"');
    strictEqual(line!.getAttribute("y2"), "100", 'expect x2="100"');
    strictEqual(line!.getAttribute("stroke-width"), "2", 'expect stroke-width="2"');
    strictEqual(line!.getAttribute("stroke"), "black", 'expect stroke="black"');
  });
  it("draws every drawLine command", () => {
    const {container} = renderSvg(<StaticLines lineCommands={
      [
        horizontalLine,
        verticalLine,
        diagonalLine,
      ]} />);
    const lines = container.querySelectorAll<SVGAElement>('line');
    strictEqual(lines!.length, 3, 'expect 3 lines');
  });
});
