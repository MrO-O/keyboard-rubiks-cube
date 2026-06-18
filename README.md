# Keyboard Rubik's Cube

A keyboard-first 3D electronic Rubik's Cube for local browser play. The project
has no backend, account, cloud sync, or AI dependency.

## Current stage

This first increment contains the Vite/React/TypeScript shell, a pure TypeScript
3×3×3 cubie engine, view-orientation mapping, and unit tests. It intentionally
does not contain 3D rendering, keyboard input, animation, or settings UI.

## Commands

```bash
npm install
npm run dev
npm run test
npm run build
npm run lint
```

## Cube conventions

Coordinates use `x = -1` for left and `x = 1` for right; `y = -1` for down and
`y = 1` for up; `z = -1` for back and `z = 1` for front. Therefore U/D are at
`y = 1/-1`, L/R at `x = -1/1`, and F/B at `z = 1/-1`.

A clockwise move is a 90-degree clockwise turn when looking directly at that
face from outside the cube.

## Planned work

- 3D rendering
- Keyboard controls
- Turn animations
- Settings page
- Scramble, undo, and reset controls
