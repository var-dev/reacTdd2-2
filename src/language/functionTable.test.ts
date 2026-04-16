import { describe, it } from "node:test";
import {
  builtInFunctions,
  functionWithName,
} from "./functionTable.js";
import { clearScreen } from "./clearScreen.js";
import { deepStrictEqual, strictEqual } from "assert";

describe("built-in functions", () => {
  it("contains clearScreen", () => {
    strictEqual( builtInFunctions.includes(clearScreen), true, `expect ${builtInFunctions}`);
  });
});

describe("functionWithName", () => {
  it("matches function with a non-lowercase name", () => {
    const expectedFunction = { names: ["aBC"] };
    const functions = [expectedFunction] as Command[];
    deepStrictEqual(functionWithName("ABC", functions), expectedFunction);
  });
});
