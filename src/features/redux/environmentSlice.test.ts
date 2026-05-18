import { describe, it } from "node:test";
import { 
  promptFocusRequest, 
  promptHasFocus,
  startedSharing,
  stoppedSharing,
  startedWatching,
  stoppedWatching,
  message,
} from "./environmentSlice";
import reducer from "./environmentSlice";
import { strictEqual } from "assert";

const initialState = {
  promptFocusRequest: false,
  promptHasFocus: false,
  isSharing: false,
  url: "",
  isWatching: false,
  message: "",
};
describe("environment slice", () => {
  it("returns initial state", () => {
    strictEqual(reducer(undefined, { type: "whatever" }).promptFocusRequest, false) 
    strictEqual(reducer(undefined, { type: "whatever" }).promptHasFocus, false) 
  });
  it("sets promptFocusRequest to true when receiving a promptFocusRequest() action", () => {
    strictEqual(reducer(undefined, promptFocusRequest()).promptFocusRequest, true)
  });
  it("sets promptFocusRequest to false when receiving a promptHasFocus() action", () => {
    strictEqual(reducer(undefined, promptHasFocus()).promptFocusRequest, false)
  });
  it("sets isSharing to true when receiving a startedSharing() action", () => {
    strictEqual(reducer(undefined, startedSharing({ url: "http://localhost:3000" })).isSharing, true)
    strictEqual(reducer(undefined, startedSharing({ url: "http://localhost:3000" })).url, "http://localhost:3000")
  });
  it("sets isSharing to false when receiving a stoppedSharing() action", () => {
    strictEqual(reducer({...initialState, isSharing: true}, stoppedSharing()).isSharing, false)
  })
  it("sets isWatching to true when receiving a startedWatching() action", () => {
    strictEqual(reducer(undefined, startedWatching()).isWatching, true)
  });
  it("sets isWatching to false when receiving a stoppedWatching() action", () => {
    strictEqual(reducer({...initialState, isWatching: true}, stoppedWatching()).isWatching, false)
  })
  it("sets message when receiving a message() action", () => {
    strictEqual(reducer(undefined, message("Hello world!")).message, "Hello world!")
  })
});
