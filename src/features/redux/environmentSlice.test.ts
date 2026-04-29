import { describe, it } from "node:test";
import { promptFocusRequest, promptHasFocus } from "./environmentSlice";
import reducer from "./environmentSlice";
import { deepStrictEqual } from "assert";

describe("environment slice", () => {
  it("returns initial state", () => {
    deepStrictEqual(reducer(undefined, { type: "whatever" }), {
      promptFocusRequest: false,
      promptHasFocus: false,
    });
  });
  it("sets promptFocusRequest to true when receiving a promptFocusRequest() action", () => {
    deepStrictEqual(reducer(undefined, promptFocusRequest()), {
      promptFocusRequest: true,
      promptHasFocus: false,
    });
  });
  it("sets promptFocusRequest to false when receiving a promptHasFocus() action", () => {
    deepStrictEqual(reducer(undefined, promptHasFocus()), {
      promptFocusRequest: false,
      promptHasFocus: true,
    });
  });
});
