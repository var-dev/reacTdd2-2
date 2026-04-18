import { JSDOM } from 'jsdom';

// Provide a minimal global document at module load time so libraries
// that bind to `document` at import time (like @testing-library/react)
// have a valid global document to attach to.
const dom = new JSDOM('<!doctype html><html><body></body></html>');
(globalThis as any).window = dom.window; 
(globalThis as any).document = dom.window.document; 
(globalThis as any).HTMLElement = dom.window.HTMLElement; 
(globalThis as any).Node = dom.window.Node;
(globalThis as any).HTMLInputElement = dom.window.HTMLInputElement;
(globalThis as any).HTMLButtonElement = dom.window.HTMLButtonElement;
(globalThis as any).HTMLFormElement = dom.window.HTMLFormElement;
(globalThis as any).HTMLLabelElement = dom.window.HTMLLabelElement;
(globalThis as any).HTMLDivElement = dom.window.HTMLDivElement;
// Event constructors from jsdom so events created in tests are compatible
(globalThis as any).Event = dom.window.Event;
(globalThis as any).MouseEvent = dom.window.MouseEvent;
(globalThis as any).KeyboardEvent = dom.window.KeyboardEvent;
// Let React know this environment supports `act()` for tests
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;