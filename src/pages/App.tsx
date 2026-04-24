import { MenuButtons } from "./MenuButtons.js";
import { ScriptName } from "./ScriptName.js";
import { Drawing } from "./Drawing.js";
import { StatementHistory } from "./StatementHistory.js";
import { Prompt } from "./Prompt.js";
import { PromptError } from "./PromptError.js";

export const App = () => (
  <div id="mainWindow">
    <menu>
      <ScriptName />
      <MenuButtons />
    </menu>
    <div id="drawing">
      <Drawing />
    </div>
    <div id="commands">
      <table>
        <StatementHistory />
        <Prompt />
        <PromptError />
      </table>
    </div>
  </div>
);
