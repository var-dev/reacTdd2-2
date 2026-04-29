import type { Middleware, Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { emptyState, parseTokens } from "../../parser.js";

export const save: Middleware<Dispatch<UnknownAction>> =
  (store) => (next) => (action: unknown) => {
    const result = next(action);
    const {
      script: { name, parsedTokens },
    } = store.getState();
    window.localStorage.setItem("name", name);
    window.localStorage.setItem("parsedTokens", JSON.stringify(parsedTokens));
    return result;
  };

export const load = () => {
  const name = window.localStorage.getItem("name");
  const tokens = JSON.parse(
    window.localStorage.getItem("parsedTokens") || '[]',
  ) as Token[];
  if (!tokens || tokens === null || tokens.length===0) return undefined
  return {
    script: { ...parseTokens(tokens, emptyState), name },
  };
};