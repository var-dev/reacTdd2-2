import { configureStore } from "@reduxjs/toolkit";
import scriptReducer from './scriptSlice.js'

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
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;