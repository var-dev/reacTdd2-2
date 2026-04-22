import { useAppSelector, useAppDispatch } from "../features/redux/hooks.js";
import { reset } from "../features/redux/scriptSlice.js";

export const MenuButtons = () => {
  const { nextInstructionId } = useAppSelector(({ script }) => script);
  const dispatch = useAppDispatch();

  const canReset = nextInstructionId !== 0;

  return (
    <button
      type="button"
      onClick={() => dispatch(reset())}
      disabled={!canReset}
    >
      Reset
    </button>
  );
};
