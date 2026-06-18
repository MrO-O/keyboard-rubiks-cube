# Keyboard Rubik's Cube

A keyboard-first 3D electronic Rubik's Cube for local browser play. The project
has no backend, account, cloud sync, or AI dependency.

## Current stage

The project now contains the Vite/React/TypeScript shell, a pure TypeScript
3x3x3 cubie engine, view-orientation mapping, and a basic static Three.js
renderer.

The Play page renders the current `CubeState` as 26 visible cubies with colored
stickers. Temporary debug buttons can reset the cube or apply F/U/R moves so the
CubeState -> renderer path can be verified. The renderer is intentionally
read-only: cube position and sticker orientation come from `CubeState`, not from
Three.js mesh state.

The default render camera uses a mild perspective front-facing top view: the F
face remains centered toward the player while the U face is visible with
perspective compression. Side-face peeking will be handled later by Q/E yaw
offsets from this default view.

This increment still does not contain turn animation, keyboard input, Q/E side
view controls, WSAD view controls, settings, or persistent storage.

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

- Keyboard controls
- Turn animations
- Settings page
- Scramble, undo, and reset controls
