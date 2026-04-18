import { describe, it, beforeEach, mock } from "node:test";
import {
  parseStatement,
  parseTokens,
  initialState,
} from "./parser.js";
import { deepStrictEqual, strictEqual } from "assert";
import { ok } from "assert/strict";

describe("parseStatement", () => {
  it("moves forward", () => {
    const result = parseStatement(
      "forward 10",
      initialState as LogoState
    );
    deepStrictEqual(result.drawCommands, [
      {
        drawCommand: "drawLine",
        id: 0,
        x1: 0,
        y1: 0,
        x2: 10,
        y2: 0,
      },
    ]);
  });

  it("moves forward by a different amount", () => {
    const result = parseStatement(
      "forward 20",
      initialState as LogoState
    );
    deepStrictEqual(result.drawCommands, [
      {
        drawCommand: "drawLine",
        id: 0,
        x1: 0,
        y1: 0,
        x2: 20,
        y2: 0,
      },
    ]);
  });

  it("starts at a different position", () => {
    const result = parseStatement("forward 20", {
      ...initialState as LogoState,
      turtle: { x: 10, y: 10, angle: 0 },
    });
    deepStrictEqual(result.drawCommands,[
      {
        drawCommand: "drawLine",
        id: 0,
        x1: 10,
        y1: 10,
        x2: 30,
        y2: 10,
      },
    ]);
  });

  it("returns the new turtle position", () => {
    const result = parseStatement("forward 20", {
      ...initialState as LogoState,
      turtle: { x: 10, y: 10, angle: 0 },
    });
    strictEqual(result.turtle.x, 30, 'expect 30');
    strictEqual(result.turtle.y, 10, 'expect 10');
  });

  it("maintains the same angle when moving forward", () => {
    const result = parseStatement("forward 20", {
      ...initialState as LogoState,
      turtle: { x: 10, y: 10, angle: 30 },
    });
    strictEqual(result.turtle.angle, 30);
  });

  it("issues a draw command if the command is a rotation", () => {
    const result = parseStatement("right 90", {
      ...initialState as LogoState,
      turtle: { x: 0, y: 0, angle: 0 },
    });
    strictEqual(result.drawCommands.length, 1);
  });

  it("rotates right", () => {
    const result = parseStatement("right 90", {
      ...initialState as LogoState,
      turtle: { x: 0, y: 0, angle: 0 },
    });
    deepStrictEqual(result.turtle, {
      x: 0,
      y: 0,
      angle: 90,
    });
  });

  it("rotates right by a different amount", () => {
    const result = parseStatement("right 30", {
      ...initialState as LogoState,
      turtle: { x: 0, y: 0, angle: 0 },
    });
    deepStrictEqual(result.turtle, {
      x: 0,
      y: 0,
      angle: 30,
    });
  });

  it("rotates right by adding on to existing rotation", () => {
    const result = parseStatement("right 30", {
      ...initialState as LogoState,
      turtle: { x: 0, y: 0, angle: 90 },
    });
    deepStrictEqual(result.turtle, {
      x: 0,
      y: 0,
      angle: 120,
    });
  });

  it("moves backward", () => {
    const result = parseStatement(
      "backward 10",
      initialState as LogoState
    );
    deepStrictEqual(result.drawCommands, [
      {
        drawCommand: "drawLine",
        id: 0,
        x1: 0,
        y1: 0,
        x2: -10,
        y2: 0,
      },
    ]);
  });

  it("rotates left", () => {
    const result = parseStatement("left 90", {
      ...initialState as LogoState,
      turtle: { x: 0, y: 0, angle: 0 },
    });
    deepStrictEqual(result.turtle, {
      x: 0,
      y: 0,
      angle: -90,
    });
  });

  describe("errors", () => {
    it("includes the last entered line in the command", () => {
      const result = parseStatement(
        "unknown 90",
        initialState as LogoState
      );
      strictEqual(result.error.line, "unknown 90");
    });

    it("returns a basic error for an unknown command", () => {
      const result = parseStatement(
        "unknown 90",
        initialState as LogoState
      );
      strictEqual(result.error.description, "Unknown function: unknown");
      deepStrictEqual(result.error.position, {
        end: 6,
        start: 0,
      });
    });

    it("returns a basic error for a different unknown command", () => {
      const result = parseStatement(
        "still-unknown 90",
        initialState as LogoState
      );
      strictEqual(result.error.description, "Unknown function: still-unknown");
      deepStrictEqual(result.error.position, {
        end: 12,
        start: 0,
      });
    });

    it("records multiple events", () => {
      let state = parseStatement(
        "forward 10",
        initialState as LogoState
      );
      state = parseStatement("forward 10", state);
      strictEqual(state.drawCommands.length, 2);
    });

    it("returns error if value is not an integer", () => {
      const result = parseStatement(
        "forward notnumber",
        initialState as LogoState
      );
      strictEqual(result.error.description, "Argument is not an integer");
    });
  });

  it("appends draw command when rotating", () => {
    let state = parseStatement(
      "forward 10",
      initialState as LogoState
    );
    state = parseStatement("right 10", state);
    strictEqual(state.drawCommands.length, 2);
  });

  it("maintains draw commands on error", () => {
    let state = parseStatement(
      "forward 10",
      initialState as LogoState
    );
    state = parseStatement("unknown-command", state);
    strictEqual(state.drawCommands.length, 1);
  });

  describe("parsing", () => {
    it("accepts commands over multiple lines", () => {
      const state = parseStatement(
        "forward\n10",
        initialState as LogoState
      );
      strictEqual(state.drawCommands.length, 1);
    });

    it("accepts multiple commands on the same line", () => {
      let state = parseStatement(
        "forward 10 backward 10",
        initialState as LogoState
      );
      strictEqual(state.drawCommands.length, 2);
    });

    it("does not perform any commands if the statement was incomplete", () => {
      const state = parseStatement(
        "forward",
        initialState as LogoState
      );
      deepStrictEqual(state.drawCommands, []);
    });

    it("returns the existing state if the statement was incomplete", () => {
      const state = parseStatement(
        "forward 10 backward",
        initialState as LogoState
      );
      deepStrictEqual(state, initialState);
    });
  });

  describe("no-argument functions", () => {
    it("accepts the penup command", () => {
      const state = parseStatement(
        "penup",
        initialState as LogoState
      );
      strictEqual(state.pen.down, false);
    });

    it("accepts the pendown command", () => {
      const state = parseStatement("pendown", {
        ...initialState as LogoState,
        pen: { down: false },
      });
      strictEqual(state.pen.down, true);
    });

    it("accepts the wait command", () => {
      const state = parseStatement(
        "wait 5",
        initialState as LogoState
      );
      deepStrictEqual(state.drawCommands, [
        { drawCommand: "wait" as const, seconds: 5 },
      ]);
    });
  });

  describe("repeat", () => {
    it("repeats an instruction many times", () => {
      let state = parseStatement(
        "repeat 3 [ forward 10 ]",
        initialState as LogoState
      );
      deepStrictEqual(state.drawCommands, [
        {
          drawCommand: "drawLine",
          id: 0,
          x1: 0,
          y1: 0,
          x2: 10,
          y2: 0,
        },
        {
          drawCommand: "drawLine",
          id: 1,
          x1: 10,
          y1: 0,
          x2: 20,
          y2: 0,
        },
        {
          drawCommand: "drawLine",
          id: 2,
          x1: 20,
          y1: 0,
          x2: 30,
          y2: 0,
        },
      ]);
    });

    it("repeats multiple instructions", () => {
      let state = parseStatement(
        "repeat 2 [ forward 10 backward 10 ]",
        initialState as LogoState
      );
      deepStrictEqual(state.drawCommands, [
        {
          drawCommand: "drawLine",
          id: 0,
          x1: 0,
          y1: 0,
          x2: 10,
          y2: 0,
        },
        {
          drawCommand: "drawLine",
          id: 1,
          x1: 10,
          y1: 0,
          x2: 0,
          y2: 0,
        },
        {
          drawCommand: "drawLine",
          id: 2,
          x1: 0,
          y1: 0,
          x2: 10,
          y2: 0,
        },
        {
          drawCommand: "drawLine",
          id: 3,
          x1: 10,
          y1: 0,
          x2: 0,
          y2: 0,
        },
      ]);
    });

    it("returns an error if the first argument is not a number", () => {
      let state = parseStatement(
        "repeat c [ ]",
        initialState as LogoState
      );
      strictEqual(state.error.description, "Argument is not an integer");
    });

    it("returns an error if the last instruction is not complete", () => {
      let state = parseStatement(
        "repeat 2 [ forward ]",
        initialState as LogoState
      );
      strictEqual(state.error.description, "The last command is not complete");
    });
  });

  describe("user-defined functions", () => {
    it("defines a function with no parameters that can be called", () => {
      let state = initialState as LogoState;
      state = parseStatement(
        "to drawsquare forward 10 end",
        state
      );
      state = parseStatement("drawsquare", state);
      deepStrictEqual(state.drawCommands, [
        {
          drawCommand: "drawLine",
          id: 0,
          x1: 0,
          y1: 0,
          x2: 10,
          y2: 0,
        },
      ]);
    });

    it("defines a function with multiple instructions", () => {
      let state = initialState as LogoState;
      state = parseStatement(
        "to drawsquare forward 10 backward 10 end",
        state
      );
      state = parseStatement("drawsquare", state);
      deepStrictEqual(state.drawCommands, [
        {
          drawCommand: "drawLine",
          id: 0,
          x1: 0,
          y1: 0,
          x2: 10,
          y2: 0,
        },
        {
          drawCommand: "drawLine",
          id: 1,
          x1: 10,
          y1: 0,
          x2: 0,
          y2: 0,
        },
      ]);
    });

    it("passes a single parameter to a function", () => {
      let state = initialState as LogoState;
      state = parseStatement(
        "to drawsquare :x forward :x end",
        state
      );
      state = parseStatement("drawsquare 10", state);
      deepStrictEqual(state.drawCommands, [
        {
          drawCommand: "drawLine",
          id: 0,
          x1: 0,
          y1: 0,
          x2: 10,
          y2: 0,
        },
      ]);
    });

    it("cannot override built-in functions", () => {
      const state = parseStatement(
        "to to end",
        initialState as LogoState
      );
      strictEqual(state.error.description, "Cannot override the built-in function 'to'");
    });

    it("can override user-defined functions", () => {
      let state = parseStatement(
        "to abc end",
        initialState as LogoState
      );
      state = parseStatement("to abc end", state);
      strictEqual(state.error, undefined);
    });

    it("handles repeats inside of functions", () => {
      let state = parseStatement(
        "to abc repeat 2 [ forward 100 ] end",
        initialState as LogoState
      );
      state = parseStatement("abc", state);
      strictEqual(state.error, undefined);
    });

    it("allows multi-line function definitions", () => {
      let state = parseStatement(
        "to abc\n",
        initialState as LogoState
      );
      //state = parseStatement('abc', state);
      strictEqual(state.error, undefined);
    });
  });

  describe("case-insensitivity", () => {
    it("matches uppercase forward command", () => {
      let result = parseStatement(
        "FORWARD 10",
        initialState as LogoState
      );
      strictEqual(result.drawCommands.length, 1);
    });

    it("matches uppercase function name", () => {
      let state = initialState as LogoState;
      state = parseStatement(
        "to drawsquare forward 10 end",
        state
      );
      state = parseStatement("DRAWSQUARE", state);
      strictEqual(state.drawCommands.length, 1);
    });

    it("matches uppercase parameter name", () => {
      let state = initialState as LogoState;
      state = parseStatement(
        "to drawsquare :X forward :x end",
        state
      );
      state = parseStatement("drawsquare 10", state);
      strictEqual(state.drawCommands.length, 1);
    });
  });

  describe("aliases", () => {
    it("matches fd alias", () => {
      let result = parseStatement(
        "fd 10",
        initialState as LogoState
      );
      strictEqual(result.drawCommands.length, 1);
    });
  });

  describe("tokenizing", () => {
    let tokenSpy = mock.fn((...args: any[])=>{void(args); return {}});

    beforeEach(() => {
      tokenSpy = mock.fn(()=>({}));
    });

    it("passes whitespace through to current instruction if there is one", () => {
      parseStatement("; ", {
        allFunctions: [
          {
            names: [";"],
            parseToken: tokenSpy,
            perform: (): Partial<LogoState> => ({}) ,
          } as unknown as Command,
        ],
        parsedTokens: [],
      } as unknown as LogoState);

      strictEqual(tokenSpy.mock.calls.length, 1);
      deepStrictEqual(tokenSpy.mock.calls[0].arguments[1], {
        type: "whitespace",
        text: " ",
        lineNumber: 1,
      });
    });

    it("includes line numbers when parsing multiple lines", () => {
      parseStatement("; \n ", {
        allFunctions: [
          {
            names: [";"],
            parseToken: tokenSpy,
            perform: () => {},
          },
        ],
        parsedTokens: [],
      } as unknown as LogoState);

      strictEqual(tokenSpy.mock.calls.length, 3);
      deepStrictEqual(tokenSpy.mock.calls[0].arguments[1], {
        type: "whitespace",
        text: " ",
        lineNumber: 1,
      });
      deepStrictEqual(tokenSpy.mock.calls[1].arguments[1], {
        type: "whitespace",
        text: "\n",
        lineNumber: 1,
      });
      deepStrictEqual(tokenSpy.mock.calls[2].arguments[1], {
        type: "whitespace",
        text: " ",
        lineNumber: 2,
      });
    });

    it("batches up non-newline whitespace", () => {
      parseStatement("; \t", {
        allFunctions: [
          {
            names: [";"],
            parseToken: tokenSpy,
            perform: () => {},
          },
        ],
        parsedTokens: [],
      } as unknown as LogoState);

      strictEqual(tokenSpy.mock.calls.length, 1);
      deepStrictEqual(tokenSpy.mock.calls[0].arguments[1], {
        type: "whitespace",
        text: " \t",
        lineNumber: 1,
      });
    });

    it("starts line numbers at existing script line number", () => {
      tokenSpy.mock.mockImplementation(()=>({ isComplete: true }))     ;
      const result = parseStatement("; ", {
        allFunctions: [
          {
            names: [";"],
            parseToken: tokenSpy,
            perform: () => {},
          },
        ],
        parsedStatements: [],
        parsedTokens: [{ lineNumber: 123 }],
      } as unknown as LogoState);

      ok(result.parsedTokens.some((parsedToken: any) =>
        parsedToken.type === "token" &&
        parsedToken.text === ";" &&
        parsedToken.lineNumber === 124
      ));
    });
  });
});

describe("parseTokens", () => {
  it("parses all tokens", () => {
    const result = parseTokens(
      [
        {
          type: "token",
          text: "forward",
          lineNumber: 1,
          instructionId: 0,
        },
        {
          type: "whitespace",
          text: " ",
          lineNumber: 1,
          instructionId: 0,
        },
        {
          type: "token",
          text: "100",
          lineNumber: 1,
          instructionId: 0,
        },
        {
          type: "whitespace",
          text: "↵",
          lineNumber: 1,
        },
        {
          type: "token",
          text: "right",
          lineNumber: 2,
          instructionId: 1,
        },
        {
          type: "whitespace",
          text: " ",
          lineNumber: 2,
          instructionId: 1,
        },
        {
          type: "token",
          text: "90",
          lineNumber: 2,
          instructionId: 1,
        },
        {
          type: "whitespace",
          text: "↵",
          lineNumber: 2,
        },
      ],
      initialState as LogoState
    );
    deepStrictEqual(result.drawCommands, [
      {
        drawCommand: "drawLine",
        id: 0,
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 0,
      },
      {
        drawCommand: "rotate",
        id: 1,
        previousAngle: 0,
        newAngle: 90,
      },
    ]);
  });
});
