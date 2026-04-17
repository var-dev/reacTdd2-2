import { describe, it } from "node:test";
import { to } from "./to.js";
import { deepStrictEqual } from "assert";

describe("parseToken", () => {
  it("ignores whitespace", () => {
    const state = to.parseToken(
      { a: 123 } as unknown as LogoState,
      { type: "whitespace" } as unknown as Token
    );
    deepStrictEqual(state, {});
  });
});
