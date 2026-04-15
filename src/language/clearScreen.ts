
interface ClearScreenCommand {
  names: string[];
  isWriteProtected: boolean;
  initial: { isComplete: boolean };
  perform: (state: LogoState) => LogoState;
}

export const clearScreen: ClearScreenCommand = {
  names: ["clearscreen", "cs"],
  isWriteProtected: true,
  initial: { isComplete: true },
  perform: (state: LogoState): LogoState => ({
    ...state,
    drawCommands: [],
    turtle: { x: 0, y: 0, angle: 0 },
  }),
};
