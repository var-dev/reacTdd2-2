import { describe, it, beforeEach, mock } from "node:test";
import '../../test/builders/domSetup.js'
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore, type EnhancedStore } from "@reduxjs/toolkit";
import type { ReactNode } from "react";
import { type Middleware } from "@reduxjs/toolkit";
import { deepStrictEqual, strictEqual } from "assert";
import { horizontalLine, verticalLine } from "./sampleInstructions.js";
import type { AnimatedLineProps } from "./AnimatedLine.js";
import { ok } from "assert/strict";

//@ts-expect-error
const mockTurtle = mock.fn(({ x, y, angle }: TurtleState) => <polygon id="Turtle" data-testid="Turtle" x={x} y={y} angle={angle}/>);
//@ts-expect-error
const mockStaticLines = mock.fn((...args: any[]) => <line id="StaticLines" data-testid="StaticLines" />);

const fakeAnimatedLine = (props: AnimatedLineProps) => {
    void(props)
    return <line data-testid='animatedLine' />
  }
const realAnimatedLine = (await import ("./AnimatedLine.js")).AnimatedLine
const mockAnimatedLine = mock.fn((props:AnimatedLineProps)=>fakeAnimatedLine(props))
mock.module("./AnimatedLine.js", {
  namedExports: {
    AnimatedLine: mockAnimatedLine
  }
})

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
    mockAnimatedLine.mock.resetCalls()
  });

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
    strictEqual(screen.getByTestId<HTMLDivElement>('Turtle').tagName, 'polygon')
    strictEqual(mockTurtle.mock.calls.length, 1, "Turtle component is called once")
  });
  it("initially places the turtle at 0,0 with angle 0", async ()=>{
    const {Drawing} = (await import("./Drawing.js"))
    const {store} = createTestStoreWithLogger({script: { drawCommands: [] }} as unknown as LogoState);
    renderWithStore(<Drawing />, store).container as unknown as HTMLBodyElement;
    const turtle = await waitFor(()=>screen.getByTestId<HTMLDivElement>('Turtle'))
    // deepStrictEqual(mockTurtle.mock.calls[0].arguments[0], { x: 0, y: 0, angle: 30 }, "passes the turtle x, y and angle as props to Turtle")
    strictEqual(turtle.getAttribute('x'), '0', 'expect attr x=0')
    strictEqual(turtle.getAttribute('y'), '0', 'expect attr y=0')
    strictEqual(turtle.getAttribute('angle'), '0', 'expect attr angle=0')
  })

  it("renders StaticLines within the svg", async () => {
    const { Drawing } = (await import("./Drawing.js"))
    const unknown = { drawCommand: "unknown" }
    const { store } = createTestStoreWithLogger({ script: { drawCommands: [horizontalLine, verticalLine, unknown] } } as unknown as LogoState);
    renderWithStore(<Drawing />, store).container as unknown as HTMLBodyElement;
    strictEqual(screen.getByTestId<HTMLDivElement>('StaticLines').tagName, 'line')
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
  describe("movement animation", () => {
    window.requestAnimationFrame = () => 0;
    const horizontalLineDrawn = {
      script: {
        drawCommands: [horizontalLine],
        turtle: { x: 0, y: 0, angle: 0 },
      },
    };
    it("invokes requestAnimationFrame when the timeout fires", async () => {
      const { Drawing } = (await import("./Drawing.js"))
      const { store } = createTestStoreWithLogger(horizontalLineDrawn as unknown as LogoState);
      const RAF = mock.method(window, "requestAnimationFrame");
      renderWithStore(<Drawing />, store).container as unknown as HTMLBodyElement;
      strictEqual(RAF.mock.callCount(), 1);
    });

    it("renders AnimatedLine with turtle at the start position when the animation has run for 0s", async () => {
      const { Drawing } = (await import("./Drawing.js"))
      const { store } = createTestStoreWithLogger(horizontalLineDrawn as unknown as LogoState);
      const RAF = mock.method(window, "requestAnimationFrame");
      renderWithStore(<Drawing />, store).container as unknown as HTMLBodyElement;
      strictEqual(RAF.mock.callCount(), 1, 'RAF called once');
      const rafCallBack = RAF.mock.calls[0].arguments[0]
      deepStrictEqual(rafCallBack.name, 'handleDrawLineFrame', 'expect handleDrawLineFrame callback')
      await waitFor(()=>rafCallBack(0))
      await waitFor(()=>{strictEqual(mockAnimatedLine.mock.callCount(), 2)})
      deepStrictEqual(mockAnimatedLine.mock.calls[1].arguments[0], 
        {
          commandToAnimate: horizontalLine,
          turtle: { x: 100, y: 100, angle: 0 }
        }
      );
    });
    it("does not render AnimatedLine when not moving", async () => {
      const { Drawing } = (await import("./Drawing.js"))
      const { store } = createTestStoreWithLogger({script: {drawCommands: []}} as unknown as LogoState);
      renderWithStore(<Drawing />, store).container as unknown as HTMLBodyElement;
      ok(!screen.queryByTestId('animatedLine'))
    });
    it("renders an AnimatedLine with turtle at a position based on a speed of 5px per ms", async () => {
      const { Drawing } = (await import("./Drawing.js"))
      const { store } = createTestStoreWithLogger(horizontalLineDrawn as unknown as LogoState);
      const RAF = mock.method(window, "requestAnimationFrame");
      renderWithStore(<Drawing />, store).container as unknown as HTMLBodyElement;
      strictEqual(RAF.mock.callCount(), 1, 'RAF called once');
      const rafCallBack = RAF.mock.calls[0].arguments[0]
      deepStrictEqual(rafCallBack.name, 'handleDrawLineFrame', 'expect handleDrawLineFrame callback')
      await waitFor(()=>rafCallBack(0))
      await waitFor(()=>rafCallBack(250))
      await waitFor(()=>{strictEqual(mockAnimatedLine.mock.callCount(), 3)})
      deepStrictEqual(mockAnimatedLine.mock.calls[2].arguments[0], 
        {
          commandToAnimate: horizontalLine,
          turtle: { x: 150, y: 100, angle: 0 }
        }
      );
    })
  });
});

