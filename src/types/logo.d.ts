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
  pen: { down: boolean };
  collectedParameters: CollectedParameters;
  currentInstruction?: Instruction;
  parsedTokens: Token[];
  parsedStatements: Instruction[];
  allFunctions: Command[];
  nextInstructionId: number;
  name: string;
  [key: string]: unknown;
}
type DrawCommand = DrawCommandLinear | DrawCommandRotate | DrawCommandWait
type DrawCommandLinear = {
  drawCommand: "drawLine";
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
type DrawCommandRotate = {
  drawCommand: "rotate";
  id: number;
  previousAngle: number;
  newAngle: number;
};
type DrawCommandWait = {
  drawCommand: "wait";
  id?: number;
  seconds: number;
};
type InstructionListValue = Array<Instruction | undefined>;
type ParameterValue = string | number | Instruction[];
type CollectedParameters = Record<string, ParameterValue>;
type CommandParameters = string

interface Token {
  type: "whitespace" | "token";
  token?: string;
  lineNumber?: number;
  text: string;
  instructionId?: number
}

interface ParsedResult {
  isComplete?: boolean | undefined;
}

interface Command {
  names: string[];
  initial: Partial<LogoState>;
  isWriteProtected: boolean;
  parameters: CommandParameters[];
  parseToken: (state: LogoState, token: Token) => Partial<LogoState> | undefined;
  perform: (state: LogoState, instruction?:Instruction) => Partial<LogoState>;
}

type Instruction = {
  name: string;
  id: number;
  functionDefinition: Command
  collectedParameters?: CollectedParameters;
  currentListValue?: InstructionListValue;
  parsingListValue?: boolean;
  collectingParameters?: boolean;
  parameters?: string[];
  innerInstructions?: Instruction[];
  isComplete?: boolean;
};
type Value = { get: (state: LogoState) => number }
