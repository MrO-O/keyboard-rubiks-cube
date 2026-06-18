import { applyMove, createSolvedCube } from '../cube/model'

export function PlayPage() {
  const solvedCube = createSolvedCube()
  const afterFrontMove = applyMove(solvedCube, { face: 'F', direction: 1 })

  return (
    <main>
      <h1>Keyboard Rubik&apos;s Cube</h1>
      <p>Stage 1: pure cube and view logic.</p>
      <p>Solved cube cubies: {solvedCube.cubies.length}</p>
      <p>
        {afterFrontMove !== solvedCube ? 'F move applied' : 'F move failed'}
      </p>
      <p>3D rendering will be implemented later.</p>
    </main>
  )
}
