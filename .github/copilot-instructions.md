Repository: reacTdd2-2
Purpose: Guidance for future Copilot sessions so suggestions and automated edits match project conventions.

1) Quick commands
- Dev server: npm run dev  (vite)
- Build (TypeScript project references + Vite): npm run build  -> runs `tsc -b && vite build`
- Lint: npm run lint  -> runs `eslint .`
- Tests (two parallel test setups):
  - Node-runner (unit tests): npm run test
    - Under the hood: node --import tsx --test "test/**/*.{test.ts,test.tsx}"
    - Run a single Node-runner test file: node --import tsx --test test/path/to/file.test.ts
  - Vitest (component/DOM tests): npm run vitest (interactive) or npm run vitest:run (CI/run)
    - Config: vitest.config.ts uses jsdom, globals, setupFiles: ./vitest.setup.ts
    - Run a single Vitest file: npx vitest path/to/file.vitest.tsx --run
    - Run a single Vitest test by name: npx vitest -t "partial test name" --run

2) High-level architecture (big picture)
- Vite + React + TypeScript app (vite.config.ts + tsconfig project references).
- State management: @reduxjs/toolkit + redux-saga for side effects.
- Routing: react-router-dom.
- Tests split by runner:
  - Vitest for component tests that require a DOM (jsdom). Those files use the .vitest.tsx suffix and are discovered via vitest.config.ts include: ["src/**/*.vitest.tsx","test/**/*.vitest.tsx"].
  - Node's built-in test runner (via tsx) for non-DOM unit tests under test/**/*.{test.ts,test.tsx}.
- TypeScript is compiled via project references (tsc -b) before Vite build; keep tsconfig.app.json and tsconfig.node.json references intact.

3) Key conventions and repository-specific patterns
- Test file naming and placement:
  - DOM/component tests: use .vitest.tsx suffix (place in src/ or test/). Vitest is configured to auto-load vitest.setup.ts.
  - Unit tests using Node runner: use *.test.ts or *.test.tsx under test/.
- Test setup: vitest.setup.ts imports @testing-library/jest-dom/vitest and performs global cleanup (do not duplicate global cleanup in every test).
- Running TypeScript tests without build: the project uses the tsx tool (devDependency) so Node-runner tests execute TypeScript directly with `--import tsx`.
- Linting: ESLint is configured for .ts/.tsx via eslint.config.js; dist/ is ignored.
- Prefer the appropriate runner: use Vitest for any test requiring jsdom/DOM behavior and the Node runner for pure logic/unit tests. Suggestions and automated changes that add or move tests should preserve these naming conventions and runner choices.

4) Files/places Copilot should check before editing or creating tests
- vitest.config.ts and vitest.setup.ts (test environment and globals)
- package.json scripts (to use existing scripts when possible)
- tsconfig*.json if TypeScript changes are required
- eslint.config.js for ESLint rule alignment

5) Existing assistant/agent config files checked
- No CLAUDE.md, AGENTS.md, CONVENTIONS.md, or other AI assistant rules were found in the repository root. If team-specific agent rules exist elsewhere, incorporate them into this file.

If helpful, ask for preferred test runner to default to when adding new tests (Vitest vs Node runner).

---
Would you like help configuring MCP servers for this repo (examples: Playwright for web e2e)?
