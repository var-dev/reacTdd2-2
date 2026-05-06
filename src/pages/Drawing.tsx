import { useState, useEffect } from "react";
import { useAppSelector } from "../features/redux/hooks.js";
import { Turtle } from "./Turtle.js";
import { StaticLines } from "./StaticLines.js";
import { AnimatedLine } from "./AnimatedLine.js";

const isDrawLineCommand = (command: DrawCommand) => command.drawCommand === "drawLine";
const distance = (command: DrawCommandLinear) => {
  const { x1, y1, x2, y2 } = command || {x1: 0, x2: 0, y1: 0, y2: 0};
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
}
const movementSpeed = 5;

export const Drawing = () => {
  const { drawCommands } = useAppSelector(({ script }) => script);
  const [turtle, setTurtle] = useState({x: 0, y: 0, angle: 0});
  const [animatingCommandIndex, setAnimatingCommandIndex] = useState(0);
  const lineCommands = drawCommands
    .slice(0, animatingCommandIndex)
    .filter(isDrawLineCommand) as DrawCommandLinear[];
  const commandToAnimate = drawCommands[animatingCommandIndex] as DrawCommandLinear;
  const isDrawingLine = commandToAnimate && isDrawLineCommand(commandToAnimate);
  useEffect(() => {
    let duration: number;
    let start: number | undefined;
    const handleDrawLineFrame = (time: number) => {
      if (start === undefined) start = time;
      if (time < start + duration) {
        const elapsed = time - start;
        const { x1, x2, y1, y2 } = commandToAnimate;
        setTurtle(turtle => ({
          ...turtle,
          x: x1 + ((x2 - x1) * (elapsed / duration)),
          y: y1 + ((y2 - y1) * (elapsed / duration)),
      }))} else {
        setAnimatingCommandIndex(i => i + 1)
      }
    };
    duration = movementSpeed * distance(commandToAnimate);
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
        {isDrawingLine 
          ? <AnimatedLine commandToAnimate={commandToAnimate} turtle={turtle}/>
          : null} 
      </svg>
    </div>
  );
};
