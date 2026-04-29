import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const environmentSlice = createSlice({
  name: "environment",
  initialState: {
    promptFocusRequest: false,
    promptHasFocus: false,
  },
  reducers: {
    promptFocusRequest: (state, action: PayloadAction<void>) => ({
      ...state,
      promptFocusRequest: true,
      promptHasFocus: false,
    }),
    promptHasFocus: (state, action: PayloadAction<void>) => ({
      ...state,
      promptHasFocus: true,
      promptFocusRequest: false,
      }),
  },
});

export const { promptFocusRequest, promptHasFocus } = environmentSlice.actions;
export default environmentSlice.reducer;