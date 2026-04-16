import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { clearScreen } from "./clearScreen.js";

describe("clearScreen", () => {
  describe("perform", () => {
    it("removes all draw commands", () => {
      const newState = clearScreen.perform({
        drawCommands: [1, 2, 3] as unknown as DrawCommand[],
      } as LogoState);
      assert.deepStrictEqual(newState.drawCommands, []);
    });

    it("moves turtle back to initial position", () => {
      const newState = clearScreen.perform({
        turtle: { x: 123, y: 234, angle: 345 },
      } as LogoState);
      assert.deepStrictEqual(newState.turtle, {
        x: 0,
        y: 0,
        angle: 0,
      });
    });

    it("maintains other properties", () => {
      const newState = clearScreen.perform({
        a: 123,
      } as unknown as LogoState);
      assert.strictEqual(newState.a, 123);
    });
  });
});
