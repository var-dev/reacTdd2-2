import { integerParameterValue } from "./values.js";
import { parseCall } from "./parseCall.js";

const waitCommand = (state: LogoState, seconds: Value) => ({
  drawCommand: "wait" as const,
  seconds: seconds.get(state),
});

export const wait = {
  names: ["wait", "wt"],
  isWriteProtected: true,
  initial: {},
  parseToken: parseCall,
  parameters: ["seconds"],
  perform: (state: LogoState) => ({
    drawCommands: [
      ...state.drawCommands,
      waitCommand(
        state,
        integerParameterValue("seconds")
      ),
    ],
  }),
};
