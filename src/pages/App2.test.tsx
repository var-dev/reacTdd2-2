import { describe, it, beforeEach, mock } from "node:test";
import '../../test/builders/domSetup.js'
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Provider } from "react-redux";
import { type EnhancedStore } from "@reduxjs/toolkit";
import type { ReactNode } from "react";
import { strictEqual } from "assert";
import { store } from "../features/redux/store.js";
import { reset } from "../features/redux/scriptSlice.js";

window.requestAnimationFrame = () => 0;

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
    store.dispatch(reset());
  });
it('animates next command after Undo', async ()=>{
      const { App } = (await import("./App.js"))
      const user = userEvent.setup()
      const RAF = mock.method(window, "requestAnimationFrame", ()=>void 0);
      renderWithStore(<App />, store);
      const bUndo = screen.getByText(/Undo/)
      const prompt = screen.getByLabelText(/Prompt Textarea/)
      await user.type(prompt, "fd 100{enter}")
      await user.type(prompt, "rt 90{enter}")
      await user.type(prompt, "fd 100{enter}")
      strictEqual(RAF.mock.callCount(), 3)
    })

});
    