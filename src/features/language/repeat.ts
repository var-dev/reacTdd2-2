import { parseCall } from "./parseCall.js";
import {
  parameterValue,
  integerParameterValue,
} from "./values.js";
import { performAll } from "./perform";

const flatten = (array: Instruction[][]) =>
  array.reduce((flattened, latest) => [
    ...flattened,
    ...latest,
  ]);
const duplicateArrayItems = (array: unknown, times: number) =>
  flatten(Array(times).fill(array));

export const repeat: Command = {
  names: ["repeat", "rp"],
  isWriteProtected: true,
  parameters: ["times", "statements"],
  parseToken: parseCall,
  perform: (state: LogoState) =>
    performAll(
      state,
      duplicateArrayItems(
        parameterValue("statements").get(state),
        integerParameterValue("times").get(state)
      )
    ),
} as unknown as Command;
