import { useState, useEffect } from "react";
import { useAppSelector } from "../features/redux/hooks.js";
import { Turtle } from "./Turtle.js";
import { StaticLines } from "./StaticLines.js";
import { AnimatedLine } from "./AnimatedLine.js";

const isDrawLineCommand = (command: DrawCommand) =>
  command.drawCommand === "drawLine";

export const Drawing = () => {
  const { drawCommands } = useAppSelector(({ script }) => script);
  const lineCommands = drawCommands.filter(isDrawLineCommand) as DrawCommandLinear[];
  const [turtle, setTurtle] = useState({x: 0, y: 0, angle: 0});
  const commandToAnimate = drawCommands[0] as DrawCommandLinear;
  const isDrawingLine = commandToAnimate && isDrawLineCommand(commandToAnimate);
  useEffect(() => {
    const handleDrawLineFrame = (time: number) => {
      setTurtle(turtle => ({
        ...turtle,
        x: commandToAnimate.x1,
        y: commandToAnimate.y1,
      }));
    };
    if (isDrawingLine) window.requestAnimationFrame(handleDrawLineFrame)
  },[commandToAnimate, isDrawingLine])
  return (
    <div id="viewport">
      <svg
        viewBox="-300 -300 600 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <StaticLines lineCommands={lineCommands} />
        <Turtle {...turtle} />
        <AnimatedLine commandToAnimate={commandToAnimate} turtle={turtle}/>
      </svg>
    </div>
  );
};
