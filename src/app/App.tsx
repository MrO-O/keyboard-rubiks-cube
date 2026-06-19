import { useState } from 'react'
import { useCubeGame } from '../cube/game'
import { PlayPage } from '../pages/PlayPage'
import { SettingsPage } from '../pages/SettingsPage'
import { useSettings } from '../settings'

export function App() {
  const [page, setPage] = useState<'play' | 'settings'>('play')
  const { settings } = useSettings()
  const game = useCubeGame(settings.animationDurationMs)

  return page === 'play' ? (
    <PlayPage game={game} onOpenSettings={() => setPage('settings')} />
  ) : (
    <SettingsPage
      onBack={() => setPage('play')}
      onClearSavedGame={game.clearSavedGame}
    />
  )
}
