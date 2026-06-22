# Keyboard Rubik's Cube

A keyboard-first 3D electronic Rubik's Cube for local browser play. The project
has no backend, account, cloud sync, or AI dependency.

## Current stage

The project now contains the Vite/React/TypeScript shell, a pure TypeScript
3x3x3 cubie engine, view-orientation mapping, a Three.js renderer, keyboard
controls, temporary side peeking, animated face turns, a one-turn input buffer,
browser-local settings, automatic game-state persistence, and installable PWA
support. Single-layer and two-layer wide turns use the same pure cubie engine.
The app can be deployed as a static site with GitHub Pages.

The Play page renders the current `CubeState` as 26 visible cubies with colored
stickers. U/J/I/K/O/L turn the top, bottom, left, right, front, and back faces
for the current `viewOrientation`; Shift + those keys turns the selected face in
the inverse direction. R resets to solved, X scrambles, and Z undoes the last
ordinary user turn. Scramble replaces the cube state and clears ordinary move
history, so undo does not roll back a scramble in this first implementation.

Face turns animate over the configured duration. Starting a turn creates an
`activeTurnAnimation` containing the unchanged `fromState`, the calculated
`toState`, move, start time, and duration. The renderer rotates only the nine
affected cubies from `fromState`; `CubeState` and move history switch to
`toState` only after the animation completes. Cube mesh transforms are therefore
temporary presentation data rather than a second logical state source.

While a face turn is animating, additional face turns, WSAD/Space view changes,
scramble, and undo follow separate input policies. One additional face turn is
stored as a concrete physical `CubeMove` in the single-slot `pendingTurn`
buffer. Repeated face-turn inputs overwrite that slot, so the latest input wins.
WSAD/Space, scramble, and undo remain ignored. Q/E peek key presses remain
available. Reset immediately cancels the
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

Animation speed has Fast (120ms), Normal (180ms), and Slow (260ms) options for
both face turns and view rotations. A new animation captures the current setting
when it starts, so an animation already in progress keeps its original duration.
Settings stay only in the current browser and are not synchronized to an account
or cloud.

The last stable game state is automatically stored in `localStorage` under
`keyboard-rubiks-cube.game.v1`. It includes `cubeState`, `viewOrientation`, and
ordinary `moveHistory`; settings remain separate under
`keyboard-rubiks-cube.settings.v1`. Refreshing restores the last stable state,
including the move count. Face-turn and view-animation state, `pendingTurn`,
`peekDirection`, and other temporary UI state are never included in the saved
payload, so refreshing during an animation resumes from the most recently
committed cube and view orientation.

The Settings page can clear the saved game. This also resets the current game
to solved and removes the game key without changing settings. Clearing browser
data can also delete both local records. There is currently no account or cloud
synchronization.

S/W animate the view up/down, A/D animate it left/right, and Space keeps the
current front fixed while animating a clockwise roll. Shift + Space performs the
counterclockwise roll. If the roll key is customized, Shift + that custom key
still selects the counterclockwise direction. These actions commit only
`viewOrientation`: they do not change `CubeState`, increase the move count, enter
move history, or get reverted by undo. U/J/I/K/O/L always resolve through the
committed view, so face-turn keys target the new physical face after the
animation completes.
Reset restores both a solved cube and the initial U-up/F-front view; scramble
preserves the current view while replacing the cube state and clearing ordinary
move history.

Face-turn and view animations are mutually exclusive. During a view animation,
new face turns, view actions, scramble, and undo are ignored; no `pendingTurn` is
created. During a face-turn animation, view actions remain ignored. Q/E stays
responsive in either case, and Reset cancels the active animation. There is no
view-animation queue.

Pressing E latches a yaw that shows more of the current right side; pressing Q
latches the corresponding left-side view. Releasing the key does not restore the
main view. Press the opposite peek key (Q after E, or E after Q) to return. A
repeated press of the already active side leaves it latched. Peek state remains
separate from both `CubeState` and `viewOrientation`, so it does not affect face
mapping, move count, history, or undo. Reset and scramble clear an active peek.

The renderer is intentionally read-only: stable cube position and sticker
orientation come from `CubeState`; active animation data only derives a
temporary transition from one complete state to another.

The default render camera uses a mild perspective front-facing top view: the F
face remains centered toward the player while the U face is visible with
perspective compression. Q/E peeking adds a latched 24-degree world-Y yaw to
the current view transform without moving the camera.

