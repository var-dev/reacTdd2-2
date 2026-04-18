import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { parseStatement, initialState } from "../parser.js";

const scriptSlice = createSlice({
  name: "script",
  initialState,
  reducers: {
    submitScriptName: (state, action: PayloadAction<string>) => ({
      ...state,
      name: action.payload,
    }),
    submitEditLine: (state, action: PayloadAction<string>) =>
      parseStatement(action.payload, {
        ...state,
        error: undefined,
      }),
    reset: () => initialState,
  },
});

export const { submitScriptName, submitEditLine, reset } = scriptSlice.actions;
export default scriptSlice.reducer;