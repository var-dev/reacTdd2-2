import { promptFocusRequest } from "../features/redux/environmentSlice.js";
import { useAppSelector, useAppDispatch } from "../features/redux/hooks.js";
import { reset, undo, redo, disableAnimation } from "../features/redux/scriptSlice.js";

export const MenuButtons = () => {
  const { nextInstructionId, canUndo, canRedo } = useAppSelector(({ script }) => script);
  const dispatch = useAppDispatch();

  const canReset = nextInstructionId !== 0;

  return (<>
    <button
      type="button"
      onClick={() => {dispatch(disableAnimation()); dispatch(promptFocusRequest())}}
    >
      Skip Animation
    </button>
    <button
      type="button"
      disabled = {!canUndo}
      onClick={() => {dispatch(undo()); dispatch(disableAnimation()); dispatch(promptFocusRequest())}}
    >
      Undo
    </button>
    <button
      type="button"
      disabled = {!canRedo}
      onClick={() => {dispatch(redo()); dispatch(disableAnimation()); dispatch(promptFocusRequest())}}
    >
      Redo
    </button>
    <button
      type="button"
      onClick={() => {dispatch(reset()); dispatch(promptFocusRequest())}}
      disabled={!canReset}
    >
      Reset
    </button>
  </>);
};
