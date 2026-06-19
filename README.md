# Keyboard Rubik's Cube

A keyboard-first 3D electronic Rubik's Cube for local browser play. The project
has no backend, account, cloud sync, or AI dependency.

## Current stage

The project now contains the Vite/React/TypeScript shell, a pure TypeScript
3x3x3 cubie engine, view-orientation mapping, a Three.js renderer, keyboard
controls, temporary side peeking, animated face turns, a one-turn input buffer,
browser-local settings, and automatic game-state persistence.

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
scramble, and undo follow separate input policies. One additional face turn is
stored as a concrete physical `CubeMove` in the single-slot `pendingTurn`
buffer. Repeated face-turn inputs overwrite that slot, so the latest input wins.
WSAD/Space, scramble, and undo remain ignored. Q/E peek start and release remain
available so peek state cannot become stuck. Reset immediately cancels the
animation, clears `pendingTurn`, and restores the solved cube. Undo and scramble
remain instantaneous operations while idle.

`pendingTurn` does not change `CubeState`, `viewOrientation`, or move history.
When the current animation completes, its `toState` and history entry are
committed first. If the slot is occupied, the buffered move then starts a new
animation from that committed state and the slot is cleared. Its history entry
is added only when that second animation completes.

The Settings page can rebind all face, view, peek, reset, scramble, and undo
actions. Changes apply immediately and are stored under
`keyboard-rubiks-cube.settings.v1` in `localStorage`. Duplicate bindings,
Ctrl/Meta/Alt combinations, Escape, and Shift as a standalone key are rejected;
Shift remains the fixed inverse modifier for face turns. Restore defaults
reinstates the original keymap and normal 180ms turn timing.

Turn animation speed has Fast (120ms), Normal (180ms), and Slow (260ms)
options. A new face-turn animation captures the current setting when it starts,
so an animation already in progress keeps its original duration. Settings stay
only in the current browser and are not synchronized to an account or cloud.

The last stable game state is automatically stored in `localStorage` under
`keyboard-rubiks-cube.game.v1`. It includes `cubeState`, `viewOrientation`, and
ordinary `moveHistory`; settings remain separate under
`keyboard-rubiks-cube.settings.v1`. Refreshing restores the last stable state,
including the move count. Face-turn animation state, `pendingTurn`,
`peekDirection`, and other temporary UI state are never included in the saved
payload, so refreshing during an animation resumes from the most recently
committed cube state.

The Settings page can clear the saved game. This also resets the current game
to solved and removes the game key without changing settings. Clearing browser
data can also delete both local records. There is currently no account or cloud
synchronization.

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
settings or game import/export, accounts, cloud sync, or mobile gestures.

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

## Default keyboard controls

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

During a face-turn animation, the latest additional face turn is buffered in a
single slot. View controls, undo, and scramble are ignored until completion and
do not alter the buffered move. Reset always cancels both the active animation
and pending turn.

## Planned work

- Undo, scramble, and view animations
- Mobile input design
