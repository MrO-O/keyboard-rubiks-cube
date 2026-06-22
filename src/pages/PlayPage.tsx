import { useEffect } from 'react'
import {
  displayBindingKey,
  formatMoveLabel,
  keyToAction,
  shouldPreventDefault,
} from '../cube/controls'
import type { CubeGameController } from '../cube/game'
import { CubeScene } from '../cube/render'
import { getViewFaces } from '../cube/view'
import { useSettings } from '../settings'

interface PlayPageProps {
  readonly game: CubeGameController
  readonly onOpenSettings: () => void
}

export function PlayPage({ game, onOpenSettings }: PlayPageProps) {
  const { settings } = useSettings()
  const { state, dispatch, completeTurnAnimation } = game
  const recentMoves = state.moveHistory.slice(-10)
  const viewFaces = getViewFaces(state.viewOrientation)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const action = keyToAction(
        event,
        'keydown',
        settings.keymap,
        settings.wideTurnModifierKey,
        state.wideTurnModifierActive,
      )
      if (!action) return

      if (shouldPreventDefault(action)) event.preventDefault()
      dispatch(action)
    }

    function handleKeyUp(event: KeyboardEvent) {
      const action = keyToAction(
        event,
        'keyup',
        settings.keymap,
        settings.wideTurnModifierKey,
        state.wideTurnModifierActive,
      )
      if (!action) return

      if (shouldPreventDefault(action)) event.preventDefault()
      dispatch(action)
    }

    function handleBlur() {
      dispatch({ id: 'clearPeek' })
      dispatch({ id: 'clearWideTurnModifier' })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [
    dispatch,
    settings.keymap,
    settings.wideTurnModifierKey,
    state.wideTurnModifierActive,
  ])

  return (
    <main className="play-page">
      <h1>Keyboard Rubik&apos;s Cube</h1>
      <p>Game autosaved locally. Refresh to continue from the last stable state.</p>
      <div className="page-navigation">
        <button onClick={onOpenSettings}>Settings</button>
      </div>
      <section className="cube-panel" aria-label="3D cube preview">
        <CubeScene
          cubeState={state.cubeState}
          viewOrientation={state.viewOrientation}
          peekDirection={state.peekDirection}
          activeTurnAnimation={state.activeTurnAnimation}
          onTurnAnimationComplete={completeTurnAnimation}
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
          <p>
            Peek:{' '}
            <strong>
              {state.peekDirection === 'showRight'
                ? 'showing right side'
                : state.peekDirection === 'showLeft'
                  ? 'showing left side'
                  : 'none'}
            </strong>
          </p>
          <p>
            Turning:{' '}
            <strong>
              {state.activeTurnAnimation
                ? formatMoveLabel(
                    state.activeTurnAnimation.move.face,
                    state.activeTurnAnimation.move.direction,
                    state.activeTurnAnimation.move.layers,
                  )
                : 'idle'}
            </strong>
          </p>
          <p>
            Buffered:{' '}
            <strong>
              {state.pendingTurn
                ? formatMoveLabel(
                    state.pendingTurn.face,
                    state.pendingTurn.direction,
                    state.pendingTurn.layers,
                  )
                : 'none'}
            </strong>
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
          <button
            disabled={Boolean(state.activeTurnAnimation)}
            onClick={() => dispatch({ id: 'scrambleCube' })}
          >
            Scramble
          </button>
          <button
            disabled={Boolean(state.activeTurnAnimation)}
            onClick={() => dispatch({ id: 'undoMove' })}
          >
            Undo
          </button>
        </div>

        <section className="keyboard-help" aria-label="Keyboard controls">
          <h2>Keyboard</h2>
          <ul>
            {settings.keymap.map((binding) => (
              <li key={binding.key}>{binding.label}</li>
            ))}
          </ul>
          <p>Shift + U/I/H/J/K/L turns that face counterclockwise.</p>
          <p>
            Hold {displayBindingKey(settings.wideTurnModifierKey)} +
            U/I/H/J/K/L for a two-layer wide turn; add Shift for its inverse.
          </p>
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
