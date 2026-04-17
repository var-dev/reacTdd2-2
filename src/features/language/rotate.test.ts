import { describe, it } from "node:test";
import { rotate } from "./rotate.js";
import { deepStrictEqual, strictEqual } from "assert";
import { ok } from "assert/strict";

describe("rotate", () => {
  const initialState: Partial<LogoState> = {
    drawCommands: [{}] as DrawCommand[],
    nextDrawCommandId: 1,
    turtle: { angle: 10 } as TurtleState,
  };

  const angleValue = { get: () => 10 };

  it("sets the turtle to the updated angle", () => {
    const updated = rotate(
      { ...(initialState as LogoState), turtle: { angle: 10 } as TurtleState },
      angleValue,
    );
    strictEqual(updated?.turtle?.angle, 20);
  });

  it("maintains existing draw commands", () => {
    const existing = { a: 123 };
    const updated = rotate(
      {
        ...(initialState as LogoState),
        drawCommands: [existing] as unknown as DrawCommand[],
      },
      angleValue,
    ) as LogoState;
    deepStrictEqual(updated.drawCommands[0], existing);
  });

  it("appends a draw command for the rotation", () => {
    const updated = rotate(initialState as LogoState, angleValue) as LogoState;
    ok(updated.drawCommands[1]);
    strictEqual(updated.drawCommands[1].drawCommand, "rotate", "expect rotate");
    strictEqual(updated.drawCommands[1].id, 1);
    strictEqual(updated.drawCommands[1].newAngle, 20);
    strictEqual(updated.drawCommands[1].previousAngle, 10);
  });
});
