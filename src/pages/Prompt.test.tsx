import { describe, it, beforeEach } from "node:test";
import '../../test/builders/domSetup.js'
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import type { Middleware } from "@reduxjs/toolkit";
import { configureStore, type EnhancedStore } from "@reduxjs/toolkit";
import type { ReactNode } from "react";
import { Prompt } from "./Prompt.js";
import { strictEqual, notStrictEqual, deepStrictEqual } from "assert";
import { promptFocusRequest } from "../features/redux/environmentSlice.js";

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

beforeEach(() => {
  cleanup();
});


describe("Prompt", () => {
  const createTestStore = (initialState: LogoState) =>
    configureStore({
      reducer: {
        script: (_: LogoState | undefined, __: any): LogoState => initialState.script as unknown as LogoState,
        environment: (_: any, __: any) => ({promptFocusRequest: false, promptHasFocus: false}),
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
              return {...(state ?? {}), nextInstructionId: ((state as LogoState).nextInstructionId ?? 0) + 1} as LogoState
            }
          return {...(state ?? {})} as LogoState
          },
          environment: (_: any, __: any) => ({promptFocusRequest: false, promptHasFocus: false}),
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
describe("prompt focus", async () => {
  const {store } = await import ('../features/redux/store.js')
  const textArea = () => screen.getByLabelText('Prompt Textarea')
  it("sets focus when component first renders", () => {
    renderInTableWithStore(<Prompt />, store);
    strictEqual(document.activeElement?.tagName, textArea().tagName);
  })
  it("clears focus on user tab event", async () => {
    const user = userEvent.setup()
    renderInTableWithStore(<Prompt />, store);
    const ta = textArea()
    await user.tab()
    await waitFor(() => notStrictEqual(document.activeElement?.tagName, ta.tagName ));
  });
  it("calls focus on the underlying DOM element if promptFocusRequest is true", async () => {
    const user = userEvent.setup()
    renderInTableWithStore(<Prompt />, store);
    const ta = textArea()
    await user.tab()
    await waitFor(()=>{store.dispatch(promptFocusRequest())})
    await waitFor(() => strictEqual(document.activeElement?.tagName, ta.tagName ));
  });
  it("dispatches an action notifying that the prompt has focused", async () => {
    let promptFocusRequestProgress: boolean[] = [];
    store.subscribe(() => {
      const {environment} = store.getState()
      promptFocusRequestProgress = [...promptFocusRequestProgress, environment.promptFocusRequest]
    })
    renderInTableWithStore(<Prompt />, store);
    await waitFor(() => deepStrictEqual(promptFocusRequestProgress, [], 'initial focus timeline []'));
    await waitFor(()=>{store.dispatch(promptFocusRequest())})
    await waitFor(() => deepStrictEqual(promptFocusRequestProgress, [true, false], 'promptFocusRequest flipped true on dispatch and false on completion' ));
  });
});