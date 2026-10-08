import { describe, expect, it } from 'vitest'
import { GAP, PEEK } from './motion'
import { stackLayout } from './stackLayout'

// Heights include the gap, so a card with a 60px surface measures 72.
const heights = { a: 72, b: 92, c: 72 }

describe('stackLayout', () => {
  it('has nothing to place when there are no cards', () => {
    expect(stackLayout([], {}, false)).toEqual({ targets: {}, height: 0 })
  })

  it('keeps the newest card in place and shows only its content', () => {
    const { targets } = stackLayout(['a', 'b', 'c'], heights, false)

    expect(targets.c).toEqual({ y: 0, scaleX: 1, scaleY: 1, showContent: true })
    expect(targets.b.showContent).toBe(false)
    expect(targets.a.showContent).toBe(false)
  })

  it('makes each card behind narrower than the one in front of it', () => {
    const { targets } = stackLayout(['a', 'b', 'c'], heights, false)

    expect(targets.b.scaleX).toBeLessThan(1)
    expect(targets.a.scaleX).toBeLessThan(targets.b.scaleX)
  })

  it('shows a fixed strip of every card behind, whatever its own height', () => {
    const { targets } = stackLayout(['a', 'b', 'c'], heights, false)
    const front = heights.c - GAP

    // b has a 80px surface, a has a 60px surface.
    expect((heights.b - GAP) * targets.b.scaleY).toBeCloseTo(front + PEEK)
    expect((heights.a - GAP) * targets.a.scaleY).toBeCloseTo(front + 2 * PEEK)
  })

  it('measures the collapsed pile from the front card and the peeks', () => {
    const { height } = stackLayout(['a', 'b', 'c'], heights, false)

    expect(height).toBe(heights.c - GAP + 2 * PEEK)
  })

  it('stacks full size cards on top of each other when expanded', () => {
    const { targets, height } = stackLayout(['a', 'b', 'c'], heights, true)

    expect(targets.c).toMatchObject({ y: 0, scaleX: 1, scaleY: 1 })
    expect(targets.b.y).toBe(-heights.c)
    expect(targets.a.y).toBe(-(heights.c + heights.b))
    expect(Object.values(targets).every(({ showContent }) => showContent)).toBe(
      true,
    )
    // The top card has no gap above it.
    expect(height).toBe(heights.a + heights.b + heights.c - GAP)
  })

  it('uses a default height for a card that is not measured yet', () => {
    const { targets } = stackLayout(['a', 'b'], {}, true)

    expect(targets.a.y).toBeLessThan(0)
  })
})
