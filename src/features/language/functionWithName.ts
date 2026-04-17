
export const functionWithName = (name: string, functions: Command[]) => {
  const lowerCaseName = name.toLowerCase();
  return functions.find((f) => f.names
    .map((name: string) => name.toLowerCase())
    .includes(lowerCaseName)
  );
};
