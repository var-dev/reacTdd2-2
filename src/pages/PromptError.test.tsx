import { describe, it, beforeEach } from "node:test";
import '../../test/builders/domSetup.js'
import { render, screen, cleanup } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore, type EnhancedStore } from "@reduxjs/toolkit";
import type { ReactNode } from "react";
import { PromptError } from "./PromptError.js";
import { strictEqual } from "assert";


  const createTestStore = (initialState: LogoState) =>
    configureStore({
      reducer: {
        script: (_: LogoState | undefined, __: any): LogoState => initialState.script as unknown as LogoState,
      },
      preloadedState: { script: initialState.script } as unknown as { script: LogoState },
    })

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

describe("PromptError", () => {
  const testStore = createTestStore({script:{}} as unknown as LogoState);
  beforeEach(() => {
    cleanup();
  });

  it("renders a tbody", () => {
    renderInTableWithStore(<PromptError />, testStore);
    const tbody = screen.getByRole("rowgroup");
    strictEqual(tbody.tagName, 'TBODY');
  });

  it("renders a single td with a colspan of 2", () => {
    renderInTableWithStore(<PromptError />, testStore);
    const td = screen.getByRole("cell");
    strictEqual(td.getAttribute("colSpan"), "2");
  });

  it("has no error text in the table cell", () => {
    renderInTableWithStore(<PromptError />, testStore);
    // expect(element("td")).toContainText("");
    const td = screen.getByRole("cell");
    strictEqual(td.textContent, "");
  });

  describe("with error present", () => {
    const initialStoreState = {
      script: {
        error: { description: "error message" },
      },
    };
    const testStore = createTestStore(initialStoreState as unknown as LogoState);

    it("displays the error from state in a table cell", () => {
      renderInTableWithStore(<PromptError />, testStore);
      // expect(element("td")).toContainText(  "error message");
      const td = screen.getByRole("cell");
      strictEqual(td.textContent, "error message");
    });
  });
});
