interface TurtleState {
  x: number;
  y: number;
  angle: number;
}

interface LogoState {
  drawCommands?: unknown[];
  turtle?: TurtleState;
  isComplete?: boolean;
  [key: string]: unknown;
}

interface CommentParameters {
  // empty for comments
}

interface CommentToken {
  type?: string;
  token?: string;
  lineNumber?: number;
  text?: string;
}

interface ParseResult {
  isComplete: boolean;
}

interface CommentCommand {
  names: string[];
  initial: Record<string, never>;
  isWriteProtected: boolean;
  parameters: CommentParameters[];
  parseToken: (state: LogoState, token: CommentToken) => ParseResult;
  perform: (state: LogoState) => LogoState;
}
