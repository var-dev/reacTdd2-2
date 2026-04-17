import {
  forward,
  backward,
  left,
  right,
} from "./movement.js";
import { wait } from "./wait.js";
import { penup, pendown } from "./pen.js";
import { clearScreen } from "./clearScreen.js";
import { repeat } from "./repeat.js";
import { to } from "./to.js";
import { comment } from "./comment.js";

export const builtInFunctions = [
  forward,
  backward,
  left,
  right,
  wait,
  penup,
  pendown,
  clearScreen,
  repeat,
  to,
  comment,
];
