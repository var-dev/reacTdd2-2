import { functionWithName } from "./functionWithName.js";
import { perform } from "./perform.js";

const areAllParametersFilled = (
  parameters: CollectedParameters,
  functionDefinition: Command,
) => Object.keys(parameters).length === functionDefinition.parameters.length;

const addNextParameter = (
  existingParameters: CollectedParameters,
  functionDefinition: Command,
  value: ParameterValue,
) => {
  const nextArgName =
    functionDefinition.parameters[Object.keys(existingParameters).length];
  const newParameters = {
    ...existingParameters,
    [nextArgName]: value,
  };
  return {
    collectedParameters: newParameters,
    isComplete: areAllParametersFilled(newParameters, functionDefinition),
  };
};

const findFunction = (
  { allFunctions, nextInstructionId, parsedTokens }: LogoState,
  token: Token,
) => {
  const { type, text } = token;
  if (type === "whitespace") {
    return {};
  }
  const functionName = text;
  const foundFunction = functionWithName(functionName, allFunctions);
  if (foundFunction) {
    return {
      currentInstruction: {
        id: nextInstructionId,
        name: functionName,
        ...foundFunction.initial,
        functionDefinition: foundFunction,
        collectedParameters: {},
      },
      nextInstructionId: nextInstructionId + 1,
      parsedTokens: [
        ...parsedTokens,
        {
          ...token,
          instructionId: nextInstructionId,
        },
      ],
    };
  }
  throw {
    description: `Unknown function: ${functionName.toLowerCase()}`,
    position: {
      start: 0,
      end: functionName.length - 1,
    },
  };
};

export const parseNextToken = (state: LogoState, nextToken: Token): LogoState => {
  const { currentInstruction } = state;
  if (currentInstruction) {
    const updatedInstruction = {
      ...currentInstruction,
      ...currentInstruction.functionDefinition.parseToken(state, nextToken),
    };
    return {
      ...state,
      currentInstruction: updatedInstruction,
      parsedTokens: [
        ...state.parsedTokens,
        {
          ...nextToken,
          instructionId: updatedInstruction.id,
        },
      ],
    };
  }
  if (nextToken.type === "whitespace") {
    return {
      ...state,
      parsedTokens: [...state.parsedTokens, nextToken],
    };
  }
  return {
    ...state,
    ...findFunction(state, nextToken),
  };
};

export const parseAndSaveStatement = (state: LogoState, token: Token) => {
  const updatedState = parseNextToken(state, token);
  if (
    updatedState.currentInstruction &&
    updatedState.currentInstruction.isComplete
  ) {
    return {
      ...perform(updatedState, updatedState.currentInstruction),
      parsedStatements: [
        ...updatedState.parsedStatements,
        updatedState.currentInstruction,
      ],
      currentInstruction: undefined,
    };
  }
  return updatedState;
};

export const parseNextListValue = (state: LogoState, token: Token) => {
  const currentListValue =
    state.currentInstruction?.currentListValue ?? [];
  const latestInstruction = currentListValue[0];
  if (latestInstruction && latestInstruction.isComplete) {
    const innerState = {
      ...state,
      currentInstruction: undefined,
    } as LogoState;
    return {
      currentListValue: [
        parseNextToken(innerState, token).currentInstruction,
        ...currentListValue,
      ],
    };
  } else {
    const [currentInstruction, ...rest] = currentListValue;
    const innerState = {
      ...state,
      currentInstruction: currentInstruction,
    };
    return {
      currentListValue: [
        parseNextToken(innerState, token).currentInstruction,
        ...rest,
      ],
    };
  }
};

export const finishParsingList = ({
  collectedParameters,
  functionDefinition,
  currentListValue,
}: {
  collectedParameters?: CollectedParameters;
  functionDefinition: Command;
  currentListValue?: InstructionListValue;
}) => {
  const listValue = currentListValue ?? [];
  const latestInstruction = listValue[0];
  if (latestInstruction && !latestInstruction.isComplete) {
    throw {
      description: "The last command is not complete",
    };
  }
  return {
    ...addNextParameter(
      collectedParameters ?? {},
      functionDefinition,
      listValue.filter(
        (instruction): instruction is Instruction =>
          instruction !== undefined,
      ),
    ),
    parsingListValue: false,
    currentListValue: undefined,
  };
};

export const parseCall = (state: LogoState, token: Token) => {
  const { currentInstruction } = state;
  if (!currentInstruction) {
    return {};
  }
  const {
    collectedParameters = {},
    functionDefinition,
    parsingListValue,
  } = currentInstruction;
  if (token.type === "whitespace") return state.currentInstruction;
  if (token.text === "[") {
    return {
      parsingListValue: true,
      currentListValue: [],
    };
  }
  if (token.text === "]") {
    return finishParsingList(currentInstruction);
  }
  if (parsingListValue) {
    return parseNextListValue(state, token);
  } else {
    return addNextParameter(
      collectedParameters,
      functionDefinition,
      token.text,
    );
  }
};
