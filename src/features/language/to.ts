import {
  parseCall,
  parseNextListValue,
  finishParsingList,
} from "./parseCall.js";
import { parameterValue, isParameterReference } from "./values.js";
import { functionWithName } from "./functionWithName.js";
import { performAll } from "./perform.js";

const parseTo = (state: LogoState, token: Token) => {
  if (token.type === "whitespace") return {};
  const { currentInstruction } = state;
  if (!currentInstruction?.collectingParameters && !currentInstruction?.parsingListValue) {
    return {
      name: token.text,
      collectingParameters: true,
    };
  }
  if (currentInstruction.collectingParameters && token.text.startsWith(":")) {
    return {
      parameters: [
        ...(currentInstruction.parameters as string[]),
        token.text.substring(1).toLowerCase(),
      ],
    };
  }
  if (token.text === "end") {
    return finishParsingList(currentInstruction);
  }
  return {
    ...parseNextListValue(state, token),
    collectingParameters: false,
    parsingListValue: true,
  };
};

const mapObjectValues = (object: Record<string, unknown>, f: (value: string) => ParameterValue): CollectedParameters =>
  Object.keys(object).reduce(
    (mapped, key) => ({
      ...mapped,
      [key]: f(object[key] as string),
    }),
    {} as CollectedParameters,
  );

const insertParameterValues = (
  parameters: CollectedParameters | undefined,
  state: LogoState,
) =>
  mapObjectValues(parameters ?? {}, (value: string) => {
    if (isParameterReference(value))
      return parameterValue(value.substring(1)).get(state);
    return value;
  });

const performCall = (state: LogoState, { innerInstructions }: { innerInstructions: Instruction[] }) => {
  const instructionsWithParameterValues:Instruction[] = innerInstructions.map(
    (instruction: Instruction) => ({
      ...instruction,
      collectedParameters: insertParameterValues(
        instruction.collectedParameters ,
        state,
      ),
    }),
  );
  return performAll(state, instructionsWithParameterValues);
};

const performTo = (state: LogoState, instruction: Instruction) => {
  const existingFunction = functionWithName(
    instruction.name,
    state.allFunctions,
  );
  if (existingFunction && existingFunction.isWriteProtected) {
    throw {
      description: `Cannot override the built-in function '${instruction.name.toLowerCase()}'`,
    };
  }
  const functionDefinition = {
    names: [instruction.name],
    isWriteProtected: false,
    initial: {
      collectedParameters: {},
      isComplete: instruction?.parameters?.length === 0,
      innerInstructions: parameterValue("statements").get(state),
    },
    parameters: instruction.parameters,
    parseToken: parseCall,
    perform: performCall,
  };
  return {
    allFunctions: [...state.allFunctions, functionDefinition],
  };
};

export const to = {
  names: ["to"],
  isWriteProtected: true,
  initial: { parameters: [], currentListValue: [] },
  parameters: ["statements"],
  parseToken: parseTo,
  perform: performTo,
};
