import { type UnknownAction } from "@reduxjs/toolkit";
import { type ScriptReducer } from "./store.js";
import { undo, reset, redo } from "./scriptSlice.js";


export const withUndoRedo = (reducer: ScriptReducer) => {
let past: LogoState[] = [];
let future: LogoState[] = [];
  return (state: LogoState | undefined, action: UnknownAction) => {
    if (!state) {
      const initial = reducer(state, action);
      return {
        ...initial,
        canUndo: false,
        canRedo: false,
      };
    }
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
          ...state,
          canUndo: false,
          canRedo: future.length > 0,
        }
      }
      const tail = past.at(-1)!;
      past = past.slice(0, -1);
      future = [state, ...future]
      return {
        ...tail,
        canUndo: past.length > 0,
        canRedo: true,
      }
    }

    if (redo.match(action)) {
      if (future.length === 0) {
        return {
          ...state,
          canUndo: past.length > 0,
          canRedo: false,
        }
      }
      const head = future[0];
      future = future.slice(1);
      past = [...past, state]
      return {
        ...head,
        canUndo: true,
        canRedo: future.length > 0,
      }
    }

    const newPresent = reducer(state, action);
    if (newPresent.error) {
      return {
        ...newPresent,
        canUndo: past.length > 0,
        canRedo: future.length > 0,
      }
    }
    past = [...past, state];
    future = [];
    return {
      ...newPresent,
      canUndo: past.length > 0,
      canRedo: false,
    };
  };
};
