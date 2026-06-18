# Keyboard Rubik's Cube

A keyboard-first 3D electronic Rubik's Cube for local browser play. The project
has no backend, account, cloud sync, or AI dependency.

## Current stage

The project now contains the Vite/React/TypeScript shell, a pure TypeScript
3x3x3 cubie engine, view-orientation mapping, a basic static Three.js renderer,
and a no-animation keyboard input and view-orientation layer.

The Play page renders the current `CubeState` as 26 visible cubies with colored
stickers. U/I/H/J/K/L turn the top, bottom, left, right, front, and back faces
for the current `viewOrientation`; Shift + those keys turns the selected face in
the inverse direction. R resets to solved, X scrambles, and Z undoes the last
ordinary user turn. Scramble replaces the cube state and clears ordinary move
history, so undo does not roll back a scramble in this first implementation.

W/S rotate the view up/down, A/D rotate it left/right, and Space keeps the
current front fixed while rolling the surrounding faces clockwise. These view
actions only update `viewOrientation`: they do not change `CubeState`, increase
the move count, enter move history, or get reverted by undo. U/I/H/J/K/L always
resolve through the current view, so their physical target changes with the
view. Reset restores both a solved cube and the initial U-up/F-front view;
scramble preserves the current view while replacing the cube state and clearing
ordinary move history.

The renderer is intentionally read-only: cube position and sticker orientation
come from `CubeState`, not from Three.js mesh state.

The default render camera uses a mild perspective front-facing top view: the F
face remains centered toward the player while the U face is visible with
perspective compression. Side-face peeking will be handled later by Q/E yaw
offsets from this default view.

This increment still does not contain turn or view animation, Q/E temporary
side view controls, settings, or persistent storage.

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
- W/S: rotate the view up/down
- A/D: rotate the view left/right
- Space: keep the current front and roll the view clockwise
- R: reset to solved, restore the initial view, and clear ordinary move history
- X: scramble from solved, preserve the view, and clear ordinary move history
- Z: undo the last ordinary user turn

WSAD and Space do not increase move count or enter move history. Undo only
reverts ordinary face turns and does not revert view actions.

## Planned work

- Turn and view animations
- Q/E temporary side view controls
- Settings page
