const radians = (angle:number) => (Math.PI * angle) / 180;

export function moveDistance(state:LogoState, distanceValue: Value):LogoState {
  if(!('turtle' in state)) throw Error("no turtle in state")
  const { turtle } = state ;
  let { drawCommands, nextDrawCommandId } = state;
  const angle = turtle.angle;
  const radius = distanceValue.get(state);
  const newX = turtle.x + Math.cos(radians(angle)) * radius;
  const newY = turtle.y + Math.sin(radians(angle)) * radius;

  if (('pen' in state) && state?.pen?.down) {
    drawCommands = [
      ...drawCommands,
      {
        drawCommand: "drawLine",
        id: nextDrawCommandId++,
        x1: turtle.x,
        y1: turtle.y,
        x2: newX,
        y2: newY,
      },
    ];
  }

  return {
    drawCommands,
    turtle: {
      ...turtle,
      x: newX,
      y: newY,
    },
    nextDrawCommandId,
  } as LogoState;
}
