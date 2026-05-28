import { describe, it, beforeEach, mock } from "node:test";
import '../../test/builders/domSetup.js'
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore, type EnhancedStore, type UnknownAction } from "@reduxjs/toolkit";
import type { ReactNode } from "react";
import { type Middleware } from "@reduxjs/toolkit";
import { submitEditLine, reset } from "../features/redux/scriptSlice.js";
import { requestStartSharing, startedSharing, stoppedSharing } from "../features/redux/environmentSlice.js";
import { strictEqual } from "assert";
import { MenuButtons } from "./MenuButtons.js";

describe("MenuButtons", () => {
  beforeEach(() => {
    cleanup();
  });

  const createTestStoreWithLogger = (initialState: LogoState) => {
    const actionLog: UnknownAction[] = [];
    const actionLogger: Middleware = () => (next) => (action) => {
      actionLog.push(action as UnknownAction);
      return next(action);
    };

    const store = configureStore({
      reducer: {
        script: (state = initialState.script as unknown as LogoState, action: UnknownAction): LogoState => {
          if (action.type === 'script/submitEditLine') {
            return { ...state, nextInstructionId: (state.nextInstructionId ?? 0) + 1 }
          }
          return { ...state }
        },
        environment: (state = {isSharing: false, url: ''})=>{
          return {...state}
        }
      },
      preloadedState: { script: initialState.script } as unknown as { script: LogoState },
      middleware: getDefault =>
        getDefault({
          thunk: false,
          immutableCheck: false,
          serializableCheck: false
        }).concat(actionLogger),
    })
    return { store, actionLog };
  }

  const renderWithStore = (
    component: ReactNode,
    store: EnhancedStore
  ) => {
    return render(
      <Provider store={store}>
        {component}
      </Provider>
    )
  }
  describe("reset button", () => {
    it("renders", () => {
      const {store} = createTestStoreWithLogger({script:{nextInstructionId: 0}} as unknown as LogoState);
      renderWithStore(<MenuButtons />, store);
      strictEqual(screen.getByText("Reset").tagName, "BUTTON");
      strictEqual(screen.getByText<HTMLButtonElement>("Reset").hasAttribute("disabled"), true, 'should be disabled initially');
    });

    it("is enabled once a state change occurs", async () => {
      const {store} = createTestStoreWithLogger({script:{nextInstructionId: 0}} as unknown as LogoState);
      renderWithStore(<MenuButtons />, store);
      await waitFor(()=>{store.dispatch(submitEditLine("forward 10\n"));})
      strictEqual(screen.getByText<HTMLButtonElement>("Reset").hasAttribute("disabled"), false, 'should be enabled after state change');
    });

    it("dispatches an action of RESET when clicked", async () => {
      const user = userEvent.setup();
      const {store, actionLog} = createTestStoreWithLogger({script:{nextInstructionId: 0}} as unknown as LogoState);
      renderWithStore(<MenuButtons />, store);
      await waitFor(()=>{store.dispatch(submitEditLine("forward 10\n"));})
      await user.click(screen.getByText("Reset"));
      strictEqual(actionLog.at(-2)!.type, reset.type)
    });
  });
  describe("undo button", () => {
    it("renders", () => {
      const {store} = createTestStoreWithLogger({script:{nextInstructionId: 0}} as unknown as LogoState);
      renderWithStore(<MenuButtons />, store);
      strictEqual(screen.getByText("Undo").tagName, "BUTTON");
      strictEqual(screen.getByText<HTMLButtonElement>("Undo").hasAttribute("disabled"), true, 'should be disabled initially');
    });

    it("is enabled once a state change occurs", async () => {
      const {store} = await import('../features/redux/store.js')
      renderWithStore(<MenuButtons />, store);
      await waitFor(()=>{store.dispatch(submitEditLine("forward 10\n"));})
      strictEqual(screen.getByText<HTMLButtonElement>("Undo").hasAttribute("disabled"), false, 'should be enabled after state change');
    });

    it("dispatches an action of script/Undo when clicked", async () => {
      const user = userEvent.setup();
      const {store} = await import('../features/redux/store.js')
      await waitFor(()=>{store.dispatch(reset());})
      renderWithStore(<MenuButtons />, store);
      await waitFor(()=>{store.dispatch(submitEditLine("forward 10\n"));})
      await user.click(screen.getByText("Undo"));
      await waitFor(()=>{
        strictEqual(store.getState().script.canUndo, false, 'expect canUndo === false')
        strictEqual(store.getState().script.canRedo, true, 'expect canRedo === true')
      })
    });
  });
  describe("redo button", () => {
    it("renders", () => {
      const {store} = createTestStoreWithLogger({script:{nextInstructionId: 0}} as unknown as LogoState);
      renderWithStore(<MenuButtons />, store);
      strictEqual(screen.getByText("Redo").tagName, "BUTTON");
      strictEqual(screen.getByText<HTMLButtonElement>("Redo").hasAttribute("disabled"), true, 'should be disabled initially');
    });

    it("is enabled once a state change occurs", async () => {
      const user = userEvent.setup();
      const {store} = await import('../features/redux/store.js')
      renderWithStore(<MenuButtons />, store);
      await waitFor(()=>{store.dispatch(submitEditLine("forward 10\n"));})
      await user.click(screen.getByText("Undo"));
      await waitFor(()=>{
        strictEqual(screen.getByText<HTMLButtonElement>("Redo").hasAttribute("disabled"), false, 'should be enabled after Undo click');
      })
    });

    it("dispatches an action of script/Redo when clicked", async () => {
      const user = userEvent.setup();
      const {store} = await import('../features/redux/store.js')
      await waitFor(()=>{store.dispatch(reset());})
      renderWithStore(<MenuButtons />, store);
      await waitFor(()=>{store.dispatch(submitEditLine("forward 10\n"));})
      await user.click(screen.getByText("Undo"));
      await user.click(screen.getByText("Redo"));
      await waitFor(()=>{
        strictEqual(store.getState().script.canUndo, true, 'expect canUndo === true')
        strictEqual(store.getState().script.canRedo, false, 'expect canRedo === false')
      })
    });
  });
  describe("sharing button", () => {
    let socketSpyFactory: ReturnType<typeof mock.method>;
    type SocketSpy= {
      send: () => void, 
      close: () => void, 
      readyState: number,
      onopen: () => void, 
      onclose: () => void, 
      onmessage: (arg: {data:string})=>void
    };
    let socketSpy: SocketSpy;
    beforeEach(() => {
      socketSpyFactory = mock.method(
        globalThis,
        "WebSocket",
        function () {
          socketSpy = {
            close: () => { },
            send: () => { },
            onopen: () => {}, 
            onclose: () => {}, 
            onmessage: (arg: {data:string})=>{void arg},
            readyState: WebSocket.OPEN,
        } as SocketSpy;
        return socketSpy;
      });
    });

    const notifySocketOpened = async () => {
      const data = JSON.stringify({ type: "UNKNOWN", id: 1 });
      await waitFor(async () => {socketSpy.onopen()});
      await waitFor(async () => {socketSpy.readyState = WebSocket.OPEN});
      await waitFor(async () => {socketSpy.onmessage({ data })});
    };

    it("renders Start sharing by default", async () => {
      const {store} = await import('../features/redux/store.js')
      renderWithStore(<MenuButtons />, store);
      const buttonStartSharing = screen.getByText("Start sharing")
      strictEqual(buttonStartSharing.tagName, "BUTTON");
    });

    it("renders Stop sharing if sharing has started", async () => {
      const {store} = await import('../features/redux/store.js')
      renderWithStore(<MenuButtons />, store);
      await waitFor(()=>store.dispatch(startedSharing({url: 'http://test',})))
      await waitFor(()=>{
        const buttonStopSharing =screen.getByText("Stop sharing")
        strictEqual(buttonStopSharing.tagName, "BUTTON");
      })
    });

    it("renders Start sharing if sharing has stopped", async () => {
      const {store} = await import('../features/redux/store.js')
      renderWithStore(<MenuButtons />, store);
      await waitFor(()=>store.dispatch(startedSharing({url: 'http://test',})))
      await waitFor(()=>store.dispatch(stoppedSharing()))
      await waitFor(()=>{
        const buttonStartSharing =screen.getByText("Start sharing")
        strictEqual(buttonStartSharing.tagName, "BUTTON");
      })
    });

    it("dispatches an action of START_SHARING when start sharing is clicked", async () => {
      const user = userEvent.setup()
      const {store} = await import('../features/redux/store.js')
      renderWithStore(<MenuButtons />, store);
      const buttonStartSharing =screen.getByText("Start sharing")
      await user.click(buttonStartSharing);
      await notifySocketOpened();
      await waitFor(() => {
        strictEqual(store.getState().environment.isSharing, true, 'isSharing should be true')
        strictEqual(socketSpyFactory.mock.callCount(), 1, 'socketSpyFactory called')
      })
      await waitFor(() => {
        strictEqual(store.getState().environment.isSharing, true, 'isSharing should be true')
      })
    });
    it("dispatches an action of STOP_SHARING when stop sharing is clicked", async () => {
      const user = userEvent.setup();
      const {store} = await import('../features/redux/store.js')
      renderWithStore(<MenuButtons />, store);
      await waitFor(()=>{store.dispatch(requestStartSharing())})
      await notifySocketOpened();
      await waitFor(()=>{strictEqual(socketSpyFactory.mock.callCount(), 1, 'socketSpyFactory called')})
      const buttonStopSharing = await waitFor(()=> screen.getByText("Stop sharing"))
      await user.click(buttonStopSharing);
      await waitFor(() => {
        strictEqual(store.getState().environment.isSharing, false, 'isSharing should be false')
      })
    });

    describe("messages", () => {
      // it("renders a message containing the url if sharing has started", () => {
      //   const {store} = await import('../features/redux/store.js')
      //   renderWithStore(<MenuButtons />, store);
      //   dispatchToStore({
      //     type: "STARTED_SHARING",
      //     url: "http://123",
      //   });
      //   expect(container.innerHTML).toContain(
      //     'You are now presenting your script. <a href="http://123">Here\'s the URL for sharing.</a></p>'
      //   );
      // });

      // it("renders a message when watching has started", () => {
      //   const {store} = await import('../features/redux/store.js')
      //   renderWithStore(<MenuButtons />, store);
      //   dispatchToStore({ type: "STARTED_WATCHING" });
      //   expect(container.innerHTML).toContain(
      //     "<p>You are now watching the session</p>"
      //   );
      // });
    });
  });
});
