import { createSlice } from "@reduxjs/toolkit";

export interface AppState {
  ready: boolean;
}

const initialState: AppState = {
  ready: true,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {},
});

export const appReducer = appSlice.reducer;
