export function toInstructions({
  parsedTokens,
}: {
  parsedTokens: ParsedToken[];
}) {
  const byInstructions = parsedTokens.reduce(
    (instructions, token: ParsedToken) => {
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
    {} as Record<number,ParsedToken[]>,
  );

  return Object.keys(byInstructions).map((instruction) => {
    return byInstructions[Number(instruction)]
      .map((token: ParsedToken) => token.text)
      .join("");
  });
}
