import { useMemo, useState } from 'react'
import {
  applyMove,
  createSolvedCube,
  serializeCube,
  type CubeState,
  type Face,
} from '../cube/model'
import { CubeScene } from '../cube/render'

type PlayPageCubeAction =
  | { readonly type: 'reset' }
  | { readonly type: 'move'; readonly face: Face }

export function reducePlayPageCubeState(
  state: CubeState,
  action: PlayPageCubeAction,
): CubeState {
  if (action.type === 'reset') return createSolvedCube()
  return applyMove(state, { face: action.face, direction: 1 })
}

export function PlayPage() {
  const solvedCubeSignature = useMemo(
    () => serializeCube(createSolvedCube()),
    [],
  )
  const [cubeState, setCubeState] = useState(() => createSolvedCube())
  const isSolved = serializeCube(cubeState) === solvedCubeSignature

  function dispatchCubeAction(action: PlayPageCubeAction) {
    setCubeState((current) => reducePlayPageCubeState(current, action))
  }

  return (
    <main className="play-page">
      <h1>Keyboard Rubik&apos;s Cube</h1>
      <p>
        Stage 2: static 3D cube renderer driven by the pure CubeState model.
      </p>
      <section className="cube-panel" aria-label="3D cube preview">
        <CubeScene cubeState={cubeState} />
      </section>
      <section className="debug-panel" aria-label="Temporary debug controls">
        <p>Cubies rendered: {cubeState.cubies.length}</p>
        <p>State: {isSolved ? 'solved' : 'changed'}</p>
        <div className="debug-actions">
          <button onClick={() => dispatchCubeAction({ type: 'reset' })}>
            Reset
          </button>
          <button
            onClick={() => dispatchCubeAction({ type: 'move', face: 'F' })}
          >
            Apply F
          </button>
          <button
            onClick={() => dispatchCubeAction({ type: 'move', face: 'U' })}
          >
            Apply U
          </button>
          <button
            onClick={() => dispatchCubeAction({ type: 'move', face: 'R' })}
          >
            Apply R
          </button>
        </div>
      </section>
    </main>
  )
}
