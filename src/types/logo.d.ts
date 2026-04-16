interface TurtleState {
  x: number;
  y: number;
  angle: number;
}

interface LogoState {
  drawCommands: DrawCommand[];
  nextDrawCommandId: number;
  turtle: TurtleState;
  isComplete?: boolean;
  pen?: { down: boolean };
  [key: string]: unknown;
}

type DrawCommand = {
  drawCommand: string ;
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
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

type ParsedToken = { instructionId: number; text: string };
type Instruction = { name: string; perform: (state: LogoState) => LogoState };
type DistanceValue = { get: (state: LogoState) => number }