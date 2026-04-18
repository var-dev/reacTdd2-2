import React from "react";
import ReactDOM from "react-dom/client";
import '../test/domSetup.js'
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../features/redux/store.js";

let container: HTMLDivElement;
let reactRoot: ReactDOM.Root;

export const initializeReactContainer = () => {
  container = document.createElement("div");
  document.body.replaceChildren(container);
  reactRoot = ReactDOM.createRoot(container);
};

export const renderWithStore = (component: React.ReactNode): void => {
  render(<Provider store={ store } > { component } </Provider>)
};


