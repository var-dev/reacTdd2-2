import { configureStore } from "@reduxjs/toolkit";
import scriptReducer from './scriptSlice.js'
import { initialState } from "../parser.js";

// export const configureStore = (storeEnhancers = [], initialState = {}) => {
//   return createStore(
//     combineReducers({
//       script: scriptReducer,
//     }),
//     initialState,
//     compose(...storeEnhancers),
//   );
// };

export const store = configureStore({
  reducer: {
    script: scriptReducer,
  },
  preloadedState: {script: initialState}
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;