import { MotionConfig, useReducedMotion } from 'motion/react'
import type { Transition } from 'motion/react'
import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { scaleTransition } from '../motion'

export type SlowMotion = 1 | 2 | 4 | 10

export type DemoSettings = {
  /** Makes Create fail with the duplicate name error. */
  forceError: boolean
  /** How long the pending state lasts, in milliseconds. */
  pendingMs: number
  /** `on` previews reduced motion without changing OS settings. */
  reducedMotion: 'system' | 'on'
  slowMotion: SlowMotion
}

const defaults: DemoSettings = {
  forceError: false,
  pendingMs: 1200,
  reducedMotion: 'system',
  slowMotion: 1,
}

type DemoSettingsContext = {
  settings: DemoSettings
  update: (patch: Partial<DemoSettings>) => void
}

const Context = createContext<DemoSettingsContext | null>(null)

type DemoSettingsProviderProps = {
  children: ReactNode
  initial?: Partial<DemoSettings>
}

export function DemoSettingsProvider({
  children,
  initial,
}: DemoSettingsProviderProps) {
  const [settings, setSettings] = useState<DemoSettings>({
    ...defaults,
    ...initial,
  })

  function update(patch: Partial<DemoSettings>) {
    setSettings((current) => ({ ...current, ...patch }))
  }

  return (
    <Context.Provider value={{ settings, update }}>
      <MotionConfig
        reducedMotion={settings.reducedMotion === 'on' ? 'always' : 'user'}
      >
        {children}
      </MotionConfig>
    </Context.Provider>
  )
}

export function useDemoSettings(): DemoSettingsContext {
  const context = useContext(Context)
  if (!context) {
    throw new Error('useDemoSettings must be used inside DemoSettingsProvider')
  }
  return context
}

/** True when the OS asks for reduced motion or the demo panel previews it. */
export function useReduceMotion(): boolean {
  const { settings } = useDemoSettings()
  const system = useReducedMotion()
  return settings.reducedMotion === 'on' || Boolean(system)
}

/** Returns a function that applies the slow motion factor to a transition. */
export function useScaleTransition(): (transition: Transition) => Transition {
  const { settings } = useDemoSettings()
  return (transition) => scaleTransition(transition, settings.slowMotion)
}
