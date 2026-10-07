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

export const defaultSettings: DemoSettings = {
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
    ...defaultSettings,
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

/**
 * Returns a function that applies the slow motion factor to a transition.
 * Slow motion never applies when motion is reduced: that version of the
 * interaction always runs at its designed speed.
 */
export function useScaleTransition(): (transition: Transition) => Transition {
  const { settings } = useDemoSettings()
  const reduceMotion = useReduceMotion()
  const factor = reduceMotion ? 1 : settings.slowMotion
  return (transition) => scaleTransition(transition, factor)
}

/** Short labels for every setting that differs from its default. */
export function describeTweaks(settings: DemoSettings): string[] {
  const tweaks: string[] = []
  if (settings.forceError) tweaks.push('Error on')
  if (settings.pendingMs !== defaultSettings.pendingMs) {
    tweaks.push(`Pending ${settings.pendingMs} ms`)
  }
  if (settings.reducedMotion !== defaultSettings.reducedMotion) {
    tweaks.push('Reduced motion')
  }
  if (settings.slowMotion !== defaultSettings.slowMotion) {
    tweaks.push(`Slow ${settings.slowMotion}x`)
  }
  return tweaks
}
