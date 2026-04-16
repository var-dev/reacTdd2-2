import { parseCall } from "./parseCall.js";
import {
  parameterValue,
  integerParameterValue,
} from "./values.js";
import { performAll } from "./perform";

const flatten = (array: any[]) =>
  array.reduce((flattened, latest) => [
    ...flattened,
    ...latest,
  ]);
const duplicateArrayItems = (array, times) =>
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
};
