import { type Reducer, type UnknownAction } from "@reduxjs/toolkit";
import { undo, reset, redo, submitEditLine } from "./scriptSlice.js";

type UndoEnabledLogoState = LogoState & {
  canUndo: boolean;
  canRedo: boolean;
};

type ScriptReducer = Reducer<LogoState, UnknownAction>;
type UndoEnabledScriptReducer = Reducer<UndoEnabledLogoState, UnknownAction, LogoState>;

export const withUndoRedo = (reducer: ScriptReducer): UndoEnabledScriptReducer => {
  let past: LogoState[] = [];
  let future: LogoState[] = [];
  return (state: LogoState | undefined, action: UnknownAction): UndoEnabledLogoState => {
    const present = state ?? reducer(undefined, action);

    if (reset.match(action)) {
      past = [];
      future = [];
      return {
        ...reducer(state, action),
        canUndo: false,
        canRedo: false,
      };
    }
    if (undo.match(action)) {
      if (past.length === 0) {
        return {
          ...present,
          canUndo: false,
          canRedo: future.length > 0,
        };
      }
      const tail = past.at(-1)!;
      past = past.slice(0, -1);
      future = [present, ...future];
      return {
        ...tail,
        canUndo: past.length > 0,
        canRedo: true,
      };
    }
    if (redo.match(action)) {
      if (future.length === 0) {
        return {
          ...present,
          canUndo: past.length > 0,
          canRedo: false,
        };
      }
      const head = future[0];
      future = future.slice(1);
      past = [...past, present];
      return {
        ...head,
        canUndo: true,
        canRedo: future.length > 0,
      };
    }
    if (submitEditLine.match(action)) {
      const newPresent = reducer(state, action);
      if (newPresent === state || newPresent.error) {
        return {
          ...newPresent,
          canUndo: past.length > 0,
          canRedo: future.length > 0,
        };
      }
      past = [...past, present];
      future = [];
      return {
        ...newPresent,
        canUndo: past.length > 0,
        canRedo: false,
      };
    }
    return {
      ...reducer(state, action),
      canUndo: past.length > 0,
      canRedo: future.length > 0,
    };
  };
};
