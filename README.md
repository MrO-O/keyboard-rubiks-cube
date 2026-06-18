# Keyboard Rubik's Cube

A keyboard-first 3D electronic Rubik's Cube for local browser play. The project
has no backend, account, cloud sync, or AI dependency.

## Current stage

The project now contains the Vite/React/TypeScript shell, a pure TypeScript
3x3x3 cubie engine, view-orientation mapping, a basic static Three.js renderer,
and a no-animation keyboard input layer.

The Play page renders the current `CubeState` as 26 visible cubies with colored
stickers. U/I/H/J/K/L turn the top, bottom, left, right, front, and back faces
for the current `viewOrientation`; Shift + those keys turns the selected face in
the inverse direction. R resets to solved, X scrambles, and Z undoes the last
ordinary user turn. Scramble replaces the cube state and clears ordinary move
history, so undo does not roll back a scramble in this first implementation.

The renderer is intentionally read-only: cube position and sticker orientation
come from `CubeState`, not from Three.js mesh state.

The default render camera uses a mild perspective front-facing top view: the F
face remains centered toward the player while the U face is visible with
perspective compression. Side-face peeking will be handled later by Q/E yaw
offsets from this default view.

This increment still does not contain turn animation, Q/E side view controls,
WSAD view controls, SPACE roll, settings, or persistent storage.

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

## Keyboard controls

- U: turn current view top face clockwise
- I: turn current view bottom face clockwise
- H: turn current view left face clockwise
- J: turn current view right face clockwise
- K: turn current view front face clockwise
- L: turn current view back face clockwise
- Shift + U/I/H/J/K/L: turn the same current-view face counterclockwise
- R: reset to solved and clear ordinary move history
- X: scramble from solved and clear ordinary move history
- Z: undo the last ordinary user turn

## Planned work

- Turn animations
- WSAD, Q/E, and SPACE view controls
- Settings page
