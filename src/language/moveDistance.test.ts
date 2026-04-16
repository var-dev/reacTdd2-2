import { describe, it } from "node:test";
import { moveDistance } from "../../src/language/moveDistance";
import { deepStrictEqual, strictEqual } from "assert";

const value = (v:any) => ({ get: () => v });

const initialState: LogoState = {
  drawCommands: [],
  turtle: { x: 0, y: 0, angle: 0 },
  pen: { down: true },
  nextDrawCommandId: 123,
};

describe("moveDistance", () => {
  let result: LogoState;

  function doMove(state: LogoState, distance:number) {
    result = moveDistance(state, value(distance));
  }

  describe("when angle is 0", () => {
    it("increases turtle x", () => {
      doMove(initialState, 100);
      strictEqual(result.turtle.x, 100);
    });

    it("adds a new draw command when moving forward", () => {
      doMove(initialState, 100);
      deepStrictEqual(result.drawCommands, [
        {
          drawCommand: "drawLine",
          id: 123,
          x1: 0,
          y1: 0,
          x2: 100,
          y2: 0,
        },
      ]);
    });

    it("maintains existing draw commands", () => {
      doMove({ ...initialState, drawCommands: [1, 2, 3] as any}, 100);
      deepStrictEqual(result.drawCommands.slice(0, 3), [1, 2, 3]);
    });

    it("maintains existing turtle properties", () => {
      doMove(initialState, 100);
      strictEqual(result.turtle.angle, 0);
    });

    it("decreases x when moving with a negative direction", () => {
      doMove(initialState, -100);
      strictEqual(result.turtle.x, -100);
    });
  });

  describe("when angle is 90", () => {
    it("increases turtle y", () => {
      doMove(
        {
          ...initialState,
          turtle: { x: 0, y: 0, angle: 90 },
        },
        100,
      );
      strictEqual(result.turtle.y, 100);
    });
  });

  const radians = (angle: number) => (Math.PI * angle) / 180;
  describe("when angle is 30", () => {
    it("uses cos to calculate x", () => {
      doMove(
        {
          ...initialState,
          turtle: { x: 0, y: 0, angle: 30 },
        },
        100,
      );
      strictEqual(result.turtle.x, Math.cos(radians(30)) * 100);
    });

    it("uses sin to calculate y", () => {
      doMove(
        {
          ...initialState,
          turtle: { x: 0, y: 0, angle: 30 },
        },
        100,
      );
      strictEqual(result.turtle.y, Math.sin(radians(30)) * 100);
    });
  });

  describe("pen up", () => {
    it("does not draw line if pen is up", () => {
      doMove(
        { ...initialState, pen: { down: false } },
        10
      );
      deepStrictEqual(result.drawCommands,[]);
    });
  });

  describe("next draw command id", () => {
    it("adds the next id to the next command", () => {
      doMove(
        { ...initialState, nextDrawCommandId: 123 },
        100
      );
      strictEqual(result.drawCommands[0].id, 123);
    });

    it("increases next id after command", () => {
      doMove(
        { ...initialState, nextDrawCommandId: 123 },
        100
      );
      strictEqual(result.nextDrawCommandId, 124);
    });
  });
});
