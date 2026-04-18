export function toInstructions({
  parsedTokens,
}: {
  parsedTokens: Token[];
}) {
  const byInstructions = parsedTokens.reduce(
    (instructions, token: Token) => {
      if (instructions[token.instructionId as number]) {
        return {
          ...instructions,
          [token.instructionId as number]: [
            ...instructions[token.instructionId as number],
            token,
          ],
        };
      } else {
        return {
          ...instructions,
          [token.instructionId as number]: [token],
        };
      }
    },
    {} as Record<number,Token[]>,
  );

  return Object.keys(byInstructions).map((instruction) => {
    return byInstructions[Number(instruction)]
      .map((token: Token) => token.text)
      .join("");
  });
}
