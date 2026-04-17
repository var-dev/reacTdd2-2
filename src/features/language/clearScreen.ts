export const clearScreen: Partial<Command> = {
  names: ["clearscreen", "cs"],
  isWriteProtected: true,
  initial: { isComplete: true },
  perform: (state: LogoState): LogoState => ({
    ...state,
    drawCommands: [],
    turtle: { x: 0, y: 0, angle: 0 },
  }),
};
