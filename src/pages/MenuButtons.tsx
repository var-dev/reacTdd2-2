import { useAppSelector, useAppDispatch } from "../features/redux/hooks.js";
import { reset, undo, redo } from "../features/redux/scriptSlice.js";

export const MenuButtons = () => {
  const { nextInstructionId, canUndo, canRedo } = useAppSelector(({ script }) => script);
  const dispatch = useAppDispatch();

  const canReset = nextInstructionId !== 0;

  return (<>
    <button
      type="button"
      disabled = {!canUndo}
      onClick={() => dispatch(undo())}
    >
      Undo
    </button>
    <button
      type="button"
      disabled = {!canRedo}
      onClick={() => dispatch(redo())}
    >
      Redo
    </button>
    <button
      type="button"
      onClick={() => dispatch(reset())}
      disabled={!canReset}
    >
      Reset
    </button>
  </>);
};
