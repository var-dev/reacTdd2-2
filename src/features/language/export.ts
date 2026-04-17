

export function toInstructions({ parsedTokens }: { parsedTokens: ParsedToken[] }) {
  const byInstructions: Record<string | number, ParsedToken[]> = parsedTokens.reduce(
    (instructions: Record<string | number, ParsedToken[]>, token: ParsedToken) => {
      if (instructions[token.instructionId]) {
        return {
          ...instructions,
          [token.instructionId]: [
            ...instructions[token.instructionId],
            token,
          ],
        };
      } else {
        return {
          ...instructions,
          [token.instructionId]: [token],
        };
      }
    },
    {}
  );

  return Object.keys(byInstructions).map(
    (instruction ) => {
      return byInstructions[instruction]
        .map((token: ParsedToken) => token.text)
        .join("");
    }
  );
}
