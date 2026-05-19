import { it, describe, mock, beforeEach } from "node:test";
import { dom } from '../../../../test/builders/domSetup.js'
import { waitFor } from "@testing-library/react";
import type { store as StoreType } from "../store.js";
import {startedSharing } from "../environmentSlice.js";
import { strictEqual } from "assert";

dom.reconfigure({ url: "http://test:1234/index.html" });

describe("sharingSaga", () => {
  let store: typeof StoreType;
  let socketSpyFactory: ReturnType<typeof mock.method>;
  let sendSpy: ReturnType<typeof mock.fn>;
  let socketSpy: {send: typeof sendSpy, onopen: () => void, };
  beforeEach(async () => {
    store = (await import("../store.js")).store;
    sendSpy = mock.fn()
    socketSpyFactory = mock.method(globalThis, "WebSocket", function () {
      socketSpy = {
        send: sendSpy,
      } as typeof socketSpy;
      return socketSpy
    });
  });
  describe("START_SHARING", () => {
    it("opens a websocket when starting to share", async () => {
      store.dispatch(startedSharing({url:''}));
      await waitFor(()=>{strictEqual(socketSpyFactory.mock.callCount(), 1)})
      strictEqual(socketSpyFactory.mock.calls[0].arguments[0],"ws://test:1234/share");
    });
    it("dispatches a START_SHARING action to the socket", async () => {
      store.dispatch(startedSharing({url:''}));
      await waitFor(()=>socketSpy.onopen())
      await waitFor(()=>{strictEqual(sendSpy.mock.callCount(), 1)})
      strictEqual(sendSpy.mock.calls[0].arguments[0], JSON.stringify({ type: "environment/startedSharing" }));
    });
  });
});
