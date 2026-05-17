import { useState, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../features/redux/hooks.js";
import { Turtle } from "./Turtle.js";
import { StaticLines } from "./StaticLines.js";
import { AnimatedLine } from "./AnimatedLine.js";
import { enableAnimation } from "../features/redux/scriptSlice.js";

const isDrawLineCommand = (command: DrawCommand) => command.drawCommand === "drawLine";
const isRotateCommand = (command: DrawCommand) => command.drawCommand === "rotate";
const distance = (command: DrawCommandLinear) => {
  const { x1, y1, x2, y2 } = command || {x1: 0, x2: 0, y1: 0, y2: 0};
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
}
const movementSpeed = 5;
const rotateSpeed = 1000 / 180;
const initialTurtle = {x: 0, y: 0, angle: 0};

export const Drawing = () => {
  const animationFrameId = useRef<number|null>(null)
  const drawCommandsCountPrev = useRef(0)
  const dispatch = useAppDispatch();
  const { drawCommands, turtle: turtleState = initialTurtle, animationEnabled = true } = useAppSelector(({ script }) => script);
  const drawCommandsCount = drawCommands.length - 1;
  const [turtle, setTurtle] = useState(turtleState);
  const [animatingCommandIndex, setAnimatingCommandIndex] = useState(0);
  const lineCommands = drawCommands
    .slice(0, animatingCommandIndex)
    .filter(isDrawLineCommand) as DrawCommandLinear[];
  const commandToAnimate = drawCommands[animatingCommandIndex] as DrawCommand;
  const isDrawingLine = commandToAnimate && isDrawLineCommand(commandToAnimate);
  const isRotating = commandToAnimate && isRotateCommand(commandToAnimate);
  useEffect(() => {
    enableAnimation();
    if (animatingCommandIndex > drawCommandsCount){
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnimatingCommandIndex(drawCommandsCount)
    }
    if (drawCommandsCount > drawCommandsCountPrev.current) {
      drawCommandsCountPrev.current = drawCommandsCount;
    } else {
      setTurtle(turtleState)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ drawCommandsCount, turtleState])
  useEffect(() => {
      let duration = 0;
      let start: number | null = null;

    const handleDrawLineFrame = (time: number) => {
      const { x1, x2, y1, y2 } = commandToAnimate  as DrawCommandLinear;
      if (start === null) start = time;
      const elapsed = animationEnabled ? time - start : duration;
      if (elapsed < duration) {
        setTurtle(turtle => ({
          ...turtle,
          x: x1 + ((x2 - x1) * (elapsed / duration)),
          y: y1 + ((y2 - y1) * (elapsed / duration)),
        }))
        animationFrameId.current = window.requestAnimationFrame(handleDrawLineFrame)
      } else {
        setTurtle((turtle) => ({ ...turtle, x: x2, y: y2 }));
        setAnimatingCommandIndex((i: number) => i + 1)
      }
    };

    const handleRotationFrame = (time: number) => {
      const {previousAngle, newAngle} = commandToAnimate as DrawCommandRotate;
      if (start === null) start = time;
      const elapsed = animationEnabled ? time - start : duration;
      if (elapsed < duration) {
        setTurtle(turtle => ({
          ...turtle,
          angle: previousAngle + (newAngle - previousAngle) * elapsed / duration
        }))
        animationFrameId.current = window.requestAnimationFrame(handleRotationFrame)
      } else {
        setTurtle(turtle => ({...turtle,  angle: newAngle}));
        setAnimatingCommandIndex((i: number) => i + 1)
      }
    };
    if (isDrawingLine) {
      duration = movementSpeed * distance(commandToAnimate as DrawCommandLinear);
      animationFrameId.current = window.requestAnimationFrame(handleDrawLineFrame)
    }
    if (isRotating) {
      duration = rotateSpeed * Math.abs(commandToAnimate.newAngle - commandToAnimate.previousAngle);
      animationFrameId.current = window.requestAnimationFrame(handleRotationFrame)
    }

    return () => {
      if (animationFrameId.current !== null) {
        window.cancelAnimationFrame(animationFrameId.current!);
        animationFrameId.current = null
        if (animatingCommandIndex === drawCommandsCount && animationEnabled === false) dispatch(enableAnimation())
      }
    }
  }, [commandToAnimate, isDrawingLine, isRotating, animatingCommandIndex, dispatch, drawCommandsCount, animationEnabled])
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
