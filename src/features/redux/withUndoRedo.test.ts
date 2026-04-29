import { describe, it, before, afterEach, mock } from 'node:test';
import '../../../test/builders/domSetup.js'
import { type ScriptReducer } from './store';
import { type EnhancedStore, type UnknownAction } from '@reduxjs/toolkit';
import { strictEqual } from 'assert';
import { reset, submitEditLine, undo, redo } from './scriptSlice.js';

type ScriptDecorator = (reducer: ScriptReducer) => (state: LogoState | undefined, action: UnknownAction) => LogoState
let mockDecorator: it.Mock<ScriptDecorator>
let mockReducer: it.Mock<ReturnType<ScriptDecorator>>
let store: EnhancedStore<{ script: LogoState }>

before(async () => {
  const { withUndoRedo } = await import("./withUndoRedo.js");
  mockDecorator = mock.fn<ScriptDecorator>((reducer)=>{
    const innerFn = withUndoRedo(reducer)
    mockReducer = mock.fn(innerFn)
    return mockReducer
  });
  mock.module("./withUndoRedo.js", {
    namedExports: {
      withUndoRedo: mockDecorator,
    },
  });
  store = (await import('./store.js')).store
});
afterEach(()=>{
  // mockDecorator.mock.resetCalls()
  // mockReducer.mock.resetCalls()
  store.dispatch(reset())
})

describe("withUndoRedo", () => {
  it("should be calling decorator and reducer", async () => {
    strictEqual(mockDecorator.mock.callCount(), 1, 'mockDecorator')
    strictEqual(mockReducer.mock.callCount(), 3, 'mockReducer')
  });
  it("cannot undo", () => {
    strictEqual(store.getState().script.canUndo, false)
  });
  it("cannot redo", () => {
    strictEqual(store.getState().script.canRedo, false)
  });
  it("canUndo", () => {
    store.dispatch(submitEditLine('fd 5'))
    strictEqual(store.getState().script.canUndo, true, 'parsedStatements.length > 0')
    store.dispatch(submitEditLine('bd 5'))
    strictEqual(store.getState().script.canUndo, true, 'expect canUndo === true')
    strictEqual(store.getState().script.parsedStatements.length, 2, 'expect parsedStatements.length === 2')
    strictEqual(store.getState().script.parsedStatements[0].name, 'fd', 'expect first command to be fd')
    strictEqual(store.getState().script.parsedStatements[1].name, 'bd', 'expect last command to be bd')
  });
  it("undo last command", () => {
    store.dispatch(submitEditLine('fd 5'))
    store.dispatch(submitEditLine('rt 90'))
    store.dispatch(undo())
    strictEqual(store.getState().script.parsedStatements.length, 1, 'expect parsedStatements.length === 1')
    strictEqual(store.getState().script.parsedStatements[0].name, 'fd', 'expect last command to be fd after undo')
  });
  it("can undo multiple levels", () => {
    store.dispatch(submitEditLine('fd 5'))
    store.dispatch(submitEditLine('rt 90'))
    store.dispatch(submitEditLine('bd 5'))
    store.dispatch(undo())
    store.dispatch(undo())
    strictEqual(store.getState().script.parsedStatements.length, 1, 'expect parsedStatements.length === 1')
    strictEqual(store.getState().script.parsedStatements[0].name, 'fd', 'expect last command to be fd after undo')
  });
  it("can undo multiple levels: invalid commands ignored", () => {
    store.dispatch(submitEditLine('fd 5'))
    store.dispatch(submitEditLine('invalid 1'))
    store.dispatch(submitEditLine('rt 90'))
    store.dispatch(submitEditLine('invalid 2'))
    store.dispatch(submitEditLine('bd 5'))
    store.dispatch(undo())
    store.dispatch(undo())
    strictEqual(store.getState().script.parsedStatements.length, 1, 'expect parsedStatements.length === 1')
    strictEqual(store.getState().script.parsedStatements[0].name, 'fd', 'expect last command to be fd after undo')
    strictEqual(store.getState().script.canRedo, true, 'expect canRedo true')
  });
  it("canRedo", () => {
    store.dispatch(submitEditLine('fd 5'))
    store.dispatch(submitEditLine('bd 9'))
    store.dispatch(undo())
    store.dispatch(redo())
    strictEqual(store.getState().script.canRedo, false, 'expect canRedo === false')
    strictEqual(store.getState().script.parsedStatements.length, 2, 'expect parsedStatements.length === 2')
    strictEqual(store.getState().script.parsedStatements[1].name, 'bd', 'expect last command to be bd')
  });
  it("can redo multiple levels", () => {
    store.dispatch(submitEditLine('fd 5'))
    store.dispatch(submitEditLine('rt 90'))
    store.dispatch(submitEditLine('bd 5'))
    store.dispatch(undo())
    store.dispatch(undo())
    store.dispatch(submitEditLine('invalid 1'))
    store.dispatch(redo())
    store.dispatch(submitEditLine('invalid 2'))
    store.dispatch(redo())
    strictEqual(store.getState().script.parsedStatements.length, 3, 'expect parsedStatements.length === 3')
    strictEqual(store.getState().script.parsedStatements[0].name, 'fd', 'expect fd')
    strictEqual(store.getState().script.parsedStatements[1].name, 'rt', 'expect rt')
    strictEqual(store.getState().script.parsedStatements[2].name, 'bd', 'expect bd')
    strictEqual(store.getState().script.canRedo, false, 'expect canRedo false')
  });
  it("canRedo false after new instruction", () => {
    store.dispatch(submitEditLine('fd 5'))
    store.dispatch(submitEditLine('rt 90'))
    store.dispatch(submitEditLine('bd 5'))
    store.dispatch(undo())
    store.dispatch(undo())
    store.dispatch(submitEditLine('lt 180'))
    strictEqual(store.getState().script.parsedStatements.length, 2, 'expect parsedStatements.length === 2')
    strictEqual(store.getState().script.parsedStatements[0].name, 'fd', 'expect fd')
    strictEqual(store.getState().script.parsedStatements[1].name, 'lt', 'expect lt')
    strictEqual(store.getState().script.canRedo, false, 'expect canRedo false')
  });
});