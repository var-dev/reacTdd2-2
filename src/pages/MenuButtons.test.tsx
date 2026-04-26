import { describe, it, beforeEach } from "node:test";
import '../../test/builders/domSetup.js'
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore, type EnhancedStore } from "@reduxjs/toolkit";
import type { ReactNode } from "react";
import { type Middleware } from "@reduxjs/toolkit";
import { submitEditLine, reset } from "../features/redux/scriptSlice.js";
import { strictEqual } from "assert";
import { MenuButtons } from "./MenuButtons.js";

describe("MenuButtons", () => {
  beforeEach(() => {
    cleanup();
  });

  const createTestStoreWithLogger = (initialState: LogoState) => {
    const actionLog: any[] = [];
    const actionLogger: Middleware = () => (next) => (action) => {
      actionLog.push(action);
      return next(action);
    };

    const store = configureStore({
      reducer: {
        script: (state = initialState.script as unknown as LogoState, action: any): LogoState => {
          if (action.type === 'script/submitEditLine') {
            return { ...state, nextInstructionId: (state.nextInstructionId ?? 0) + 1 }
          }
          return { ...state }
        },
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
      strictEqual(actionLog.at(-1).type, reset.type)
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
      strictEqual(screen.getByText<HTMLButtonElement>("Redo").hasAttribute("disabled"), false, 'should be enabled after Undo click');
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
});