This increment still does not contain undo, scramble, or peek animation,
settings or game import/export, accounts, cloud sync, or mobile gestures.

## Run locally

```bash
npm install
npm run dev
```

Local development always uses the root base path `/`, regardless of the Pages
deployment setting.

## Build

```bash
npm run build
npm run preview
```

The production build emits the app, web manifest, generated service worker, and
static icons into `dist`. The initial in-repository icons are basic SVG Rubik's
Cube artwork with 192x192 and 512x512 manifest entries.

Run the project checks separately when changing behavior or deployment config:

```bash
npm run test
npm run lint
```

## Deploy to GitHub Pages

1. Create a GitHub repository for the project.
2. Push `main` to GitHub.
3. In repository **Settings → Pages**, choose **GitHub Actions** as the source.
4. Push to `main`; `.github/workflows/deploy.yml` installs dependencies, builds
   the repository subpath version, uploads `dist`, and deploys it with official
   GitHub Pages actions.
5. After the workflow completes, open the GitHub Pages URL shown by the deploy
   job.
6. Bookmark that URL for normal browser use.
7. In a supported browser, use its install action to install the app as a PWA.

The workflow sets `VITE_BASE_PATH` to `/<repository-name>/`, without hardcoding
a GitHub username. For another production host or a manual Pages build, set the
variable explicitly before building, for example:

```bash
VITE_BASE_PATH=/keyboard-rubiks-cube/ npm run build
```

PowerShell equivalent:

```powershell
$env:VITE_BASE_PATH='/keyboard-rubiks-cube/'
npm run build
```

The app currently switches between Play and Settings with local React state; it
does not use URL routes. GitHub Pages therefore needs neither a `HashRouter` nor
a custom 404 fallback.

## Local data warning

Game state and settings are stored separately in the current browser's
`localStorage`. GitHub Pages only hosts application code and does not receive or
store user data. Local state does not migrate automatically when changing
browsers, devices, deployment URLs, or after clearing browser data. Installing
the PWA does not add an account or synchronization layer; there is currently no
cloud sync.

## Cube conventions

Coordinates use `x = -1` for left and `x = 1` for right; `y = -1` for down and
`y = 1` for up; `z = -1` for back and `z = 1` for front. Therefore U/D are at
`y = 1/-1`, L/R at `x = -1/1`, and F/B at `z = 1/-1`.

A clockwise move is a 90-degree clockwise turn when looking directly at that
face from outside the cube.

## Default keyboard controls

- U: turn current view top face clockwise
- J: turn current view bottom face clockwise
- I: turn current view left face clockwise
- K: turn current view right face clockwise
- O: turn current view front face clockwise
- L: turn current view back face clockwise
- Shift + U/J/I/K/O/L: turn the same current-view face counterclockwise
- Hold F + U/J/I/K/O/L: turn that face and its adjacent middle layer
- Hold F + Shift + U/J/I/K/O/L: perform the inverse two-layer turn
- S/W: rotate the view up/down
- A/D: rotate the view left/right
- Space: keep the current front and roll the view clockwise
- Shift + Space: keep the current front and roll the view counterclockwise
- E: latch the current right-side peek; press Q to return
- Q: latch the current left-side peek; press E to return
- R: reset to solved, restore the initial view, and clear ordinary move history
- X: scramble from solved, preserve the view, and clear ordinary move history
- Z: undo the last ordinary user turn

F is the default wide turn modifier and can be changed in Settings. Ctrl,
Meta, and Alt are not accepted for this binding because they conflict with
browser and operating-system shortcuts. The configured modifier must also be
different from every ordinary action key.

Move history uses standard wide notation: `Uw`, `Fw`, and `Rw` mean a clockwise
two-layer turn viewed from that outer face, while `Uw'`, `Fw'`, and `Rw'` are
their inverses. Ordinary moves remain `U`, `F`, `R`, and so on.

WSAD, Space, Shift + Space, and Q/E do not increase move count or enter move history. Undo only
reverts ordinary face turns and does not revert view or peek actions. Q/E do not
change `viewOrientation`, so face-turn keys continue to target the main view.

During a face-turn animation, the latest additional face turn is buffered in a
single slot. View controls, undo, and scramble are ignored until completion and
do not alter the buffered move. Reset always cancels both the active animation
and pending turn.

During a view animation, new face and view inputs are ignored rather than
buffered. The committed orientation changes only when the animation finishes.

## Planned work

- Undo and scramble animations
- Mobile input design
