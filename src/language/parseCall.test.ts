import { describe, it, mock, beforeEach } from "node:test";
import { parseAndSaveStatement, parseCall } from "./parseCall";
import { deepStrictEqual, strictEqual } from "assert";
import { ok } from "assert/strict";

describe("parseAndSaveStatement", () => {
  let state:LogoState;

  describe("completing an instruction", () => {
    let parseTokenSpy: it.Mock<(...args:any[])=>{}>;
    let performSpy: it.Mock<(...args:any[])=>{}>;

    beforeEach(() => {
      parseTokenSpy = mock.fn();
      performSpy = mock.fn();

      parseTokenSpy = mock.fn(() => ({ a: 123 }));
      performSpy = mock.fn(() => ({ b: 234 }));
      state = parseAndSaveStatement(
        {
          parsedStatements: [],
          parsedTokens: [],
          currentInstruction: {
            id: 123,
            isComplete: true,
            functionDefinition: {
              parseToken: parseTokenSpy as unknown as (state: LogoState, token: Token) => ParsedResult,
              perform: performSpy,
            } as unknown as Command,
          } as unknown as Instruction,
        } as unknown as LogoState,
        { type: "token", text: "token" },
      );
    });

    it("appends currentInstruction to parsedStatements when it is complete", () => {
      strictEqual(state.parsedStatements.length, 1, 'expected length 1');
      strictEqual((state.parsedStatements[0] as any).a, 123, 'expected 123');
    });

    it("removes currentInstruction if it has been completed", () => {
      strictEqual(state.currentInstruction, undefined);
    });

    it("adds this token into the parsedTokens after parsing", () => {
      strictEqual(state.parsedTokens.length, 1, 'expected length 1');
      deepStrictEqual(state.parsedTokens[0], {
        type: "token",
        text: "token",
        instructionId: 123,
      }, 'expected token');
    });

    it("performs the statement", () => {
      ok(performSpy.mock.callCount()>=1);
    });

    it("appends the result from perform", () => {
      strictEqual(state.b, 234);
    });
  });

  describe("beginning a new instruction", () => {
    beforeEach(() => {
      state = parseAndSaveStatement(
        {
          nextInstructionId: 123,
          parsedStatements: [],
          currentInstruction: undefined,
          parsedTokens: [],
          allFunctions:  [{ names: ["forward"] }] as Command[],
        } as unknown as LogoState,
        { type: "token", text: "forward" },
      );
    });

    it("assigns an id to the new instruction", () => {
      strictEqual(state.currentInstruction?.id, 123);
    });

    it("increments nextInstructionId", () => {
      strictEqual(state.nextInstructionId, 124);
    });

    it("adds this token into the currentInstruction parseTokens", () => {
      strictEqual(state.parsedTokens.length, 1, 'expected length 1');
      deepStrictEqual(state.parsedTokens[0], {
        type: "token",
        text: "forward",
        instructionId: 123,
      });
    });
  });

  describe("whitespace", () => {
    it("adds whitespace as tokens without an instruction if currently outside an instruction", () => {
      state = parseAndSaveStatement(
        {
          parsedStatements: [],
          currentInstruction: undefined,
          parsedTokens: [],
          allFunctions: [{ names: ["forward"] } as Command],
        } as unknown as LogoState,
        { type: "whitespace", text: "   " },
      );
      strictEqual(state.parsedTokens.length, 1, 'expected length 1');
      deepStrictEqual(state.parsedTokens[0], {
        type: "whitespace",
        text: "   ",
      });
    });
  });
});

describe("parseCall", () => {
  it("ignores whitespace", () => {
    const currentInstruction = {
      collectedParameters: {},
      functionDefinition: {
        parameters: ["x"],
      },
    } as unknown as Instruction;
    const result = parseCall({ currentInstruction } as unknown as LogoState, { type: "whitespace" } as Token);

    deepStrictEqual(result, currentInstruction);
  });
});
