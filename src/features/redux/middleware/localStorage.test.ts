import { deepStrictEqual, strictEqual } from "assert";
import '../../../../test/builders/domSetup.js'
import { describe, it, beforeEach, mock } from "node:test";
import { configureStore, type UnknownAction, } from "@reduxjs/toolkit";
import { submitScriptName } from "../scriptSlice.js";

const parsedTokens: Token[] = [
  { type: "token", lineNumber: 34, text: "forward", instructionId: 0 },
  { type: "whitespace", lineNumber: 34, text: "", instructionId: 0 },
  { type: "token", lineNumber: 34, text: "10", instructionId: 0 },
  { type: "whitespace", lineNumber: 34, text: "", instructionId: 0 },
];

const createTestStore = (initialState: LogoState, middleware: any) =>
  configureStore({
    reducer: {
      script: (_: LogoState | undefined, __: any): LogoState =>
        initialState.script as unknown as LogoState,
    },
    preloadedState: { script: initialState.script } as unknown as {
      script: LogoState;
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(middleware),
  });

let parser = (await import("../../parser.js"))
const parseTokens = mock.fn<typeof parser.parseTokens>((tokens: Token[], state: LogoState) => parser.parseTokens(tokens, state))
mock.module("../../parser.js",{
  namedExports:        {
      parseTokens,
      emptyState: parser.emptyState,
    }
})

describe("localStorage", () => {
  let getItemSpy = mock.fn() as it.Mock<(...args:any[])=>{}>;
  let setItemSpy = mock.fn();
  beforeEach(() => {
    mock.property<Window, keyof Window>(window, 'localStorage', {
      getItem: getItemSpy,
      setItem: setItemSpy,
    })
  });
  describe("save middleware", async () => {
    const { save } = await import("./localStorage.js");
    const name = "script name";
    // const parsedTokens = ["forward 10"];
    const state = { script: { name, parsedTokens } } as unknown as LogoState;
    const store = createTestStore(state, save ) ;
    let action: it.Mock<()=>UnknownAction>;
    let next: it.Mock<(action: UnknownAction) => UnknownAction>;

    beforeEach(() => {
      next = mock.fn();
      action = mock.fn();
      setItemSpy.mock.resetCalls()
      getItemSpy.mock.resetCalls()
    });

    it("calls next with the action", () => {
      const callMiddleware = () => save(store)(next as (action: unknown) => unknown)(submitScriptName(name));
      callMiddleware();
      strictEqual(next.mock.calls[0].arguments[0].type, submitScriptName(name).type);
    });
    it("returns the result of next action", () => {
      const callMiddleware = () => save(store)(next as (action: unknown) => unknown)(submitScriptName(name));
      next.mock.mockImplementationOnce((a) => a)
      deepStrictEqual(callMiddleware(), { payload: 'script name', type: 'script/submitScriptName'});
      strictEqual(setItemSpy.mock.calls.length, 2);
      deepStrictEqual(setItemSpy.mock.calls[0].arguments, ['name', 'script name'], 'expect setItem called with ("name", "script name")');
      deepStrictEqual(setItemSpy.mock.calls[1].arguments, ['parsedTokens', JSON.stringify(parsedTokens)], 'expect setItem called with "parsedTokens"');
    });
    it("saves the current state of the store in localStorage #2", () => {
      store.dispatch(submitScriptName(name))
      strictEqual(setItemSpy.mock.calls.length, 2);
      deepStrictEqual(setItemSpy.mock.calls[0].arguments, ['name', 'script name'], 'expect setItem called with ("name", "script name")');
      deepStrictEqual(setItemSpy.mock.calls[1].arguments, ['parsedTokens', JSON.stringify(parsedTokens)], 'expect setItem called with "parsedTokens"');
    });
  });
  describe("load", async () => {
    describe("with saved data", async () => {
      const { load } = await import("./localStorage.js");
      beforeEach(() => {
        getItemSpy.mock.resetCalls()
        getItemSpy.mock.mockImplementationOnce(()=> 'script name', 0);
        getItemSpy.mock.mockImplementationOnce(()=> JSON.stringify(parsedTokens), 1);
      });
      it("calls to parsedTokens to retrieve data", async () => {
        load();
        strictEqual(getItemSpy.mock.calls[0].arguments[0],"name",'expect to be called with name');
        strictEqual(getItemSpy.mock.calls[0].result,"script name", 'result script name');
        strictEqual(getItemSpy.mock.calls[1].arguments[0], "parsedTokens", 'expect to be called with parsedTokens');
        strictEqual(getItemSpy.mock.calls[1].result,JSON.stringify(parsedTokens), 'result parsedTokens');
      });
      it('returns re-parsed tokens and name', ()=>{
        const {script} = load()!
        deepStrictEqual(script!.parsedTokens, parsedTokens)
        strictEqual(script!.name, "script name")
      })
      it("returns undefined if there is no state saved", () => {
        getItemSpy.mock.resetCalls()
        getItemSpy.mock.mockImplementationOnce(():any=> {}, 1);
        deepStrictEqual(load(), undefined);
      });
    });
  });
});
