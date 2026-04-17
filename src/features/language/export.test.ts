import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toInstructions } from "./export.js";

describe("toInstructions", () => {
  it("joins two tokens in the same instruction", () => {
    const result = toInstructions({
      parsedTokens: [
        { instructionId: 0, text: "a" },
        { instructionId: 0, text: "b" },
      ],
    });
    assert.deepStrictEqual(result,["ab"]);
  });

  it("works for multiple instructions", () => {
    const result = toInstructions({
      parsedTokens: [
        { instructionId: 0, text: "a" },
        { instructionId: 1, text: "b" },
      ],
    });
    assert.deepStrictEqual(result, ["a", "b"]);
  });
});
