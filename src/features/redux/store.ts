import { configureStore } from "@reduxjs/toolkit";
import scriptReducer from './scriptSlice.js'
import { initialState } from "../parser.js";
import { withUndoRedo } from "./withUndoRedo.js";
import { save, load} from './middleware/localStorage.js';

export const store = configureStore({
  reducer: {
    script: withUndoRedo(scriptReducer),
  },
  preloadedState: {script: load()?.script ?? initialState} as { script: LogoState },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(save),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type ScriptReducer = typeof scriptReducer