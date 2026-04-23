import { describe, it, beforeEach, mock } from "node:test";
import '../../test/builders/domSetup.js'
import { render, screen, cleanup } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore, type EnhancedStore } from "@reduxjs/toolkit";
import type { ReactNode } from "react";
import { type Middleware } from "@reduxjs/toolkit";
import { deepStrictEqual, strictEqual } from "assert";
import { horizontalLine, verticalLine } from "./sampleInstructions.js";

// import {
//   initializeReactContainer,
//   renderWithStore,
//   element,
//   elements,
// } from "./reactTestExtensions";
// import {
//   horizontalLine,
//   verticalLine,
//   rotate90,
// } from "./sampleInstructions.js";

//@ts-expect-error
const mockTurtle = mock.fn((...args: any[]) => <div id="Turtle" data-testid="Turtle" />);
//@ts-expect-error
const mockStaticLines = mock.fn((...args: any[]) => <div id="StaticLines" data-testid="StaticLines" />);

mock.module("./Turtle.js", {
  namedExports: { 
    Turtle: mockTurtle 
  }
});

mock.module("./StaticLines.js", {
  namedExports: {
    StaticLines: mockStaticLines
  }
});

const createTestStoreWithLogger = (initialState: LogoState) => {
  const actionLog: any[] = [];
  const actionLogger: Middleware = () => (next) => (action) => {
    actionLog.push(action);
    return next(action);
  };

  const store = configureStore({
    reducer: {
      script: (state = initialState.script as unknown as LogoState, action: any): LogoState => {
        if (action.type === 'script/submitEditLine') {
          return { ...state, nextInstructionId: (state.nextInstructionId ?? 0) + 1 }
        }
        return { ...state }
      },
    },
    preloadedState: { script: initialState.script } as unknown as { script: LogoState },
    middleware: getDefault =>
      getDefault({
        thunk: false,
        immutableCheck: false,
        serializableCheck: false
      }).concat(actionLogger),
  })
  return { store, actionLog };
}

const renderWithStore = (
  component: ReactNode,
  store: EnhancedStore
) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  )
}

describe("Drawing", () => {
  beforeEach(() => {
    cleanup();
    mockTurtle.mock.resetCalls()
    mockStaticLines.mock.resetCalls()
  });

  // const svg = () => element("svg");
  // const line = () => element("line");
  // const allLines = () => elements("line");

  it("renders an svg inside div#viewport", async () => {
    const {Drawing} = (await import("./Drawing.js"))
    const {store} = createTestStoreWithLogger({script: { drawCommands: [] }} as unknown as LogoState);
    const container = renderWithStore(<Drawing />, store).container as unknown as HTMLBodyElement;
    const svg = container.querySelector('div#viewport > svg')
    strictEqual(svg?.tagName, 'svg')
    strictEqual(svg?.getAttribute("viewBox"), '-300 -300 600 600', 'expect a view box of +/- 300 in either axis')
    strictEqual(svg?.getAttribute("preserveAspectRatio"), 'xMidYMid slice', 'expect a view box preserves aspect ratio')
  });

  it("renders a Turtle within the svg", async () => {
    const {Drawing} = (await import("./Drawing.js"))
    const turtle = { x: 10, y: 20, angle: 30 };
    const {store} = createTestStoreWithLogger({script: { drawCommands: [], turtle }} as unknown as LogoState);
    renderWithStore(<Drawing />, store).container as unknown as HTMLBodyElement;
    strictEqual(screen.getByTestId<HTMLDivElement>('Turtle').tagName, 'div')
    strictEqual(mockTurtle.mock.calls.length, 1, "Turtle component is called once")
    deepStrictEqual(mockTurtle.mock.calls[0].arguments[0], { x: 10, y: 20, angle: 30 }, "passes the turtle x, y and angle as props to Turtle")
  });

  it("renders StaticLines within the svg", async () => {
    const { Drawing } = (await import("./Drawing.js"))
    const unknown = { drawCommand: "unknown" }
    const { store } = createTestStoreWithLogger({ script: { drawCommands: [horizontalLine, verticalLine, unknown] } } as unknown as LogoState);
    renderWithStore(<Drawing />, store).container as unknown as HTMLBodyElement;
    strictEqual(screen.getByTestId<HTMLDivElement>('StaticLines').tagName, 'div')
    strictEqual(mockStaticLines.mock.calls.length, 1, "StaticLines component is called once")
    deepStrictEqual(
      mockStaticLines.mock.calls[0].arguments[0],
      {
        lineCommands: [
          {
            drawCommand: 'drawLine',
            id: 123,
            x1: 100,
            x2: 200,
            y1: 100,
            y2: 100
          },
          {
            drawCommand: 'drawLine',
            id: 234,
            x1: 200,
            x2: 200,
            y1: 100,
            y2: 200
          }
        ]
      },
      "sends only line commands to StaticLines")
  });
});

