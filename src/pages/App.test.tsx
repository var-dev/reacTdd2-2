import { describe, it, beforeEach, mock } from "node:test";
import '../../test/builders/domSetup.js'
import { render, screen, cleanup } from "@testing-library/react";
import { Provider } from "react-redux";
import { type EnhancedStore } from "@reduxjs/toolkit";
import type { ReactNode } from "react";
import { strictEqual } from "assert";
import { store } from "../features/redux/store.js";

const ScriptName = mock.fn(() => <div id="ScriptName" data-testid="ScriptName" />)
mock.module("./ScriptName.js", {
  namedExports:{ScriptName}
});

const MenuButtons = mock.fn(() => <div id="MenuButtons" data-testid="MenuButtons" />)
mock.module("./MenuButtons.js", {
  namedExports:{MenuButtons}
});

const Drawing = mock.fn(() => <div id="Drawing" data-testid="Drawing" />)
mock.module("./Drawing.js", {
  namedExports:{Drawing}
});

const StatementHistory = mock.fn(() => <tbody id="StatementHistory" data-testid="StatementHistory" />)
mock.module("./StatementHistory.js", {
  namedExports:{StatementHistory}
});

const Prompt = mock.fn(() => <tbody id="Prompt" data-testid="Prompt" />)
mock.module("./Prompt.js", {
  namedExports:{Prompt}
});

const PromptError = mock.fn(() => <tbody id="PromptError" data-testid="PromptError" />)
mock.module("./PromptError.js", {
  namedExports:{PromptError}
});


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

describe("App", () => {
  beforeEach(() => {
    cleanup();
    ScriptName.mock.resetCalls()
    MenuButtons.mock.resetCalls()
    Drawing.mock.resetCalls()
    StatementHistory.mock.resetCalls()
    Prompt.mock.resetCalls()
    PromptError.mock.resetCalls()
  });

  it("renders a ScriptName component as the first item in  the menu", async () => {
    const {App} = await import("./App.js");
    renderWithStore(<App />, store);
    strictEqual(ScriptName.mock.calls.length, 1)
    strictEqual(screen.getByTestId('ScriptName').tagName, 'DIV')
  });

  it("renders a MenuButtons component as the second items in the menu", async () => {
    const {App} = await import("./App.js");
    renderWithStore(<App />, store);
    const menu = screen.getByRole<HTMLMenuElement>('list')
    const ids = Array.from(menu.childNodes as unknown as HTMLElement[], (el)=>el.id)
    strictEqual(ids.includes('ScriptName'), true, 'ScriptName menu item')
    strictEqual(ids.includes('MenuButtons'), true, 'MenuButtons menu item')
  });

  it("renders a Display component in div#drawing", async () => {
    const {App} = await import("./App.js");
    renderWithStore(<App />, store);
    strictEqual(Drawing.mock.calls.length, 1)
    strictEqual(screen.getByTestId('Drawing').tagName, 'DIV')
  });

  it("renders a table in div#commands", async () => {
    const {App} = await import("./App.js");
    renderWithStore(<App />, store);
    const menu = screen.getByRole<HTMLMenuElement>('table')
    const ids = Array.from(menu.childNodes as unknown as HTMLElement[], (el)=>el.id)
    strictEqual(ids.includes('StatementHistory'), true, 'StatementHistory table item')
    strictEqual(ids.includes('Prompt'), true, 'Prompt table item')
    strictEqual(ids.includes('PromptError'), true, 'PromptError table item')
  });
});
