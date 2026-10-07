import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DemoSettingsProvider } from '../../shared/demo-controls/DemoSettings'
import { App } from './App'

function setup() {
  const user = userEvent.setup()
  render(
    <DemoSettingsProvider initial={{ reducedMotion: 'on' }}>
      <App />
    </DemoSettingsProvider>,
  )
  return user
}

describe('App demo controls', () => {
  it('adds a Sending section and lists its tweaks next to the gear', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Demo settings' }))

    const sending = screen.getByRole('group', { name: 'Sending' })
    await user.click(within(sending).getByLabelText('Make sending fail'))
    await user.click(within(sending).getByRole('radio', { name: '3000 ms' }))

    expect(
      screen.getByRole('button', { name: 'Demo settings' }),
    ).toHaveAccessibleDescription(
      'Reduced motion · Sending fails · Pending 3000 ms',
    )
  })

  it('makes sending fail when the setting is on', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Demo settings' }))
    const sending = screen.getByRole('group', { name: 'Sending' })
    await user.click(within(sending).getByLabelText('Make sending fail'))
    await user.click(within(sending).getByRole('radio', { name: '400 ms' }))
    await user.keyboard('{Escape}')

    await user.click(screen.getByRole('button', { name: 'Send feedback' }))
    await user.type(await screen.findByLabelText('Your message'), 'Hello')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not send your message. Try again.',
    )
  })
})
