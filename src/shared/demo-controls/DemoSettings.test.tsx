import { render, renderHook, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { DemoControls } from './DemoControls'
import { DemoSettingsProvider, useScaleTransition } from './DemoSettings'
import type { DemoSettings } from './DemoSettings'

function wrapper(initial: Partial<DemoSettings>) {
  return ({ children }: { children: ReactNode }) => (
    <DemoSettingsProvider initial={initial}>{children}</DemoSettingsProvider>
  )
}

describe('slow motion', () => {
  it('scales durations and delays', () => {
    const { result } = renderHook(useScaleTransition, {
      wrapper: wrapper({ slowMotion: 4 }),
    })
    expect(result.current({ duration: 0.1, delay: 0.2 })).toEqual({
      duration: 0.4,
      delay: 0.8,
    })
  })

  it('never applies when reduced motion is previewed', () => {
    const { result } = renderHook(useScaleTransition, {
      wrapper: wrapper({ slowMotion: 10, reducedMotion: 'on' }),
    })
    expect(result.current({ duration: 0.15 })).toEqual({ duration: 0.15 })
  })
})

describe('DemoControls', () => {
  it('shows nothing next to the button with default settings', () => {
    render(
      <DemoSettingsProvider>
        <DemoControls />
      </DemoSettingsProvider>,
    )
    const button = screen.getByRole('button', { name: 'Demo settings' })
    expect(button).not.toHaveAccessibleDescription()
  })

  it('lists every tweaked setting next to the button', () => {
    render(
      <DemoSettingsProvider
        initial={{ forceError: true, pendingMs: 3000, slowMotion: 4 }}
      >
        <DemoControls />
      </DemoSettingsProvider>,
    )
    const button = screen.getByRole('button', { name: 'Demo settings' })
    expect(button).toHaveAccessibleDescription(
      'Error on · Pending 3000 ms · Slow 4x',
    )
  })
})
