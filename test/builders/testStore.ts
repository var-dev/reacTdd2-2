import { configureStore } from "@reduxjs/toolkit";
import scriptReducer from "../../src/features/redux/scriptSlice.js";
import { initialState as scriptInitialState } from "../../src/features/parser.js";

export const createTestStore = (scriptOverrides = {}) =>
  configureStore({
    reducer: {
      script: scriptReducer,
    },
    preloadedState: {
      script: {
        ...scriptInitialState,
        ...scriptOverrides,
      },
    },
  });
