import { createSlice, createAction, type PayloadAction, type UnknownAction } from "@reduxjs/toolkit";

const environmentSlice = createSlice({
  name: "environment",
  initialState: {
    promptFocusRequest: false,
    promptHasFocus: false,
    isSharing: false,
    url: "",
    isWatching: false,
    message: "",
  },
  reducers: {
    promptFocusRequest: (state,) => ({
      ...state,
      promptFocusRequest: true,
      promptHasFocus: false,
    }),
    promptHasFocus: (state,) => ({
      ...state,
      promptHasFocus: true,
      promptFocusRequest: false,
    }),
    message: (state, action: PayloadAction<string>) => ({
      ...state,
      message: action.payload,
    }),
    startedSharing: (state, action: PayloadAction<{ url: string }>) => ({
      ...state,
      isSharing: true,
      url: action.payload.url,
    }),
    stoppedSharing: (state,) => ({
      ...state,
      isSharing: false,
    }),
    startedWatching: (state,) => ({
      ...state,
      isWatching: true,
    }),
    stoppedWatching: (state,) => ({
      ...state,
      isWatching: false,
    }),
  },
});

export const requestStartSharing = createAction<void>('environment/requestStartSharing')
export const requestStopSharing = createAction<void>('environment/requestStopSharing')
export const shareNewAction = createAction<UnknownAction>('environment/shareNewAction')
export const tryStartWatching = createAction<void>('environment/tryStartWatching')
export const tryStopWatching = createAction<void>('environment/tryStopWatching')

export const wsSendRequested = createAction<{wsMessage: string}>("environment/wsSendRequested");
export const wsSendSucceeded = createAction<{wsMessage: string}>("environment/wsSendSucceeded");
export const wsSendFailed = createAction<{wsMessage: string; error: SerializableError}>("environment/wsSendFailed");

export const { 
  promptFocusRequest, 
  promptHasFocus,
  message,
  startedSharing,
  stoppedSharing,
  startedWatching,
  stoppedWatching, 
} = environmentSlice.actions;
export default environmentSlice.reducer;
