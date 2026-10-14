import { render, renderHook, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { DemoControls, DemoSection } from './DemoControls'
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
      wrapper: wrapper({ slowMotion: 8, reducedMotion: 'on' }),
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
      <DemoSettingsProvider initial={{ reducedMotion: 'on', slowMotion: 4 }}>
        <DemoControls />
      </DemoSettingsProvider>,
    )
    const button = screen.getByRole('button', { name: 'Demo settings' })
    expect(button).toHaveAccessibleDescription('Reduced motion · 4x slower')
  })

  it('appends the tweaks of a study after the shared ones', () => {
    render(
      <DemoSettingsProvider initial={{ slowMotion: 2 }}>
        <DemoControls tweaks={['Sending fails']} />
      </DemoSettingsProvider>,
    )
    expect(
      screen.getByRole('button', { name: 'Demo settings' }),
    ).toHaveAccessibleDescription('2x slower · Sending fails')
  })
})

describe('theme', () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme
  })

  it('sits next to the settings button and is not in the panel', async () => {
    const user = userEvent.setup()
    localStorage.setItem('ui-etudes-theme', 'dark')
    render(
      <DemoSettingsProvider>
        <DemoControls />
      </DemoSettingsProvider>,
    )
    const group = screen.getByRole('radiogroup', { name: 'Theme' })
    expect(within(group).getByRole('radio', { name: 'Dark' })).toBeChecked()
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')

    await user.click(within(group).getByRole('radio', { name: 'Light' }))
    expect(localStorage.getItem('ui-etudes-theme')).toBe('light')
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')

    await user.click(screen.getByRole('button', { name: 'Demo settings' }))
    expect(screen.getAllByRole('radiogroup', { name: 'Theme' })).toHaveLength(1)
  })
})

describe('option groups', () => {
  it('pick slow motion with one click', async () => {
    const user = userEvent.setup()
    render(
      <DemoSettingsProvider>
        <DemoControls />
      </DemoSettingsProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Demo settings' }))

    const slow = screen.getByRole('radiogroup', { name: 'Slow down by' })
    await user.click(within(slow).getByRole('radio', { name: '4x' }))

    expect(
      screen.getByRole('button', { name: 'Demo settings' }),
    ).toHaveAccessibleDescription('4x slower')
  })

  it('disable slow motion while reduced motion is on', async () => {
    const user = userEvent.setup()
    render(
      <DemoSettingsProvider initial={{ reducedMotion: 'on' }}>
        <DemoControls />
      </DemoSettingsProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Demo settings' }))

    const slow = screen.getByRole('radiogroup', { name: 'Slow down by' })
    expect(within(slow).getByRole('radio', { name: '4x' })).toBeDisabled()
    expect(slow).toHaveAccessibleDescription(
      'Slow motion does not apply with reduced motion.',
    )
  })
})

describe('settings sections', () => {
  it('group shared settings first, then the sections of a study', async () => {
    const user = userEvent.setup()
    render(
      <DemoSettingsProvider>
        <DemoControls>
          <DemoSection legend="Study">Study settings</DemoSection>
        </DemoControls>
      </DemoSettingsProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Demo settings' }))

    const order = screen
      .getAllByRole('group')
      .map((group) => group.querySelector('legend')?.textContent)
    expect(order).toEqual(['Motion', 'Study'])
    expect(screen.getByRole('group', { name: 'Motion' })).toContainElement(
      screen.getByRole('radiogroup', { name: 'Slow down by' }),
    )
  })
})
