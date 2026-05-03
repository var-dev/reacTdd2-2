import { describe, it, beforeEach } from "node:test";
import React from "react";
import '../../test/builders/domSetup.js'
import { render, cleanup, screen } from "@testing-library/react";
import {
  horizontalLine,
  verticalLine,
  diagonalLine,
} from "./sampleInstructions.js";
import { strictEqual } from "assert";
import {AnimatedLine} from "./AnimatedLine.js";


const turtle = { x: 10, y: 10, angle: 10 };
const renderSvg = (component: React.ReactNode) => render(<svg data-testid='svg'>{component}</svg>);
describe("AnimatedLine", () => {
  beforeEach(() => {
    cleanup();
  });
  it("draws a line starting at the x1,y1 co-ordinate of the command being drawn", () => {
    renderSvg(
      <AnimatedLine
        commandToAnimate={horizontalLine}
        turtle={turtle}
      />
    );
    const svg = screen.getByTestId("svg")
    const line = svg.querySelector('line')
    strictEqual(line?.tagName, 'line')
    strictEqual(line?.getAttribute("x1"), horizontalLine.x1.toString(), 'expect attr x1')
    strictEqual(line?.getAttribute("y1"), horizontalLine.y1.toString(), 'expect attr y1')
  });
  it("draws a line ending at the current position of the turtle", () => {
    renderSvg(
      <AnimatedLine
        commandToAnimate={horizontalLine}
        turtle={{x: 10, y: 20, angle: 0 }}
      />
    );
    const svg = screen.getByTestId("svg")
    const line = svg.querySelector('line')
    strictEqual(line?.tagName, 'line')
    strictEqual(line?.getAttribute("x2"), '10', 'expect attr x2')
    strictEqual(line?.getAttribute("y2"), '20', 'expect attr y2')
  })
  it("sets stroke width of 2", () => {
    renderSvg(
      <AnimatedLine
        commandToAnimate={horizontalLine}
        turtle={{x: 10, y: 20, angle: 0 }}
      />
    );
    const svg = screen.getByTestId("svg")
    const line = svg.querySelector('line')
    strictEqual(line?.tagName, 'line')
    strictEqual(line?.getAttribute("stroke-width"), '2', 'expect stroke-width=2')
    strictEqual(line?.getAttribute("stroke"), 'black', 'expect stroke=black')
  })
})