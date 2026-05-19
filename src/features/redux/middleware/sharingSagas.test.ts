import { it, describe, mock, beforeEach } from "node:test";
import { dom } from '../../../../test/builders/domSetup.js'
import { waitFor } from "@testing-library/react";
import type { store as StoreType } from "../store.js";
import {requestStartSharing } from "../environmentSlice.js";
import { strictEqual } from "assert";

dom.reconfigure({ url: "http://test:1234/index.html" });

describe("sharingSaga", () => {
  let store: typeof StoreType;
  let socketSpyFactory: ReturnType<typeof mock.method>;
  let sendSpy: ReturnType<typeof mock.fn>;
  let socketSpy: {send: typeof sendSpy, onopen: () => void, onmessage: (arg: {data:string})=>void};
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
      store.dispatch(requestStartSharing());
      await waitFor(()=>{strictEqual(socketSpyFactory.mock.callCount(), 1)})
      strictEqual(socketSpyFactory.mock.calls[0].arguments[0],"ws://test:1234/share");
    });
    it("dispatches a START_SHARING action to the socket", async () => {
      store.dispatch(requestStartSharing());
      await waitFor(()=>socketSpy.onopen())
      await waitFor(()=>{strictEqual(sendSpy.mock.callCount(), 1)})
      strictEqual(sendSpy.mock.calls[0].arguments[0], JSON.stringify(requestStartSharing()));
    });
    it("dispatches an action of STARTED_SHARING with URL containing the id that is returned from the server", async () => {
      store.dispatch(requestStartSharing());
      await waitFor(() => socketSpy.onopen());
      await waitFor(() =>
        socketSpy.onmessage({
          data: JSON.stringify({ type: "UNKNOWN", id: 123 }),
        }),
      );
      await waitFor(() => {
        strictEqual(store.getState().environment.isSharing, true);
        strictEqual(store.getState().environment.url, "http://test:1234/index.html?watching=123");
      });
    });
  });
});
