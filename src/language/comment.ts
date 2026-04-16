
export const comment: Command = {
  names: [";"],
  initial: {},
  isWriteProtected: true,
  parameters: [],
  parseToken: (state: LogoState, token: Token): ParsedResult => {
    void state;
    if (
      token.type === "whitespace" &&
      token.text === "\n"
    ) {
      return { isComplete: true };
    } else {
      return { isComplete: false };
    }
  },
  perform: (state: LogoState): LogoState => state,
};
