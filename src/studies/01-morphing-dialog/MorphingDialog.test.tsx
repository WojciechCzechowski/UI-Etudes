import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DemoSettingsProvider } from '../../shared/demo-controls/DemoSettings'
import { MorphingDialog } from './MorphingDialog'
import type { SendMessage } from './sendMessage'

// Reduced motion keeps the tests independent of the layout morph, which
// jsdom cannot measure. The open and close logic is the same in both modes.
function setup(sendMessage: SendMessage = () => Promise.resolve()) {
  const user = userEvent.setup()
  render(
    <DemoSettingsProvider initial={{ reducedMotion: 'on' }}>
      <MorphingDialog sendMessage={sendMessage} />
    </DemoSettingsProvider>,
  )
  const button = screen.getByRole('button', { name: 'Send feedback' })
  return { user, button }
}

async function openAndSend(
  user: ReturnType<typeof userEvent.setup>,
  button: HTMLElement,
  message: string,
) {
  await user.click(button)
  const field = await screen.findByLabelText('Your message')
  if (message) await user.type(field, message)
  await user.click(screen.getByRole('button', { name: 'Send' }))
}

describe('MorphingDialog', () => {
  it('closes on Escape', async () => {
    const { user, button } = setup()
    await user.click(button)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('returns focus to the button after closing', async () => {
    const { user, button } = setup()
    await user.click(button)
    await screen.findByRole('dialog')

    await user.keyboard('{Escape}')

    await waitFor(() => expect(button).toHaveFocus())
  })

  it('announces a failed send and keeps the message', async () => {
    const { user, button } = setup(() => Promise.reject(new Error('offline')))

    await openAndSend(user, button, 'The export button did nothing.')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not send your message. Try again.',
    )
    const field = screen.getByLabelText('Your message')
    expect(field).toBeInvalid()
    expect(field).toHaveValue('The export button did nothing.')
    expect(field).toHaveFocus()
  })

  it('announces an empty message without sending', async () => {
    const sendMessage = vi.fn<SendMessage>(() => Promise.resolve())
    const { user, button } = setup(sendMessage)

    await openAndSend(user, button, '')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Write a message first.',
    )
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('disables Send while pending', async () => {
    const sendMessage = vi.fn<SendMessage>(() => new Promise(() => {}))
    const { user, button } = setup(sendMessage)

    await openAndSend(user, button, 'Hello')

    const send = await screen.findByRole('button', { name: 'Sending...' })
    expect(send).toHaveAttribute('aria-disabled', 'true')

    await user.click(send)
    expect(sendMessage).toHaveBeenCalledTimes(1)
  })

  it('aborts a pending send when the dialog closes', async () => {
    let signal: AbortSignal | undefined
    const { user, button } = setup((_message, options) => {
      signal = options.signal
      return new Promise((_resolve, reject) => {
        options.signal.addEventListener('abort', () =>
          reject(options.signal.reason),
        )
      })
    })

    await openAndSend(user, button, 'Hello')
    await screen.findByRole('button', { name: 'Sending...' })
    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(signal?.aborted).toBe(true)
    expect(screen.queryByText('Message sent')).toBeNull()
  })

  it('closes and announces when the message is sent', async () => {
    const { user, button } = setup()

    await openAndSend(user, button, 'Thanks, the export works now.')

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(screen.getByText('Message sent')).toBeInTheDocument()
    await waitFor(() => expect(button).toHaveFocus())
  })
})
