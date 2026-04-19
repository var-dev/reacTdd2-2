import { describe, it } from "node:test";
import { type ReactNode } from "react";
import '../test/domSetup.js'
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { StatementHistory } from "./StatementHistory.js";
import type { EnhancedStore } from "@reduxjs/toolkit";
import {createTestStore} from '../../test/builders/testStore.js'
import { strictEqual } from "node:assert/strict";

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

  const store = createTestStore(initialState);

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
    renderInTableWithStore(<StatementHistory />, store);
    const element = screen.getByRole("row",{name: /Welcome to Spec Logo/i});
    strictEqual(element.tagName, 'TR')
  });

  // const firstRowCell = (n) =>
  //   elements("tr")[0].childNodes[n];

  it("renders a table cell with the line number as the first cell in each row", () => {
    renderInTableWithStore(<StatementHistory />, store);
    const cells = screen.getAllByRole("cell", {name: '1'});
    strictEqual(cells[0].className, 'lineNumber');
  });

  it("renders a table cell with the joined tokens as the second cell in each row", () => {
    renderInTableWithStore(<StatementHistory />, store);
    const rows = screen.getAllByRole<HTMLTableRowElement>( 'row');
    const cell = rows[0].childNodes[1] as HTMLTableCellElement;
    strictEqual(cell.className, 'text');
  });

  it("renders a row for each line", () => {
    renderInTableWithStore(<StatementHistory />, store);
    // expect(elements("tr")).toHaveLength(3);
    const rows = screen.getAllByRole<HTMLTableRowElement>( 'row');
    strictEqual(rows[0].childNodes.length, 2);
  });
});
