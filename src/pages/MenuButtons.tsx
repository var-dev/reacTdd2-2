import { promptFocusRequest } from "../features/redux/environmentSlice.js";
import { useAppSelector, useAppDispatch } from "../features/redux/hooks.js";
import { reset, undo, redo, disableAnimation } from "../features/redux/scriptSlice.js";
import { requestStopSharing, requestStartSharing } from "../features/redux/environmentSlice.js"

const SharingUrl = ({ url }: {url:string}) => (
  <p>
    You are now presenting your script.{" "}
    <a href={url}>Here's the URL for sharing.</a>
  </p>
);
export const MenuButtons = () => {
  const { nextInstructionId, canUndo, canRedo } = useAppSelector(({ script }) => script);
  const environment = useAppSelector(({environment}) => environment);
  const dispatch = useAppDispatch();

  const canReset = nextInstructionId !== 0;

  return (<>
    {environment.isSharing 
      ? (<SharingUrl url={environment.url} />)
      : null
    }
    {environment.isWatching 
      ? (<p>You are now watching the session</p>) 
      : null
    }
    {environment.isSharing ? (
      <button
        type="button"
        id="stopSharing"
        onClick={() => {dispatch(requestStopSharing()); dispatch(promptFocusRequest())}}
      >
        Stop sharing
      </button>
    ) : (
      <button
        type="button"
        id="startSharing"
        onClick={() => {dispatch(requestStartSharing()); dispatch(promptFocusRequest())}}
      >
        Start sharing
      </button>
    )}
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
