import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { loadSettings, resetSettings, saveSettings } from './settingsStorage'
import type { AppSettings, SettingsStorage } from './types'

interface SettingsContextValue {
  readonly settings: AppSettings
  readonly updateSettings: (settings: AppSettings) => void
  readonly restoreDefaults: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

interface SettingsProviderProps {
  readonly children: ReactNode
  readonly storage?: SettingsStorage
  readonly initialSettings?: AppSettings
}

export function SettingsProvider({
  children,
  storage,
  initialSettings,
}: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(
    () => initialSettings ?? loadSettings(storage),
  )

  const updateSettings = useCallback(
    (next: AppSettings) => {
      saveSettings(next, storage)
      setSettings(next)
    },
    [storage],
  )

  const restoreDefaults = useCallback(() => {
    setSettings(resetSettings(storage))
  }, [storage])

  const value = useMemo(
    () => ({ settings, updateSettings, restoreDefaults }),
    [restoreDefaults, settings, updateSettings],
  )

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (!context)
    throw new Error('useSettings must be used within SettingsProvider')
  return context
}
