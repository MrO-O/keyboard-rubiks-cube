# Project

Keyboard-first electronic Rubik's Cube. Keep cube state, view state, key mapping,
and 3D rendering in separate layers. Core logic must not depend on React.

## Commands

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`

## Architecture rules

- Put cube logic in pure TypeScript modules under `src/cube/model`.
- Do not put cube state algorithms in React components.
- Never use Three.js animation state as the sole source of truth.
- The rendering layer may only present the current logical state.
- Keep view orientation separate from cube state.
- Add or update tests before extending behavior.

## Git workflow

- Keep `main` buildable with tests passing.
- Use `feat/<short-name>` for features.
- Use `fix/<short-name>` for fixes.
- Use `refactor/<short-name>` for refactors.
- Keep each commit focused on one clear topic.
- Run build, test, and lint before committing.
- Do not push unless the user explicitly requests it.
- Do not rewrite history unless the user explicitly requests it.

## Done criteria

- Build passes.
- Tests pass.
- Lint passes.
- Relevant README or documentation is updated.
