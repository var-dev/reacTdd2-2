export const perform = (state:LogoState, instruction:Instruction) => {
  const { collectedParameters } = state;
  const stateWithParams = {
    ...state,
    collectedParameters: {
      ...collectedParameters,
      ...instruction.collectedParameters,
    },
  };
  return {
    ...state,
    ...instruction.functionDefinition.perform(
      stateWithParams,
      instruction
    ),
  };
};

export const performAll = (state: LogoState, instructions: Instruction[]) =>
  instructions.reduce(perform, state);
