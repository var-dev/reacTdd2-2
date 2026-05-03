
type AnimatedLineProps = {
    commandToAnimate: DrawCommandLinear;
    turtle: TurtleState;
}
export const AnimatedLine = (
  {
    commandToAnimate: { x1, y1 },
    turtle: {x, y},
  }: AnimatedLineProps)=>{
  return <
    line 
      x1={x1} 
      y1={y1} 
      x2={x} 
      y2={y}
      stroke-width="2"
      stroke="black"
    ></line>
}