import { describe, it, beforeEach, mock } from "node:test";
import '../../test/builders/domSetup.js'
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { type EnhancedStore } from "@reduxjs/toolkit";
import type { ReactNode } from "react";
import { strictEqual } from "assert";
import { store } from "../features/redux/store.js";
import { reset,} from "../features/redux/scriptSlice.js";
import userEvent from "@testing-library/user-event";

window.requestAnimationFrame = () => 0;
window.cancelAnimationFrame = () => void 0;

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

describe("App end-to-end tests", () => {
  beforeEach(() => {
    cleanup();
    store.dispatch(reset());
  });
  it('resets the turtle back to the origin when Reset is clicked', async () => {
    const { App } = (await import("./App.js"))
    const user = userEvent.setup()
    const { container } = renderWithStore(<App />, store)

    const prompt = screen.getByLabelText(/Prompt Textarea/)
    const reset = screen.getByText(/Reset/)

    await user.type(prompt, "fd 100{Enter}")
    await user.type(prompt, "rt 90{Enter}")

    await user.click(reset)

    await waitFor(() => {
      const turtle = container.querySelector("polygon")
      strictEqual(
        turtle?.getAttribute("transform"),
        "rotate(90, 0, 0)",
        "turtle is reset to origin with zero rotation after Reset"
      )
    })
  })
  it('animates next command after Undo', async () => {
    let frameId = 0
    let time = 0
    const { App } = (await import("./App.js"))
    const user = userEvent.setup()
    const RAF = mock.method(window, "requestAnimationFrame", (cb: (time: number) => number) => {
      time += 10;
      Promise.resolve().then(() => cb(time));
      return frameId++
    });
    const CAF = mock.method(window, "cancelAnimationFrame", () => void 0);
    renderWithStore(<App />, store);
    const undo = screen.getByText(/Undo/)
    const prompt = screen.getByLabelText(/Prompt Textarea/)
    await user.type(prompt, "fd 100{Enter}")
    await user.type(prompt, "rt 90{Enter}")
    await user.type(prompt, "fd 100{Enter}")
    await waitFor(() => strictEqual(RAF.mock.callCount(), 51 + 51 + 51, 'requestAnimationFrame calls before undo'))
    await user.click(undo)
    await waitFor(() => strictEqual(RAF.mock.callCount(), 153 + 1, 'requestAnimationFrame calls after undo'))
    await user.type(prompt, "fd 100{Enter}")
    await waitFor(() => strictEqual(RAF.mock.callCount(), 51 + 51 + 51 + 1 + 51, 'requestAnimationFrame calls for 5 events'))
    await waitFor(() => strictEqual(frameId, 205, 'frameId'))
    await waitFor(() => strictEqual(CAF.mock.callCount(), 5, 'cancelAnimationFrame'))
  })
  it('repositions the turtle after Undo and preserves its rotation', async () => {
    let frameId = 0
    let time = 0
    const { App } = (await import("./App.js"))
    const user = userEvent.setup()
    const RAF = mock.method(window, "requestAnimationFrame", (cb: (time: number) => number) => {
      time += 10
      Promise.resolve().then(() => cb(time))
      return frameId++
    })
    mock.method(window, "cancelAnimationFrame", () => void 0)

    const { container } = renderWithStore(<App />, store)
    const undo = screen.getByText(/Undo/)
    const prompt = screen.getByLabelText(/Prompt Textarea/)

    await user.type(prompt, "fd 100{Enter}")
    await user.type(prompt, "rt 90{Enter}")
    await user.type(prompt, "fd 100{Enter}")

    await waitFor(() => strictEqual(RAF.mock.callCount(), 153, "initial animation completed"))

    await user.click(undo)

    await waitFor(() => {
      const turtle = container.querySelector("polygon")
      strictEqual(
        turtle?.getAttribute("transform"),
        "rotate(180, 100, 0)",
        "turtle is repositioned to x=100,y=0 and keeps 90° orientation after undo"
      )
    })
  })
});
    
