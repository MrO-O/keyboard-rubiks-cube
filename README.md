# Keyboard Rubik's Cube

A keyboard-first 3D electronic Rubik's Cube for local browser play. The project
has no backend, account, cloud sync, or AI dependency.

## Current stage

The project now contains the Vite/React/TypeScript shell, a pure TypeScript
3x3x3 cubie engine, view-orientation mapping, a Three.js renderer, keyboard
controls, temporary side peeking, and animated face turns.

The Play page renders the current `CubeState` as 26 visible cubies with colored
stickers. U/I/H/J/K/L turn the top, bottom, left, right, front, and back faces
for the current `viewOrientation`; Shift + those keys turns the selected face in
the inverse direction. R resets to solved, X scrambles, and Z undoes the last
ordinary user turn. Scramble replaces the cube state and clears ordinary move
history, so undo does not roll back a scramble in this first implementation.

Face turns animate over 180ms. Starting a turn creates an
`activeTurnAnimation` containing the unchanged `fromState`, the calculated
`toState`, move, start time, and duration. The renderer rotates only the nine
affected cubies from `fromState`; `CubeState` and move history switch to
`toState` only after the animation completes. Cube mesh transforms are therefore
temporary presentation data rather than a second logical state source.

While a face turn is animating, additional face turns, WSAD/Space view changes,
scramble, and undo are ignored. Q/E peek start and release remain available so
peek state cannot become stuck. Reset immediately cancels the animation and
restores the solved cube. Undo and scramble remain instantaneous operations.

W/S rotate the view up/down, A/D rotate it left/right, and Space keeps the
current front fixed while rolling the surrounding faces clockwise. These view
actions only update `viewOrientation`: they do not change `CubeState`, increase
the move count, enter move history, or get reverted by undo. U/I/H/J/K/L always
resolve through the current view, so their physical target changes with the
view. Reset restores both a solved cube and the initial U-up/F-front view;
scramble preserves the current view while replacing the cube state and clearing
ordinary move history.

Holding Q temporarily yaws the rendered cube to show more of the current right
side; holding E does the same for the current left side. Releasing the active
peek key restores the main view. Peek state is separate from both `CubeState`
and `viewOrientation`, so it does not affect U/I/H/J/K/L face mapping, move
count, history, or undo. Reset and scramble clear an active peek.

If Q and E overlap, the latest keydown wins. Releasing a non-active peek key has
no effect; releasing the active key clears the peek instead of restoring an
earlier still-held key. Losing browser focus also clears peek state.

The renderer is intentionally read-only: stable cube position and sticker
orientation come from `CubeState`; active animation data only derives a
temporary transition from one complete state to another.

The default render camera uses a mild perspective front-facing top view: the F
face remains centered toward the player while the U face is visible with
perspective compression. Q/E peeking adds a temporary 24-degree world-Y yaw to
the current view transform without moving the camera.

This increment still does not contain undo, scramble, view, or peek animation,
configurable key bindings, settings, or persistent storage.

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
- Hold Q: temporarily peek at the current right side
- Hold E: temporarily peek at the current left side
- R: reset to solved, restore the initial view, and clear ordinary move history
- X: scramble from solved, preserve the view, and clear ordinary move history
- Z: undo the last ordinary user turn

WSAD, Space, and Q/E do not increase move count or enter move history. Undo only
reverts ordinary face turns and does not revert view or peek actions. Q/E do not
change `viewOrientation`, so face-turn keys continue to target the main view.

During a face-turn animation, new face turns and view controls are ignored.
Undo and scramble are also ignored until completion and remain instantaneous
when invoked while idle. Reset always cancels an active animation.

## Planned work

- Undo, scramble, and view animations
- Configurable key bindings
- Settings page
