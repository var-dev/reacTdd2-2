import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { router } from "../app/router";
import { store } from "../app/store";

export function renderApp(ui?: ReactElement) {
  if (ui) {
    return render(<Provider store={store}>{ui}</Provider>);
  }

  return render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}
