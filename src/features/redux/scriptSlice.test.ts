import { describe, it } from "node:test";
import { submitScriptName, submitEditLine, reset } from './scriptSlice.js'
import reducer from './scriptSlice.js'

import { parseStatement, initialState } from "../parser.js";
import { deepStrictEqual } from "assert";
import type { UnknownAction } from "@reduxjs/toolkit";

describe('scriptSlice', () => {
  it("returns initial state when existing state is undefined", () => {
    deepStrictEqual(reducer(undefined, {} as UnknownAction),
      initialState
    );
  });
  it('should handle submitScriptName', () => {
    deepStrictEqual(
      reducer(initialState, submitScriptName("my script")),
      { ...initialState, name: "my script" }
    );
  })
  describe("when receiving a submitEditLine() action", ()=>{
    it("passes text through to parser", () => {
      const result = reducer(initialState, submitEditLine("statement"));
      deepStrictEqual(result, parseStatement("statement", initialState));
    })
    it("passes through state with error removed", () => {
      const result = reducer({ a: 123, b: 234, error: "an error" } as unknown as LogoState, submitEditLine("statement"));
      deepStrictEqual(result, { a: 123, b: 234, error: { line: 'statement' } });
    })
  describe("RESET action", () => {
    it("resets state to default state", () => {
      deepStrictEqual(reducer({a:123} as unknown as LogoState, reset()), initialState);
    })
  })
  })
})
