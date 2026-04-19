interface LineCommand {
  id: string | number;
  x1: number | string;
  y1: number | string;
  x2: number | string;
  y2: number | string;
}

export const StaticLines = ({ lineCommands }: { lineCommands: LineCommand[] }) =>
  lineCommands.map(({ id, x1, y1, x2, y2 }) => (
    <line
      key={id}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      strokeWidth="2"
      stroke="black"
    />
  ));
