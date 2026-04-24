import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./features/redux/store.js";
import { App } from "./pages/App.js";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <Provider store={store}>
      <App />
  </Provider>
);
