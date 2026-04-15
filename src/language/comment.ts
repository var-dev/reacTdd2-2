
export const comment: CommentCommand = {
  names: [";"],
  initial: {},
  isWriteProtected: true,
  parameters: [],
  parseToken: (state: LogoState, token: CommentToken): ParseResult => {
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
