import { useEffect } from 'react'
import {
  DEFAULT_KEYMAP,
  keyToAction,
  shouldPreventDefault,
} from '../cube/controls'
import { useCubeGame } from '../cube/game'
import { CubeScene } from '../cube/render'
import { getViewFaces } from '../cube/view'

export function PlayPage() {
  const { state, dispatch } = useCubeGame()
  const recentMoves = state.moveHistory.slice(-10)
  const viewFaces = getViewFaces(state.viewOrientation)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const action = keyToAction(event)
      if (!action) return

      if (shouldPreventDefault(action)) event.preventDefault()
      dispatch(action)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dispatch])

  return (
    <main className="play-page">
      <h1>Keyboard Rubik&apos;s Cube</h1>
      <p>
        Stage 4: view controls rotate the rendered cube without changing
        CubeState.
      </p>
      <section className="cube-panel" aria-label="3D cube preview">
        <CubeScene
          cubeState={state.cubeState}
          viewOrientation={state.viewOrientation}
        />
      </section>
      <section className="game-panel" aria-label="Cube controls and status">
        <div className="status-grid">
          <p>
            Move count: <strong>{state.moveHistory.length}</strong>
          </p>
          <p>
            Solved: <strong>{state.isSolved ? 'yes' : 'no'}</strong>
          </p>
          <p>
            Last action: <strong>{state.lastActionLabel}</strong>
          </p>
        </div>

        <section className="view-status" aria-label="View orientation">
          <h2>View orientation</h2>
          <dl>
            <div>
              <dt>Up:</dt>
              <dd>{viewFaces.up}</dd>
            </div>
            <div>
              <dt>Front:</dt>
              <dd>{viewFaces.front}</dd>
            </div>
            <div>
              <dt>Left:</dt>
              <dd>{viewFaces.left}</dd>
            </div>
            <div>
              <dt>Right:</dt>
              <dd>{viewFaces.right}</dd>
            </div>
            <div>
              <dt>Down:</dt>
              <dd>{viewFaces.down}</dd>
            </div>
            <div>
              <dt>Back:</dt>
              <dd>{viewFaces.back}</dd>
            </div>
          </dl>
        </section>

        <div className="control-actions" aria-label="Cube actions">
          <button onClick={() => dispatch({ id: 'resetCube' })}>Reset</button>
          <button onClick={() => dispatch({ id: 'scrambleCube' })}>
            Scramble
          </button>
          <button onClick={() => dispatch({ id: 'undoMove' })}>Undo</button>
        </div>

        <section className="keyboard-help" aria-label="Keyboard controls">
          <h2>Keyboard</h2>
          <ul>
            {DEFAULT_KEYMAP.map((binding) => (
              <li key={binding.key}>{binding.label}</li>
            ))}
          </ul>
          <p>Shift + U/I/H/J/K/L turns that face counterclockwise.</p>
        </section>

        <section className="move-history" aria-label="Recent moves">
          <h2>Recent moves</h2>
          {recentMoves.length > 0 ? (
            <ol>
              {recentMoves.map((entry, index) => (
                <li key={`${index}-${entry.label}`}>{entry.label}</li>
              ))}
            </ol>
          ) : (
            <p>No moves yet.</p>
          )}
        </section>
      </section>
    </main>
  )
}
