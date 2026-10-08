import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DemoSettingsProvider } from '../../shared/demo-controls/DemoSettings'
import { photos } from './photos'
import { ReorderGrid } from './ReorderGrid'

// Seven photos in three columns: two full rows and one tile in the last row.
const seven = photos.slice(0, 7)

type Props = Partial<React.ComponentProps<typeof ReorderGrid>>

// Reduced motion keeps the tests independent of layout animations, which
// jsdom cannot measure. Pointer dragging needs real layout and pointer capture,
// so it is covered by the pure tests in reorder.test.ts and by hand.
function setup(props: Props = {}) {
  const user = userEvent.setup()
  render(
    <DemoSettingsProvider initial={{ reducedMotion: 'on' }}>
      <ReorderGrid
        initialPhotos={seven}
        loading="instant"
        failOne={false}
        reloadKey={0}
        columns={3}
        {...props}
      />
    </DemoSettingsProvider>,
  )
  return user
}

/** Titles in the order they are on the page. */
function order() {
  const list = screen.getByRole('list', { name: 'Photos' })
  return within(list)
    .getAllByRole('listitem')
    .map((item) => {
      const label = within(item).getByRole('button').getAttribute('aria-label')
      return label!.split(',')[0]
    })
}

function tile(title: string) {
  return screen.getByRole('button', { name: new RegExp(`^${title}`) })
}

const live = () => screen.getByRole('status')

afterEach(() => {
  vi.useRealTimers()
})

describe('ReorderGrid keyboard', () => {
  it('gives each tile its position in its name', () => {
    setup()
    expect(
      screen.getByRole('button', { name: 'Harbour at 6am, position 1 of 7' }),
    ).toBeInTheDocument()
  })

  it('has one tab stop, and the arrow keys move focus between tiles', async () => {
    const user = setup()
    await user.tab()
    expect(tile('Harbour at 6am')).toHaveFocus()

    await user.keyboard('{ArrowRight}{ArrowDown}')

    expect(tile('Night bakery')).toHaveFocus()
    expect(order()[0]).toBe('Harbour at 6am')
  })

  it('picks up with Space and announces it', async () => {
    const user = setup()
    await user.tab()
    await user.keyboard(' ')

    expect(tile('Harbour at 6am')).toHaveAttribute('aria-pressed', 'true')
    expect(live()).toHaveTextContent(
      'Picked up Harbour at 6am, position 1 of 7. Use the arrow keys to move it, Space or Enter to drop it, Escape to cancel.',
    )
  })

  it('moves right and announces the new position', async () => {
    const user = setup()
    await user.tab()
    await user.keyboard(' {ArrowRight}')

    expect(order().slice(0, 3)).toEqual([
      'Market stall',
      'Harbour at 6am',
      'Tram stop in the rain',
    ])
    expect(live()).toHaveTextContent(
      'Harbour at 6am moved to position 2 of 7, row 1, column 2.',
    )
  })

  it('moves down by one row and announces the row and column', async () => {
    const user = setup()
    await user.tab()
    await user.keyboard(' {ArrowDown}')

    expect(order()[3]).toBe('Harbour at 6am')
    expect(live()).toHaveTextContent(
      'Harbour at 6am moved to position 4 of 7, row 2, column 1.',
    )
  })

  it('keeps focus on the moved tile', async () => {
    const user = setup()
    await user.tab()
    await user.keyboard(' {ArrowRight}{ArrowRight}{ArrowDown}')

    expect(tile('Harbour at 6am')).toHaveFocus()
  })

  it('drops with Enter and announces it', async () => {
    const user = setup()
    await user.tab()
    await user.keyboard(' {ArrowRight}{Enter}')

    expect(tile('Harbour at 6am')).toHaveAttribute('aria-pressed', 'false')
    expect(live()).toHaveTextContent(
      'Harbour at 6am dropped at position 2 of 7.',
    )
    expect(order()[1]).toBe('Harbour at 6am')
  })

  it('restores the original order on Escape and announces it', async () => {
    const user = setup()
    await user.tab()
    await user.keyboard(' {ArrowRight}{ArrowDown}{Escape}')

    expect(order()[0]).toBe('Harbour at 6am')
    expect(live()).toHaveTextContent(
      'Move cancelled. Harbour at 6am is back at position 1 of 7.',
    )
    expect(tile('Harbour at 6am')).toHaveFocus()
  })

  it('does not move past the first or last tile', async () => {
    const user = setup()
    await user.tab()
    await user.keyboard(' {ArrowLeft}{ArrowUp}')

    expect(order()[0]).toBe('Harbour at 6am')
  })

  it('cancels the move when focus leaves the tile', async () => {
    const user = setup()
    await user.tab()
    await user.keyboard(' {ArrowRight}')
    await user.tab()

    await waitFor(() =>
      expect(live()).toHaveTextContent(
        'Move cancelled. Harbour at 6am is back at position 1 of 7.',
      ),
    )
    expect(order()[0]).toBe('Harbour at 6am')
  })
})

describe('ReorderGrid thumbnails', () => {
  it('shows a skeleton for every tile, then the images', () => {
    vi.useFakeTimers()
    setup({ loading: 'normal' })
    expect(screen.getAllByTestId('skeleton')).toHaveLength(7)

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.queryAllByTestId('skeleton')).toHaveLength(0)
  })

  it('shows an error on the tile that fails, and it is in the name', () => {
    setup({ failOne: true })
    expect(
      screen.getByRole('button', {
        name: 'Rooftop laundry, could not load, position 4 of 7',
      }),
    ).toBeInTheDocument()
  })
})
