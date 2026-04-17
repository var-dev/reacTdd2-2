const changePen = (option: Record<string,any>) => (state: LogoState) => ({
  pen: { ...state.pen, ...option },
});

export const penup: Partial<Command> = {
  names: ["penup", "pu"],
  isWriteProtected: true,
  initial: { isComplete: true },
  perform: changePen({ down: false }),
};

export const pendown: Partial<Command>  = {
  names: ["pendown", "pd"],
  isWriteProtected: true,
  initial: { isComplete: true },
  perform: changePen({ down: true }),
};
