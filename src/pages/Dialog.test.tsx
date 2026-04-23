import { describe, it, beforeEach, mock } from "node:test";
import '../../test/builders/domSetup.js'
import { render, screen, cleanup } from "@testing-library/react";
import userEvent  from "@testing-library/user-event";
import { deepStrictEqual, strictEqual } from "assert";
import { Dialog } from "./Dialog.js";

describe("Dialog", () => {
  beforeEach(() => {
    cleanup();
  });

  const onChoose = mock.fn((id:number)=>{void(id)})
  const onClose = mock.fn()
  const testProps = {
    message: "Hello",
    buttons: [],
    onChoose,
    onClose,
  };

  it("renders a div with className dialog", () => {
    const {container} = render(<Dialog {...testProps} />);
    const dialog = container.querySelector<HTMLDivElement>('.dialog');
    strictEqual(dialog?.tagName, 'DIV');
  });

  it("renders message in a paragraph element", () => {
    render(
      <Dialog
        {...testProps}
        message="This is a message"
      />
    );
    strictEqual(screen.getByText(/this is a message/i)?.tagName, 'P')
  });

  it("renders a div with className dialogButtons inside dialog", () => {
    const {container} = render(<Dialog {...testProps} />);
    const dialogBtn = container.querySelector<HTMLDivElement>('.dialog > .dialogButtons');
    strictEqual(dialogBtn?.tagName, 'DIV');
  });


  it("renders button properties", () => {
    render(
      <Dialog
        {...testProps}
        buttons={[{ id: "yes", text: "Yes" }]}
      />
    );
    const buttons = screen.getAllByRole<HTMLButtonElement>('button')
    const yes = buttons.map(b=>b.textContent).filter(t=>t==='Yes')
    strictEqual(yes.length, 1)
  });

  it("renders all buttons inside the dialogButtons div", () => {
    render(
      <Dialog
        {...testProps}
        buttons={[
          { id: "yes", text: "Yes" },
          { id: "no", text: "No" },
        ]}
      />
    );
    const buttons = screen.getAllByRole<HTMLButtonElement>('button')
    const yesNo = buttons.map(b=>b.textContent)
    deepStrictEqual(yesNo, ['Yes', 'No'])
  });

  it("calls onChoose with the button id when it is clicked", async () => {
    const user = userEvent.setup()
    render(
      <Dialog
        {...testProps}
        buttons={[
          { id: "yes", text: "Yes" },
          { id: "no", text: "No" },
        ]}
      />
    );
    const yes = screen.getByText<HTMLButtonElement>('Yes') 
    await user.click(yes)
    deepStrictEqual(onChoose.mock.calls[0].arguments, [ 'yes' ], 'expect ["yes"]')
    strictEqual(onClose.mock.callCount(), 1, 'calls onClose when a button is clicked')
  });
});
