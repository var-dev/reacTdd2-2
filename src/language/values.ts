export const parameterValue = (parameter: string) => ({
  get: (state: LogoState) => {
    return state.collectedParameters[parameter.toLowerCase()];
  },
});

export const integerParameterValue = (parameter: string) => ({
  get: (state: LogoState) => {
    const argumentValue = parameterValue(parameter).get(state);
    const integerArgument = parseInt(String(argumentValue));
    if (Number.isNaN(integerArgument)) {
      throw {
        description: "Argument is not an integer",
      };
    }
    return integerArgument;
  },
});

export const negate = (value: Value) => ({
  get: (state: LogoState) => -value.get(state),
});

export const isParameterReference = (v: any) =>
  typeof v === "string" && v.startsWith(":");
