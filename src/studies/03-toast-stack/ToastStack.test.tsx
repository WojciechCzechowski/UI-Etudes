import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { DemoSettingsProvider } from '../../shared/demo-controls/DemoSettings'
import { createToastStore, SUMMARY_WINDOW_MS } from './toastStore'
import type { ToastInput } from './toastStore'
import { ToastViewport } from './ToastViewport'

// Reduced motion keeps the tests independent of the spring, which jsdom
// cannot measure. Timers, announcements and focus work the same in both modes.
function setup() {
  const user = userEvent.setup()
  const store = createToastStore()
  render(
    <DemoSettingsProvider initial={{ reducedMotion: 'on' }}>
      <button type="button">Before</button>
      <ToastViewport store={store} />
    </DemoSettingsProvider>,
  )
  const show = (input: ToastInput) => act(() => store.show(input))
  return { user, store, show }
}

const saved: ToastInput = { kind: 'success', title: 'Draft saved' }
const copied: ToastInput = { kind: 'info', title: 'Link copied' }
const failed: ToastInput = {
  kind: 'error',
  title: 'Upload failed',
  description: 'report-q3.pdf is larger than 25 MB.',
}

// The count is said when its window ends. These tests use real timers.
const waitForSummary = SUMMARY_WINDOW_MS + 1500

function items() {
  return screen.queryAllByRole('listitem')
}

