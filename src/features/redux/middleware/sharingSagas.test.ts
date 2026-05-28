import { it, describe, mock, beforeEach } from "node:test";
import { dom } from '../../../../test/builders/domSetup.js'
import { waitFor } from "@testing-library/react";
import type { Store, store as StoreType } from "../store.js";
import {
  requestStartSharing,
  requestStopSharing,
  shareNewAction,
  tryStartWatching,
} from "../environmentSlice.js";
import { submitEditLine } from "../scriptSlice.js";
import {  deepStrictEqual, strictEqual } from "assert";
import { END } from "redux-saga";
import createSagaMiddleware from 'redux-saga'
import { configureStore, type Middleware, type UnknownAction } from "@reduxjs/toolkit";
import scriptReducer from '../scriptSlice.js'
import environmentReducer from '../environmentSlice.js'
import { initialState } from "../../parser.js";


describe("sharingSaga", () => {
  dom.reconfigure({ url: "http://test:1234/index.html" });
  let store: typeof StoreType;
  let socketSpyFactory: ReturnType<typeof mock.method>;
  let sendSpy: ReturnType<typeof mock.fn>;
  type SocketSpy= {
    send: typeof sendSpy, 
    close: typeof closeSpy, 
    readyState: number,
    onopen: () => void, 
    onclose: () => void, 
    onmessage: (arg: {data:string})=>void
  };
  let socketSpy: SocketSpy;
  let closeSpy: ReturnType<typeof mock.fn>;
  beforeEach(async () => {
    store = (await import("../store.js")).store;
    sendSpy = mock.fn();
    closeSpy = mock.fn();
    socketSpyFactory = mock.method(globalThis, "WebSocket", function () {
      socketSpy = {
        send: sendSpy,
        close: closeSpy,
        readyState: WebSocket.OPEN
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
  describe("STOP_SHARING", () => {
    const startSharing = async () => {
      store.dispatch(requestStartSharing());
      await waitFor(() => socketSpy.onopen());
      await waitFor(() =>
        socketSpy.onmessage({data: JSON.stringify({ type: "UNKNOWN", id: 123 })}),
      );
    };
    it("calls close on the open socket", async () => {
      await startSharing();
      store.dispatch(requestStopSharing());
      strictEqual(closeSpy.mock.callCount(),1);
    });
    it("dispatches an action of STOPPED_SHARING", async () => {
      await startSharing();
      await waitFor(() => {
        strictEqual(store.getState().environment.isSharing, true, 'isSharing is set by startSharing()');
      });
      store.dispatch(requestStopSharing());
      await waitFor(() => {
        strictEqual(store.getState().environment.isSharing, false);
      });
    });
  });
  describe("SHARE_NEW_ACTION", () => {
    const startSharing = async (id: number) => {
      store.dispatch(requestStartSharing());
      await waitFor(() => socketSpy.onopen());
      await waitFor(() =>
        socketSpy.onmessage({ data: JSON.stringify({ type: "UNKNOWN", id }) }),
      );
    };
    it("forwards the same action on to the socket", async () => {
      const innerAction = { a: 123 };
      await startSharing(987);
      store.dispatch(shareNewAction(innerAction));
      await waitFor(() => {
        strictEqual(sendSpy.mock.callCount(), 2);
        strictEqual(
          sendSpy.mock.calls[1].arguments[0],
          JSON.stringify(shareNewAction(innerAction)),
        );
      });
    });
    it("does not forward if the socket is not set yet", async () => {
      store.dispatch(shareNewAction({s:1}));
      await waitFor(() => {
        strictEqual(sendSpy.mock.callCount(), 0);
      });
    });
    it("does not forward if the socket has been closed", async () => {
      const innerAction = { a: 123 };
      await startSharing(987);
      await waitFor(() => {
        strictEqual(sendSpy.mock.callCount(), 1, 'sendSpy first call');
        socketSpy.readyState = WebSocket.CLOSED;
      })
      store.dispatch(shareNewAction(innerAction));
      await waitFor(()=>{
        strictEqual(socketSpyFactory.mock.callCount(), 1, `socketSpyFactory callCount`)
        deepStrictEqual((socketSpyFactory.mock.calls[0].result as WebSocket).readyState, WebSocket.CLOSED, `socketSpy.readyState`)
      })
      await waitFor(() => {
        strictEqual(sendSpy.mock.callCount(), 1, 'no new calls after readyState: WebSocket.CLOSED');
      })
    });
  });
  describe("watching", () => {
    beforeEach(() => {
      dom.reconfigure({ url: "http://test:1234/index.html?watching=234" });
    });
    it("opens a socket when the page loads", async () => {
      store.dispatch(tryStartWatching());
      await waitFor(() => {
        strictEqual(socketSpyFactory.mock.callCount(), 1)
        strictEqual(socketSpyFactory.mock.calls[0].arguments[0], "ws://test:1234/share");
      })
    });
    it("does not open socket if the watching field is not set", async () => {
      dom.reconfigure({ url: "http://test:1234/index.html?" });
      store.dispatch(tryStartWatching());
      await waitFor(() => {
        strictEqual(socketSpyFactory.mock.callCount(), 0)
      })
    });
    const startWatchingHelper = async () => {
      store.dispatch(tryStartWatching());
      await waitFor(() => socketSpy.onopen());
    };
    it("dispatches a RESET action", async () => {
      store.dispatch(submitEditLine("fd 10"));
      await waitFor(() => {
        strictEqual(store.getState().script.turtle.x, 10);
      });
      await startWatchingHelper();

      await waitFor(() => {
        strictEqual(store.getState().script.turtle.x, 0);
        strictEqual(store.getState().script.turtle.y, 0);
        strictEqual(store.getState().script.turtle.angle, 0);
      });
    });
    it("sends the session id to the socket with an action type of START_WATCHING", async () => {
      await startWatchingHelper();
      await waitFor(() => {
        strictEqual(sendSpy.mock.callCount(), 1);
        strictEqual(sendSpy.mock.calls[0].arguments[0],
          JSON.stringify({
            type: tryStartWatching.type,
            id: "234",
          }),
        );
      })
    });
    it("dispatches a STARTED_WATCHING action", async () => {
      await startWatchingHelper();
      await waitFor(() => {
        strictEqual(store.getState().environment.isWatching, true);
      })
    });
    it("relays multiple actions from the websocket", async () => {
      const message1 = submitEditLine("fd 10");
      const message2 = submitEditLine("rt 90");
      const message3 = submitEditLine("fd 10");
      const sendSocketMessage = async (message: object) => {
        await waitFor(() => strictEqual(typeof socketSpy.onmessage, "function"));
        socketSpy.onmessage({ data: JSON.stringify(message) });
      };

      await startWatchingHelper();

      await sendSocketMessage(message1);
      await waitFor(() => {
        strictEqual(store.getState().script.turtle.x, 10);
        strictEqual(store.getState().script.turtle.y, 0);
        strictEqual(store.getState().script.turtle.angle, 0);
      });

      await sendSocketMessage(message2);
      await waitFor(() => {
        strictEqual(store.getState().script.turtle.x, 10);
        strictEqual(store.getState().script.turtle.y, 0);
        strictEqual(store.getState().script.turtle.angle, 90);
      });

      await sendSocketMessage(message3);
      await waitFor(() => {
        strictEqual(store.getState().script.turtle.x, 10);
        strictEqual(store.getState().script.turtle.y, 10);
        strictEqual(store.getState().script.turtle.angle, 90);
      });

      await sendSocketMessage(END);
      socketSpy.onclose();
      await waitFor(() => {
        strictEqual(store.getState().environment.isWatching, false, 'watching stopped');
      })
    });
  });
  describe('duplicateForSharing', async ()=>{
    let store: Store;
    let actions: UnknownAction[];

    const {sharingSaga, duplicateForSharing} = (await import("./sharingSagas.ts"));
    beforeEach(async () => {
      actions = [];
      const recordAction: Middleware = (store)=>(next)=>(action)=>{actions.push(action as UnknownAction);void(store);return next(action);  };
      const sagaMiddleware = createSagaMiddleware();
      store = configureStore({
        reducer: {
          script: scriptReducer,
          environment: environmentReducer,
        },
        preloadedState: { script: initialState } as {
          script: LogoState;
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware({
            serializableCheck: {
              ignoredPaths: ["script.allFunctions", "script.parsedStatements"],
            },
          }).concat(recordAction, sagaMiddleware, duplicateForSharing),
      }) as Store;
      sagaMiddleware.run(sharingSaga);
    });
    it('duplicate actions', async () => {
      store.dispatch(submitEditLine("fd 10"));
      await waitFor(() =>{
        strictEqual(actions[0].type, submitEditLine.type, 'expect submitEditLine');
        strictEqual(actions[1].type, shareNewAction.type, 'expect shareNewAction');
      })
    })
    it('calls ws.send stub with new action', async ()=>{
      store.dispatch(requestStartSharing())
      await waitFor(() => {strictEqual(socketSpyFactory.mock.callCount(), 1, `socketSpyFactory callCount on requestStartSharing`)});
      await waitFor(() => socketSpy.onopen());
      await waitFor(() => socketSpy.onmessage({data: JSON.stringify({ type: "UNKNOWN", id: 123 })}));
      await waitFor(() => strictEqual(store.getState().environment.isSharing, true, `isSharing`));
      store.dispatch(submitEditLine("fd 10"));
      await waitFor(() => {
        strictEqual(sendSpy.mock.callCount(), 2, `sendSpy callCount`)
        strictEqual(sendSpy.mock.calls[1].arguments[0], JSON.stringify(shareNewAction(submitEditLine("fd 10"))), `sendSpy call[1] arguments[0]`)
      });
    })
    it('receives and processes new shared action', async ()=>{
      store.dispatch(tryStartWatching())
      await waitFor(() => {strictEqual(socketSpyFactory.mock.callCount(), 1, `socketSpyFactory callCount on tryStartWatching`)});
      await waitFor(() => socketSpy.onopen());
      await waitFor(() => strictEqual(store.getState().environment.isWatching, true, `isWatching`));
      await waitFor(() => {socketSpy.onmessage({data: JSON.stringify(submitEditLine("fd 10"))})})
      await waitFor(() => {
        strictEqual(store.getState().script.turtle.x, 10);
        strictEqual(store.getState().script.turtle.y, 0);
        strictEqual(store.getState().script.turtle.angle, 0);
      });
      await waitFor(() => {
        deepStrictEqual(actions.map(({type})=>type), 
        [
          'environment/tryStartWatching',
          'script/reset',
          'environment/startedWatching',
          'script/submitEditLine',
          'environment/shareNewAction',
          'environment/wsSendRequested',
          'environment/wsSendSucceeded'
        ], 
        `actions.type list`)
      });
    })
    it('expects wsSendSucceeded after wsSendRequested', async ()=>{
      store.dispatch(requestStartSharing())
      await waitFor(() => {strictEqual(socketSpyFactory.mock.callCount(), 1, `socketSpyFactory callCount on requestStartSharing`)});
      await waitFor(() => socketSpy.onopen());
      await waitFor(() => socketSpy.onmessage({data: JSON.stringify({ type: "UNKNOWN", id: 123 })}));
      await waitFor(() => {
        strictEqual(store.getState().environment.isSharing, true, `isSharing`)
        strictEqual(actions.length, 2, `actions.length`)
        strictEqual(actions[0].type, 'environment/requestStartSharing', `action: environment/requestStartSharing`)
        strictEqual(actions[1].type, 'environment/startedSharing', `action: environment/startedSharing`)
      });

      store.dispatch(shareNewAction(submitEditLine("fd 10")))
      await waitFor(() => {
        strictEqual(actions[2].type, 'environment/shareNewAction', `action: environment/shareNewAction`)
      });
      await waitFor(() => {
        strictEqual(actions[3].type, 'environment/wsSendRequested', `action: environment/wsSendRequested`)
      });
      await waitFor(() => {
        strictEqual(actions[4].type, 'environment/wsSendSucceeded', `action: environment/wsSendSucceeded`)
      });
    })
    it('expects wsSendFailed after wsSendRequested', async ()=>{
      sendSpy.mock.mockImplementationOnce(()=>{throw new Error('test error')},1);
      store.dispatch(requestStartSharing())
      await waitFor(() => {strictEqual(socketSpyFactory.mock.callCount(), 1, `socketSpyFactory callCount on requestStartSharing`)});
      await waitFor(() => socketSpy.onopen());
      await waitFor(() => socketSpy.onmessage({data: JSON.stringify({ type: "UNKNOWN", id: 123 })}));
      await waitFor(() => {
        strictEqual(store.getState().environment.isSharing, true, `isSharing`)
        strictEqual(actions.length, 2, `actions.length`)
        strictEqual(actions[0].type, 'environment/requestStartSharing', `action: environment/requestStartSharing`)
        strictEqual(actions[1].type, 'environment/startedSharing', `action: environment/startedSharing`)
      });

      store.dispatch(shareNewAction(submitEditLine("fd 10")))
      await waitFor(()=>{strictEqual(sendSpy.mock.callCount(), 2, 'sendSpy callCount')})
      await waitFor(() => {
        deepStrictEqual(actions.map(({type})=>type), 
        [
          'environment/requestStartSharing',
          'environment/startedSharing',
          'environment/shareNewAction',
          'environment/wsSendRequested',
          'environment/wsSendFailed'
        ],
        '')
      })
    }) 
  })
});
