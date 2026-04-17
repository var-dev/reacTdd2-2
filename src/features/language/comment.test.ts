import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { comment } from "./comment.js";
import { deepStrictEqual } from "node:assert";

describe("parse", () => {
  it("parses single word comment", () => {
    assert.deepStrictEqual(
      comment.parseToken(
        {},
        {
          type: "word",
          token: "comment",
          lineNumber: 1,
        }
      )
    ,{ isComplete: false });
  });

  it("parses multiple word comments until a new line appears", () => {
    let state = {};
    state = comment.parseToken(state, {
      type: "word",
      text: "another",
      lineNumber: 1,
    });
    state = comment.parseToken(state, {
      type: "whitespace",
      text: " ",
      lineNumber: 1,
    });
    state = comment.parseToken(state, {
      type: "word",
      text: "comment",
      lineNumber: 1,
    });
    state = comment.parseToken(state, {
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
    deepStrictEqual(comment.perform(state), state);
  });
});
