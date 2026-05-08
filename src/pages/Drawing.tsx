import { useState, useEffect, useRef } from "react";
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
  const cancelToken = useRef<number|null>(null)
  const { drawCommands } = useAppSelector(({ script }) => script);
  const [turtle, setTurtle] = useState({x: 0, y: 0, angle: 0});
  const [animatingCommandIndex, setAnimatingCommandIndex] = useState(0);
  const lineCommands = drawCommands
    .slice(0, animatingCommandIndex)
    .filter(isDrawLineCommand) as DrawCommandLinear[];
  const commandToAnimate = drawCommands[animatingCommandIndex] as DrawCommandLinear;
  const isDrawingLine = commandToAnimate && isDrawLineCommand(commandToAnimate);
  useEffect(() => {
    if (!isDrawingLine || !commandToAnimate) return
    let duration = movementSpeed * distance(commandToAnimate);
    let start: number | null = null;
    const { x1, x2, y1, y2 } = commandToAnimate;
    const handleDrawLineFrame = (time: number) => {
      if (start === null) start = time;
      const elapsed = time - start;
      if (elapsed < duration) {
        setTurtle(turtle => ({
          ...turtle,
          x: x1 + ((x2 - x1) * (elapsed / duration)),
          y: y1 + ((y2 - y1) * (elapsed / duration)),
        }))
        cancelToken.current = window.requestAnimationFrame(handleDrawLineFrame)
      } else {
        // setTurtle((turtle) => ({ ...turtle, x: x2, y: y2 }));
        setAnimatingCommandIndex(i => i + 1)
      }
    };
    cancelToken.current = window.requestAnimationFrame(handleDrawLineFrame)
    return () => {
      if (cancelToken.current !== null) window.cancelAnimationFrame(cancelToken.current!)
    }
  }, [commandToAnimate, isDrawingLine])
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
