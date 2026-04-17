import {
  negate,
  integerParameterValue,
} from "./values";
import { parseCall } from "./parseCall.js";
import { moveDistance } from "./moveDistance.js";
import { rotate } from "./rotate.js";

export const forward = {
  names: ["forward", "fd"],
  isWriteProtected: true,
  initial: {},
  parseToken: parseCall,
  parameters: ["distance"],
  perform: (state: LogoState) =>
    moveDistance(
      state,
      integerParameterValue("distance")
    ),
};

export const backward = {
  names: ["backward", "bd"],
  isWriteProtected: true,
  initial: {},
  parseToken: parseCall,
  parameters: ["distance"],
  perform: (state: LogoState) =>
    moveDistance(
      state,
      negate(integerParameterValue("distance"))
    ),
};

export const left = {
  names: ["left", "lt"],
  isWriteProtected: true,
  initial: {},
  parseToken: parseCall,
  parameters: ["angle"],
  perform: (state: LogoState) =>
    rotate(
      state,
      negate(integerParameterValue("angle"))
    ),
};

export const right = {
  names: ["right", "rt"],
  isWriteProtected: true,
  initial: {},
  parseToken: parseCall,
  parameters: ["angle"],
  perform: (state: LogoState) =>
    rotate(state, integerParameterValue("angle")),
};
