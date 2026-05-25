import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./features/redux/store.js";
import { App } from "./pages/App.js";
import { tryStartWatching } from "./features/redux/environmentSlice.js";

store.dispatch(tryStartWatching());

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <Provider store={store}>
      <App />
  </Provider>
);
