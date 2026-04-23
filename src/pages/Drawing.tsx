import { useAppSelector } from "../features/redux/hooks.js";
import { Turtle } from "./Turtle.js";
import { StaticLines } from "./StaticLines.js";

const isDrawLineCommand = (command: DrawCommand) =>
  command.drawCommand === "drawLine";

export const Drawing = () => {
  const { drawCommands, turtle } = useAppSelector(({ script }) => script);
  const lineCommands = drawCommands.filter(isDrawLineCommand);

  return (
    <div id="viewport">
      <svg
        viewBox="-300 -300 600 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <StaticLines lineCommands={lineCommands} />
        <Turtle {...turtle} />
      </svg>
    </div>
  );
};
