import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DemoSettingsProvider } from '../../shared/demo-controls/DemoSettings'
import { DuplicateFolderError } from './folders'
import type { CreateFolder } from './folders'
import { MorphingDialog } from './MorphingDialog'

// Reduced motion keeps the tests independent of the layout morph, which
// jsdom cannot measure. The open and close logic is the same in both modes.
function setup(createFolder: CreateFolder = () => Promise.resolve()) {
  const onCreated = vi.fn<(name: string) => void>()
  const user = userEvent.setup()
  render(
    <DemoSettingsProvider initial={{ reducedMotion: 'on' }}>
      <MorphingDialog createFolder={createFolder} onCreated={onCreated} />
    </DemoSettingsProvider>,
  )
  const button = screen.getByRole('button', { name: 'New folder' })
  return { user, button, onCreated }
}

async function openAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  button: HTMLElement,
  name: string,
) {
  await user.click(button)
  await user.type(await screen.findByLabelText('Folder name'), name)
  await user.click(screen.getByRole('button', { name: 'Create' }))
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

  it('announces the validation error', async () => {
    const { user, button } = setup(() =>
      Promise.reject(new DuplicateFolderError('Invoices')),
    )

    await openAndSubmit(user, button, 'Invoices')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'A folder named "Invoices" already exists here. Choose a different name.',
    )
    expect(screen.getByLabelText('Folder name')).toBeInvalid()
  })

  it('disables Create while pending', async () => {
    const createFolder = vi.fn<CreateFolder>(() => new Promise(() => {}))
    const { user, button } = setup(createFolder)

    await openAndSubmit(user, button, 'Receipts 2026')

    const create = await screen.findByRole('button', { name: 'Creating...' })
    expect(create).toHaveAttribute('aria-disabled', 'true')

    await user.click(create)
    expect(createFolder).toHaveBeenCalledTimes(1)
  })

  it('aborts a pending create when the dialog closes', async () => {
    let signal: AbortSignal | undefined
    const { user, button, onCreated } = setup((_name, options) => {
      signal = options.signal
      return new Promise((_resolve, reject) => {
        options.signal.addEventListener('abort', () =>
          reject(options.signal.reason),
        )
      })
    })

    await openAndSubmit(user, button, 'Receipts 2026')
    await screen.findByRole('button', { name: 'Creating...' })
    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(signal?.aborted).toBe(true)
    expect(onCreated).not.toHaveBeenCalled()
  })
})
