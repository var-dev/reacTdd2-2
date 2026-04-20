import { describe, it, beforeEach } from "node:test";
import { type ReactNode } from "react";
import '../test/domSetup.js'
import { render, screen, cleanup } from "@testing-library/react";
import { Provider } from "react-redux";
import { StatementHistory } from "./StatementHistory.js";
import type { EnhancedStore } from "@reduxjs/toolkit";
import { strictEqual } from "node:assert/strict";
import { configureStore } from "@reduxjs/toolkit";

beforeEach(() => {cleanup()})
describe("StatementHistory", () => {
  const initialState = {
    script: {
      parsedTokens: [
        { lineNumber: 1, text: "abc" },
        { lineNumber: 1, text: "def" },
        { lineNumber: 2, text: "abc" },
        { lineNumber: 3, text: "abc" },
      ],
    },
  } as unknown as LogoState;
  const createTestStore = (initialState: LogoState) =>
    configureStore({
      reducer: {
        script: (_: LogoState | undefined, __: any): LogoState => initialState.script as unknown as LogoState,
      },
      preloadedState: { script: initialState.script } as unknown as { script: LogoState },
    })

  const testStore = createTestStore(initialState);

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
  it('verifies store populated with initialState', ()=>{
    strictEqual(testStore.getState().script.parsedTokens.length, 4)
  })
  it("renders a tbody", () => {
    renderInTableWithStore(<StatementHistory />, testStore);
    // expect(element("tbody")).not.toBeNull();
    const tbody = screen.getByRole("rowgroup");
    strictEqual(tbody.tagName, 'TBODY');
  });

  it("renders a table cell with the line number as the first cell in each row", () => {
    renderInTableWithStore(<StatementHistory />, testStore);
    const cells = screen.getAllByRole("cell", {name: '1'});
    strictEqual(cells[0].className, 'lineNumber');
  });

  it("renders a table cell with the joined tokens as the second cell in each row", () => {
    renderInTableWithStore(<StatementHistory />, testStore);
    const rows = screen.getAllByRole<HTMLTableRowElement>( 'row');
    const cell = rows[0].cells[1] as HTMLTableCellElement;
    strictEqual(cell.textContent, 'abcdef');
  });

  it("renders a row for each line", () => {
    renderInTableWithStore(<StatementHistory />, testStore);
    // expect(elements("tr")).toHaveLength(3);
    const rows = screen.getAllByRole<HTMLTableRowElement>( 'row');
    strictEqual(rows.length, 3);
  });
});
