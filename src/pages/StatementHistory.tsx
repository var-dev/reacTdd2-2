// import { useSelector } from "react-redux";
import { useAppSelector } from "../features/redux/hooks";

const groupByLineNumber = (tokens: Token[]) => {
  return tokens.reduce((lines: Record<number,Token[]>, token: Token) => {
    if(token.lineNumber === undefined) return {...lines}
    if (lines[token.lineNumber]) {
      return {
        ...lines,
        [token.lineNumber]: [...lines[token.lineNumber], token,],
      };
    } else {
      return {
        ...lines,
        [token.lineNumber]: [token],
      };
    }
  }, {});
};

export const LineWithNumber = ({
  number,
  tokens,
}: {number: number; tokens: Token[];}) => {
  const fullTextLine = tokens
    .map((instruction) => instruction.text)
    .join("");
  return (
    <tr key={number.toString()}>
      <td className="lineNumber">{number}</td>
      <td className="text">{fullTextLine}</td>
    </tr>
  );
};

export const StatementHistory = () => {
  const parsedTokens = useAppSelector(({ script: { parsedTokens } }) => parsedTokens);
  const lines = groupByLineNumber(parsedTokens);

  return (
    <tbody key="acceptedStatements">
      {Object.keys(lines).map((lineNumber) => (
        <LineWithNumber
          key={lineNumber}
          number={Number(lineNumber)}
          tokens={lines[Number(lineNumber)]}
        />
      ))}
    </tbody>
  );
};
