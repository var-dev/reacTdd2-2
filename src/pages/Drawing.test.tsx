import { describe, it, beforeEach, mock } from "node:test";
import '../../test/builders/domSetup.js'
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore, type EnhancedStore } from "@reduxjs/toolkit";
import type { ReactNode } from "react";
import { type Middleware } from "@reduxjs/toolkit";
import { deepStrictEqual, strictEqual } from "assert";
import { horizontalLine, verticalLine, rotate90 } from "./sampleInstructions.js";
import type { AnimatedLineProps } from "./AnimatedLine.js";
import { ok } from "assert/strict";

window.requestAnimationFrame = () => 0;
window.cancelAnimationFrame = () => void 0;

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
    await waitFor(()=>{strictEqual(mockStaticLines.mock.calls.length, 1, "StaticLines component is called once")})
  });
  describe("movement animation", () => {
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
    it("calculates move distance with a non-zero animation start time", async () => {
      const startTime = 12345;
      const { Drawing } = (await import("./Drawing.js"))
      const { store } = createTestStoreWithLogger(horizontalLineDrawn as unknown as LogoState);
      const RAF = mock.method(window, "requestAnimationFrame");
      renderWithStore(<Drawing />, store).container as unknown as HTMLBodyElement;
      strictEqual(RAF.mock.callCount(), 1, 'RAF called once');
      const rafCallBack = RAF.mock.calls[0].arguments[0]
      deepStrictEqual(rafCallBack.name, 'handleDrawLineFrame', 'expect handleDrawLineFrame callback')
      await waitFor(()=>rafCallBack(startTime))
      await waitFor(()=>rafCallBack(startTime+250))
      await waitFor(()=>{strictEqual(mockAnimatedLine.mock.callCount(), 3)})
      deepStrictEqual(mockAnimatedLine.mock.calls[2].arguments[0], 
        {
          commandToAnimate: horizontalLine,
          turtle: { x: 150, y: 100, angle: 0 }
        }
      );
    })
    it("invokes requestAnimationFrame repeatedly until the duration is reached", async () => {
      const { Drawing } = (await import("./Drawing.js"))
      const { store } = createTestStoreWithLogger(horizontalLineDrawn as unknown as LogoState);
      const RAF = mock.method(window, "requestAnimationFrame");
      renderWithStore(<Drawing />, store).container as unknown as HTMLBodyElement;
      strictEqual(RAF.mock.callCount(), 1, 'RAF called once');
      const rafCallBack = RAF.mock.calls[0].arguments[0]
      deepStrictEqual(rafCallBack.name, 'handleDrawLineFrame', 'expect handleDrawLineFrame callback')
      await waitFor(()=>rafCallBack(0))
      await waitFor(()=>rafCallBack(250))
      await waitFor(()=>rafCallBack(500))
      await waitFor(()=>{strictEqual(mockAnimatedLine.mock.callCount(), 3)})
      deepStrictEqual(mockAnimatedLine.mock.calls[2].arguments[0], 
        {
          commandToAnimate: horizontalLine,
          turtle: { x: 150, y: 100, angle: 0 }
        }
      );
    })
    describe("after animation", () => {
      it("animates the next command", async () => {
        const { Drawing } = (await import("./Drawing.js"))
        const { store } = createTestStoreWithLogger({ script: {drawCommands: [horizontalLine, verticalLine], turtle: {x: 0, y: 0, angle: 0}}} as unknown as LogoState);
        const RAF = mock.method(window, "requestAnimationFrame");
        renderWithStore(<Drawing />, store).container as unknown as HTMLBodyElement;
        strictEqual(RAF.mock.callCount(), 1, 'RAF called once');
        const rafCallBack = RAF.mock.calls[0].arguments[0]
        deepStrictEqual(rafCallBack.name, 'handleDrawLineFrame', 'expect handleDrawLineFrame callback')
        await waitFor(() => rafCallBack(0))
        await waitFor(() => rafCallBack(500))
        await waitFor(() => { strictEqual(mockAnimatedLine.mock.callCount(), 3) })
        deepStrictEqual(mockAnimatedLine.mock.calls[2].arguments[0],
          {
            commandToAnimate: verticalLine,
            turtle: { x: 100, y: 100, angle: 0 }
          }
        );
      })
      it("places line in StaticLines", async () => {
        const { Drawing } = (await import("./Drawing.js"))
        const { store } = createTestStoreWithLogger({ script: {drawCommands: [horizontalLine, verticalLine], turtle: {x: 0, y: 0, angle: 0}}} as unknown as LogoState);
        const RAF = mock.method(window, "requestAnimationFrame");
        renderWithStore(<Drawing />, store).container as unknown as HTMLBodyElement;
        strictEqual(RAF.mock.callCount(), 1, 'RAF called once');
        const rafCallBack = RAF.mock.calls[0].arguments[0]
        deepStrictEqual(rafCallBack.name, 'handleDrawLineFrame', 'expect handleDrawLineFrame callback')
        await waitFor(() => rafCallBack(0))
        await waitFor(() => rafCallBack(500))
        await waitFor(() => { strictEqual(mockStaticLines.mock.callCount(), 3)})
        const actual = await waitFor(() => mockStaticLines.mock.calls[2].arguments[0])
        const expected = {lineCommands:[horizontalLine]}
        deepStrictEqual(actual, expected)
      })
      it("calls cancelAnimationFrame", async () => {
        const { Drawing } = (await import("./Drawing.js"))
        const { store } = createTestStoreWithLogger({ script: {drawCommands: [horizontalLine]}} as unknown as LogoState);
        const RAF = mock.method(window, "requestAnimationFrame",()=>55);
        const CAF = mock.method(window, "cancelAnimationFrame");
        const {unmount} = renderWithStore(<Drawing />, store);
        strictEqual(RAF.mock.callCount(), 1, 'RAF called once');
        unmount()
        await waitFor(() => {
          strictEqual(CAF.mock.callCount(), 1, 'CAF called once')
          strictEqual(CAF.mock.calls[0].arguments[0], 55)
        })
      })
      it("does not call cancelAnimationFrame if no line animating", async () => {
        const { Drawing } = (await import("./Drawing.js"))
        const { store } = createTestStoreWithLogger({ script: {drawCommands: []}} as unknown as LogoState);
        const RAF = mock.method(window, "requestAnimationFrame", ()=>55);
        const CAF = mock.method(window, "cancelAnimationFrame");
        const {unmount} = renderWithStore(<Drawing />, store);
        unmount()
        await waitFor(() => strictEqual(RAF.mock.callCount(), 0, 'RAF not called'));
        await waitFor(() => strictEqual(CAF.mock.callCount(), 0, 'CAF not called'))
      })
    })
  });

  describe("rotation animation", () => {
    const rotationPerformed = {
      script: { drawCommands: [rotate90] },
    };
    it("rotates the turtle", async () => {
      const { Drawing } = (await import("./Drawing.js"))
      const { store } = createTestStoreWithLogger(rotationPerformed as unknown as LogoState);
      const RAF = mock.method(window, "requestAnimationFrame", ()=>void 0);
      renderWithStore(<Drawing />, store);
      strictEqual(RAF.mock.callCount(), 1, 'RAF called once');
      const rafCallBack = RAF.mock.calls[0].arguments[0]!
      deepStrictEqual(rafCallBack.name, 'handleRotationFrame', 'expect handleRotationFrame callback')
      await waitFor(() => rafCallBack(0))
      await waitFor(() => rafCallBack(500))
      strictEqual(mockTurtle.mock.calls.length, 3)
      deepStrictEqual(mockTurtle.mock.calls[2].arguments[0],
        {
          x: 0,
          y: 0,
          angle: 90
        }
      );
    });
    it("rotates part-way at a speed of 1s per 180 degrees", async () => {
      const { Drawing } = (await import("./Drawing.js"))
      const { store } = createTestStoreWithLogger(rotationPerformed as unknown as LogoState);
      const RAF = mock.method(window, "requestAnimationFrame", ()=>void 0);
      renderWithStore(<Drawing />, store);
      strictEqual(RAF.mock.callCount(), 1, 'RAF called once');
      const rafCallBack = RAF.mock.calls[0].arguments[0]!
      deepStrictEqual(rafCallBack.name, 'handleRotationFrame', 'expect handleRotationFrame callback')
      await waitFor(() => rafCallBack(12345))
      await waitFor(() => rafCallBack(12345+250))
      strictEqual(mockTurtle.mock.calls.length, 3)
      deepStrictEqual(mockTurtle.mock.calls[2].arguments[0],
        {
          x: 0,
          y: 0,
          angle: 45
        }
      );
    });
    it("invokes requestAnimationFrame repeatedly until the duration is reached", async () => {
      const { Drawing } = (await import("./Drawing.js"))
      const { store } = createTestStoreWithLogger(rotationPerformed as unknown as LogoState);
      const RAF = mock.method(window, "requestAnimationFrame", ()=>void 0);
      renderWithStore(<Drawing />, store);
      strictEqual(RAF.mock.callCount(), 1, 'RAF called once');
      const rafCallBack = RAF.mock.calls[0].arguments[0]!
      deepStrictEqual(rafCallBack.name, 'handleRotationFrame', 'expect handleRotationFrame callback')
      await waitFor(() => rafCallBack(0))
      await waitFor(() => rafCallBack(250))
      await waitFor(() => rafCallBack(500))
      strictEqual(mockTurtle.mock.calls.length, 4)
    });
    it("animates the next command once rotation is complete", async () => {
      let rafId = 0
      const { Drawing } = (await import("./Drawing.js"))
      const { store } = createTestStoreWithLogger({ script: {drawCommands: [rotate90, horizontalLine], turtle: {x: 0, y: 0, angle: 0}}} as unknown as LogoState);
      const RAF = mock.method(window, "requestAnimationFrame", (cb: Function)=>rafId++);
      renderWithStore(<Drawing />, store).container as unknown as HTMLBodyElement;
      strictEqual(RAF.mock.callCount(), 1, 'RAF called once');
      let rafCallBack = RAF.mock.calls[0].arguments[0]
      strictEqual(rafCallBack.name, 'handleRotationFrame', 'expect handleRotationFrame callback')

      await waitFor(() => rafCallBack(0))
      await waitFor(()=>{strictEqual(RAF.mock.callCount(), 2, 'RAF called again #2');})
      rafCallBack = RAF.mock.calls[1].arguments[0]
      strictEqual(rafCallBack.name, 'handleRotationFrame', 'expect handleRotationFrame callback #2') 

      await waitFor(() => rafCallBack(500))
      await waitFor(()=>{strictEqual(RAF.mock.callCount(), 3, 'RAF called again #3');})
      rafCallBack = RAF.mock.calls[2].arguments[0]
      strictEqual(rafCallBack.name, 'handleDrawLineFrame', 'expect handleDrawLineFrame callback #3') 

      await waitFor(() => rafCallBack(0))
      await waitFor(()=>{strictEqual(RAF.mock.callCount(), 4, 'RAF called again #4');})
      rafCallBack = RAF.mock.calls[3].arguments[0]
      strictEqual(rafCallBack.name, 'handleDrawLineFrame', 'expect handleDrawLineFrame callback #4') 

      await waitFor(() => rafCallBack(250))
      await waitFor(()=>{strictEqual(RAF.mock.callCount(), 5, 'RAF called again #5');})
      rafCallBack = RAF.mock.calls[4].arguments[0]
      strictEqual(rafCallBack.name, 'handleDrawLineFrame', 'expect handleDrawLineFrame callback #5')
      await waitFor(() => { strictEqual(mockTurtle.mock.callCount(), 5, 'Turtle called times') })
      await waitFor(() => { strictEqual(mockAnimatedLine.mock.callCount(), 3, 'AnimatedLine called times')})
      deepStrictEqual(mockAnimatedLine.mock.calls[2].arguments[0],
        {
          commandToAnimate: horizontalLine,
          turtle: { x: 150, y: 100, angle: 90 }
        }
      );      
    })
  })
});

