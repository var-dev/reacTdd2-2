import { configureStore } from "@reduxjs/toolkit";
import scriptReducer from './scriptSlice.js'
import { initialState } from "../parser.js";
import { withUndoRedo } from "./withUndoRedo.js";

export const store = configureStore({
  reducer: {
    script: withUndoRedo(scriptReducer),
  },
  preloadedState: {script: initialState}
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type ScriptReducer = typeof scriptReducer