import { describe, it, beforeEach } from "node:test";
import '../../test/builders/domSetup.js'
import { ScriptName } from "./ScriptName.js";
import { store } from "../features/redux/store.js";
import {type ReactNode } from "react";
import { type EnhancedStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render, screen, cleanup} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { strictEqual } from "node:assert/strict";

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
beforeEach(() => {cleanup()})

describe("ScriptName", () => {
  it("renders an input box with the script name from the store", () => {
    renderWithStore(<ScriptName />, store);
    const input = screen.getByLabelText<HTMLInputElement>('Script name input');
    strictEqual(input.value,'Unnamed script')
  });

  it("has a class name of isEditing when the input field has focus", async () => {
    const user = userEvent.setup()
    renderWithStore(<ScriptName />, store);
    const input = screen.getByLabelText<HTMLInputElement>('Script name input');
    await user.click(input)
    strictEqual(input.className,'isEditing')
  });

  it("does not initially have a class name of isEditing", () => {
    renderWithStore(<ScriptName />, store);
    const input = screen.getByLabelText<HTMLInputElement>('Script name input');
    strictEqual(input.className,'')
  });

  describe("when the user hits Enter", () => {
    it("submits the new name when the user hits Enter", async () => {
    const user = userEvent.setup()
      renderWithStore(<ScriptName />, store);
      const input = screen.getByLabelText<HTMLInputElement>('Script name input');
      await user.click(input)
      await user.clear(input)
      await user.type(input,'new name{Enter}')
      strictEqual(store.getState().script.name, 'new name', 'expect name: new name')
      strictEqual(input.className,'', 'expect no isEditing className')
    });

  //   it("does not resubmit when losing focus after change", () => {
  //     renderWithStore(<ScriptName />);
  //     withFocus(element("input"), () => {
  //       enterName("new name");
  //     });
  //     expect(element("input")).not.toHaveClass(
  //       "isEditing"
  //     );
  //   });
  });

  describe("when the user moves focus somewhere else", () => {
    it("submits the new name when the field loses focus", async () => {
    const user = userEvent.setup()
      renderWithStore(<ScriptName />, store);
      const input = screen.getByLabelText<HTMLInputElement>('Script name input');
      await user.click(input)
      await user.clear(input)
      await user.type(input,'new name')
      await user.tab()
      strictEqual(store.getState().script.name, 'new name', 'expect name: new name')
      strictEqual(input.className,'', 'expect no isEditing className')
    });
  });
});
