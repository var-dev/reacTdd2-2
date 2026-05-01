import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "../features/redux/hooks.js";
import { submitScriptName } from "../features/redux/scriptSlice.js";
import { promptFocusRequest } from "../features/redux/environmentSlice.js";

const ifEnterKey = (e: React.KeyboardEvent<HTMLInputElement>, func: Function) => {
  if (e.key === "Enter") {
    func();
  }
};

export const ScriptName = () => {
  const name = useAppSelector(({ script }) => script.name);
  const dispatch = useAppDispatch();
  const [updatedScriptName, setScriptName] = useState(name);
  const [editingScriptName, setEditingScriptName] = useState(false);

  const toggleEditingScriptName = () => setEditingScriptName(!editingScriptName);
  const completeEditingScriptName = () => {
    if (editingScriptName) {
      toggleEditingScriptName();
      dispatch(submitScriptName(updatedScriptName));
      dispatch(promptFocusRequest())
    }
  };

  return (
    <input
      aria-label="Script name input"
      id="name"
      className={editingScriptName ? "isEditing" : undefined}
      value={updatedScriptName}
      onFocus={() => toggleEditingScriptName()}
      onChange={(e) => setScriptName(e.target.value)}
      onKeyDown={(e) => ifEnterKey(e, completeEditingScriptName)}
      onBlur={completeEditingScriptName}
    />
  );
};