// jsdom has no pointer capture. Radix calls it when a press on a toast ends.
beforeAll(() => {
  Element.prototype.hasPointerCapture ??= () => false
  Element.prototype.setPointerCapture ??= () => {}
  Element.prototype.releasePointerCapture ??= () => {}
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('ToastViewport', () => {
  it('does not move the focus when a toast appears', async () => {
    const { show } = setup()
    const before = screen.getByRole('button', { name: 'Before' })
    before.focus()

    show(saved)
    await screen.findByRole('listitem')

    expect(before).toHaveFocus()
  })

  it('says an error in full and counts information', async () => {
    const { show } = setup()

    show(saved)
    show(copied)
    show(failed)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Upload failed. report-q3.pdf is larger than 25 MB.',
      )
    })
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    await waitFor(
      () =>
        expect(screen.getByRole('status')).toHaveTextContent(
          '2 new notifications',
        ),
      {
        timeout: waitForSummary,
      },
    )
    expect(screen.getByRole('status')).toHaveTextContent('2 new notifications')
    expect(screen.getByRole('status')).not.toHaveTextContent('Draft saved')
    expect(items()).toHaveLength(3)
  })

  it('counts an upload that succeeds, in the same toast', async () => {
    const { store, show } = setup()
    show({ kind: 'progress', title: 'Uploading 3 files…', progress: 0.2 })
    const id = store.getState().active[0].id
    await screen.findByRole('listitem')

    act(() => store.update(id, { progress: 0.6 }))
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    act(() => store.update(id, { kind: 'success', title: '3 files uploaded' }))

    await within(items()[0]).findByText('3 files uploaded')
    await waitFor(
      () =>
        expect(screen.getByRole('status')).toHaveTextContent(
          '1 new notification',
        ),
      {
        timeout: waitForSummary,
      },
    )
    expect(screen.getByRole('status')).toHaveTextContent('1 new notification')
    expect(items()).toHaveLength(1)
  })

  it('says an upload that fails, in the same toast', async () => {
    const { store, show } = setup()
    show({ kind: 'progress', title: 'Uploading 3 files…', progress: 0.2 })
    const id = store.getState().active[0].id
    await screen.findByRole('listitem')

    act(() => store.update(id, { kind: 'error', title: 'Upload failed' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Upload failed.')
    })
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(items()).toHaveLength(1)
  })

  it('names the close button after its toast and dismisses on click', async () => {
    const { user, show } = setup()
    show(saved)

    await user.click(
      await screen.findByRole('button', { name: 'Dismiss: Draft saved' }),
    )

    await waitFor(() => expect(items()).toHaveLength(0))
  })

  it('moves the focus to the viewport on F8', async () => {
    const { show } = setup()
    show(saved)
    await screen.findByRole('listitem')

    fireEvent.keyDown(document, { key: 'F8', code: 'F8' })

    expect(screen.getByRole('list')).toHaveFocus()
  })

  it('dismisses the focused toast on Escape and focuses the next one', async () => {
    const { user, show } = setup()
    show(saved)
    show(copied)
    await waitFor(() => expect(items()).toHaveLength(2))
    const [older, newer] = items()
    act(() => newer.focus())

    await user.keyboard('{Escape}')

    await waitFor(() => expect(items()).toHaveLength(1))
    expect(older).toHaveFocus()
  })

  it('gives the focus back to where it was when the last toast goes', async () => {
    const { user, show } = setup()
    const before = screen.getByRole('button', { name: 'Before' })
    show(saved)
    const toast = await screen.findByRole('listitem')
    before.focus()
    fireEvent.keyDown(document, { key: 'F8', code: 'F8' })
    act(() => toast.focus())

    await user.keyboard('{Escape}')

    await waitFor(() => expect(items()).toHaveLength(0))
    expect(before).toHaveFocus()
  })

  it('leaves the toasts alone when Escape is pressed outside them', async () => {
    const { user, show } = setup()
    show(saved)
    await screen.findByRole('listitem')
    screen.getByRole('button', { name: 'Before' }).focus()

    await user.keyboard('{Escape}')

    expect(items()).toHaveLength(1)
  })

  it('stops the timer while the pointer is over the stack', () => {
    // user-event cannot run on vitest's fake timers, so the pointer events are
    // dispatched by hand. The viewport listens for the native ones.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    const store = createToastStore()
    render(
      <DemoSettingsProvider initial={{ reducedMotion: 'on' }}>
        <ToastViewport store={store} />
      </DemoSettingsProvider>,
    )
    act(() => void store.show(saved))
    const list = screen.getByRole('list')

    act(() => void vi.advanceTimersByTime(3000))
    fireEvent(list, new Event('pointerenter'))
    act(() => void vi.advanceTimersByTime(60_000))
    expect(store.getState().active).toHaveLength(1)

    fireEvent(list, new Event('pointerleave'))
    act(() => void vi.advanceTimersByTime(1999))
    expect(store.getState().active).toHaveLength(1)
    act(() => void vi.advanceTimersByTime(1))
    expect(store.getState().active).toHaveLength(0)
  })

  it('stops the timer while a toast has the keyboard focus', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    // jsdom never matches :focus-visible, so every focus counts as a keyboard
    // focus here. The browser decides in real life.
    const matches = Element.prototype.matches
    vi.spyOn(Element.prototype, 'matches').mockImplementation(function (
      this: Element,
      selector: string,
    ) {
      return selector === ':focus-visible' || matches.call(this, selector)
    })
    const store = createToastStore()
    render(
      <DemoSettingsProvider initial={{ reducedMotion: 'on' }}>
        <ToastViewport store={store} />
      </DemoSettingsProvider>,
    )
    act(() => void store.show(saved))
    const toast = screen.getByRole('listitem')

    act(() => toast.focus())
    act(() => void vi.advanceTimersByTime(60_000))
    expect(store.getState().active).toHaveLength(1)

    act(() => toast.blur())
    act(() => void vi.advanceTimersByTime(5000))
    expect(store.getState().active).toHaveLength(0)
  })

  it('leaves the announcing to the live regions, not to Radix', async () => {
    const { show } = setup()

    show(saved)

    await waitFor(
      () =>
        expect(screen.getByRole('status')).toHaveTextContent(
          '1 new notification',
        ),
      {
        timeout: waitForSummary,
      },
    )
    expect(screen.getByRole('status')).toHaveTextContent('1 new notification')
    // Only the study's own region is exposed. Radix's goes to a hidden node.
    expect(screen.getAllByRole('status')).toHaveLength(1)
  })

  it('shows how many toasts are waiting', async () => {
    const { show } = setup()
    for (const title of ['a', 'b', 'c', 'd', 'e']) {
      show({ kind: 'info', title })
    }

    expect(await screen.findByText('2 more waiting')).toBeInTheDocument()
    expect(items()).toHaveLength(3)
  })
})
