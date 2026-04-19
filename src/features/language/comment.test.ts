import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { comment } from "./comment.js";
import { deepStrictEqual } from "node:assert";

describe("parse", () => {
  it("parses single word comment", () => {
    assert.deepStrictEqual(
      comment.parseToken(
        {} as unknown as LogoState,
        {
          type: "word",
          token: "comment",
          lineNumber: 1,
        } as unknown as Token
      )
    ,{ isComplete: false });
  });

  it("parses multiple word comments until a new line appears", () => {
    let state = {} as Partial<LogoState> | undefined;
    state = comment.parseToken(state as LogoState, {
      type: "word",
      text: "another",
      lineNumber: 1,
    } as unknown as Token);
    state = comment.parseToken(state as LogoState, {
      type: "whitespace",
      text: " ",
      lineNumber: 1,
    } as unknown as Token);
    state = comment.parseToken(state as LogoState, {
      type: "word",
      text: "comment",
      lineNumber: 1,
    } as unknown as Token);
    state = comment.parseToken(state as LogoState, {
      type: "whitespace",
      text: "\n",
      lineNumber: 1,
    });
    deepStrictEqual(state, { isComplete: true });
  });
});

describe("perform", () => {
  it("does nothing except return the same state", () => {
    const state = { a: 123 };
    deepStrictEqual(comment.perform(state as unknown as LogoState), state);
  });
});
