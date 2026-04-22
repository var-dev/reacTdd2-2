import { describe, it, beforeEach } from "node:test";
import '../../test/builders/domSetup.js'
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import type { Middleware } from "@reduxjs/toolkit";
import { configureStore, type EnhancedStore } from "@reduxjs/toolkit";
import type { ReactNode } from "react";
import { Prompt } from "./Prompt.js";
import { strictEqual } from "assert";

describe("Prompt", () => {
  beforeEach(() => {
    cleanup();
  });


  const createTestStore = (initialState: LogoState) =>
    configureStore({
      reducer: {
        script: (_: LogoState | undefined, __: any): LogoState => initialState.script as unknown as LogoState,
      },
      preloadedState: { script: initialState.script } as unknown as { script: LogoState },
    })

  const createTestStoreWithLogger = (initialState: LogoState) => {
    const actionLog: any[] = [];
    const actionLogger: Middleware = () => (next) => (action) => {
      actionLog.push(action);
      return next(action);
    };

    const store = configureStore({
      reducer: {
        script: (state = initialState.script as unknown as LogoState , action: any): LogoState => 
          {
            if(action.type === 'script/submitEditLine') {
              return {...state, nextInstructionId: (state.nextInstructionId ?? 0) + 1}
            }
          return {...state}
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

  const renderInTableWithStore = (
    component: ReactNode,
    store: EnhancedStore
  ) => {
    return render(
      <Provider store={store}>
        <table>{component}</table>
      </Provider>
    )
  }

  it("renders a tbody", () => {
    const testStore = createTestStore({script:{}} as unknown as LogoState);
    renderInTableWithStore(<Prompt />, testStore);
    const tbody = screen.getByRole("rowgroup");
    strictEqual(tbody.tagName, 'TBODY');
  });

  it("renders a table cell with a prompt indicator as the first cell", () => {
    const testStore = createTestStore({script:{}} as unknown as LogoState);
    renderInTableWithStore(<Prompt />, testStore);
    strictEqual(screen.getAllByRole("cell")[0].textContent, ">")
  });

  it("sets a class of promptIndicator on the first cell", () => {
    const testStore = createTestStore({script:{}} as unknown as LogoState);
    renderInTableWithStore(<Prompt />, testStore);
    strictEqual(screen.getAllByRole("cell")[0].className, "promptIndicator")
  });

  it("renders a table cell with an empty textarea as the second cell", () => {
    const testStore = createTestStore({script:{}} as unknown as LogoState);
    renderInTableWithStore(<Prompt />, testStore);
    strictEqual((screen.getAllByRole<HTMLTableCellElement>("cell")[1].firstChild as HTMLElement).tagName, "TEXTAREA")
  });

  const textArea = () => screen.getAllByRole<HTMLTableCellElement>("cell")[1].firstChild as HTMLTextAreaElement

  it("sets the textarea to have an empty value", () => {
    const testStore = createTestStore({script:{}} as unknown as LogoState);
    renderInTableWithStore(<Prompt />, testStore);
    strictEqual(textArea().value, "");
  });

  it("sets the textarea to initially have a height of 20", () => {
    const testStore = createTestStore({script:{}} as unknown as LogoState);
    renderInTableWithStore(<Prompt />, testStore);
    strictEqual(textArea().getAttribute("style"), "height: 20px;");
  });

  it("dispatches an action with the updated edit line when the user hits enter on the text field", async () => {
    const user = userEvent.setup();
    const line =
      "repeat 4[[ forward 10 right 90 ]{Enter}";
    const {store, actionLog} = createTestStoreWithLogger({script:{}} as unknown as LogoState);
    renderInTableWithStore(<Prompt />, store);
    const ta = textArea()
    await user.clear(ta)
    await user.type(ta, line);

    strictEqual(actionLog[0].type, 'script/submitEditLine', 'expect submitEditLine');
    strictEqual(actionLog[0].payload, 'repeat 4[ forward 10 right 90 ]\n', 'expect payload repeat 4[ forward 10 right 90 ]');
    await waitFor(() => {
      strictEqual(ta.value, "", "expect after submitting edit line: blanks the edit field")
    })
  });
});
