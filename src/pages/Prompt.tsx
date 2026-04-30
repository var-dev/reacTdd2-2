import React, { useState, useRef, useEffect } from "react";
import { submitEditLine } from "../features/redux/scriptSlice";
import { useAppDispatch, useAppSelector } from "../features/redux/hooks";
import { promptHasFocus } from "../features/redux/environmentSlice";

export const Prompt = () => {
  const nextInstructionId = useAppSelector(({ script: { nextInstructionId }}) => nextInstructionId);
  const promptFocusRequest = useAppSelector(({ environment: { promptFocusRequest }}) => promptFocusRequest);
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {inputRef.current?.focus()}, [inputRef]);
  useEffect(() => {
    inputRef.current?.focus()
    if (promptFocusRequest) dispatch(promptHasFocus());
  }, [promptFocusRequest]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setShouldSubmit(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditPrompt((e.target as HTMLTextAreaElement).value);
    if (shouldSubmit) {
      dispatch(submitEditLine((e.target as HTMLTextAreaElement).value));
      setShouldSubmit(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) =>
    setHeight((e.target as HTMLTextAreaElement).scrollHeight);

  const [editPrompt, setEditPrompt] = useState("");
  const [shouldSubmit, setShouldSubmit] = useState(false);
  const [currentInstructionId, setCurrentInstructionId,] = useState(nextInstructionId);
  const [height, setHeight] = useState(20);

  if (currentInstructionId != nextInstructionId) {
    setCurrentInstructionId(nextInstructionId);
    setEditPrompt("");
    setHeight(20);
  }

  return (
    <tbody key="prompt">
      <tr>
        <td className="promptIndicator">&gt;</td>
        <td>
          <textarea
            aria-label="Prompt Textarea"
            onScroll={handleScroll}
            value={editPrompt}
            style={{ height: height }}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            ref={inputRef}
          />
        </td>
      </tr>
    </tbody>
  );
};
