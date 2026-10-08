import { describe, expect, it } from 'vitest'
import {
  autoScrollVelocity,
  clamp,
  moveItem,
  nextIndex,
  rowAndColumn,
  scrollTopToReveal,
  slotAtPoint,
  slotOrigin,
} from './reorder'
import type { Geometry } from './reorder'

// Three columns of 100x80 cells, 10px gaps, 12px padding, seven items:
// two full rows and one item in the last row.
const g: Geometry = {
  left: 12,
  top: 12,
  columns: 3,
  count: 7,
  cellWidth: 100,
  cellHeight: 80,
  gapX: 10,
  gapY: 10,
}

describe('clamp', () => {
  it('keeps a value inside the range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-3, 0, 10)).toBe(0)
    expect(clamp(14, 0, 10)).toBe(10)
  })
})

describe('moveItem', () => {
  it('moves an item forward and back without touching the input', () => {
    const items = ['a', 'b', 'c', 'd']
    expect(moveItem(items, 0, 2)).toEqual(['b', 'c', 'a', 'd'])
    expect(moveItem(items, 3, 1)).toEqual(['a', 'd', 'b', 'c'])
    expect(items).toEqual(['a', 'b', 'c', 'd'])
  })
})

describe('nextIndex', () => {
  it('moves one step left and right and stops at the ends', () => {
    expect(nextIndex(3, 'left', 3, 7)).toBe(2)
    expect(nextIndex(3, 'right', 3, 7)).toBe(4)
    expect(nextIndex(0, 'left', 3, 7)).toBe(0)
    expect(nextIndex(6, 'right', 3, 7)).toBe(6)
  })

  it('wraps left and right across rows', () => {
    expect(nextIndex(2, 'right', 3, 7)).toBe(3)
    expect(nextIndex(3, 'left', 3, 7)).toBe(2)
  })

  it('moves up and down by one row', () => {
    expect(nextIndex(4, 'up', 3, 7)).toBe(1)
    expect(nextIndex(1, 'down', 3, 7)).toBe(4)
  })

  it('stays in the first row when moving up', () => {
    expect(nextIndex(1, 'up', 3, 7)).toBe(1)
  })

  it('goes to the last item when moving down into a shorter last row', () => {
    expect(nextIndex(4, 'down', 3, 7)).toBe(6)
    expect(nextIndex(5, 'down', 3, 7)).toBe(6)
  })

  it('stays put when moving down in the last row', () => {
    expect(nextIndex(6, 'down', 3, 7)).toBe(6)
  })

  it('goes to the start and the end', () => {
    expect(nextIndex(4, 'start', 3, 7)).toBe(0)
    expect(nextIndex(4, 'end', 3, 7)).toBe(6)
  })
})

describe('rowAndColumn', () => {
  it('counts from 1', () => {
    expect(rowAndColumn(0, 3)).toEqual({ row: 1, column: 1 })
    expect(rowAndColumn(4, 3)).toEqual({ row: 2, column: 2 })
    expect(rowAndColumn(6, 3)).toEqual({ row: 3, column: 1 })
  })
})

describe('slotOrigin', () => {
  it('includes the padding and the gaps', () => {
    expect(slotOrigin(0, g)).toEqual({ x: 12, y: 12 })
    expect(slotOrigin(4, g)).toEqual({ x: 122, y: 102 })
  })
})

describe('slotAtPoint', () => {
  it('returns the slot under the point', () => {
    expect(slotAtPoint({ x: 60, y: 50 }, g, 0)).toBe(0)
    expect(slotAtPoint({ x: 170, y: 140 }, g, 0)).toBe(4)
  })

  it('clamps points outside the grid to the nearest slot', () => {
    expect(slotAtPoint({ x: -50, y: -50 }, g, 3)).toBe(0)
    expect(slotAtPoint({ x: 900, y: 40 }, g, 0)).toBe(2)
    expect(slotAtPoint({ x: 900, y: 900 }, g, 0)).toBe(6)
  })

  it('never returns a slot past the last item', () => {
    // Row 3, column 3 does not exist: only one item is in the last row.
    expect(slotAtPoint({ x: 280, y: 200 }, g, 0)).toBe(6)
  })

  it('keeps the current slot until the new one wins by the hysteresis', () => {
    // Slot 0 has its center at x = 62 and slot 1 at x = 172, so x = 117 is
    // the midpoint. The new slot is closer by 2 * (x - 117).
    expect(slotAtPoint({ x: 118, y: 52 }, g, 0, 20)).toBe(0)
    expect(slotAtPoint({ x: 125, y: 52 }, g, 0, 20)).toBe(0)
    expect(slotAtPoint({ x: 130, y: 52 }, g, 0, 20)).toBe(1)
  })
})

describe('autoScrollVelocity', () => {
  it('is zero away from the edges', () => {
    expect(autoScrollVelocity(200, 0, 400, 64, 600)).toBe(0)
  })

  it('ramps up towards the edge and keeps the sign', () => {
    expect(autoScrollVelocity(32, 0, 400, 64, 600)).toBe(-300)
    expect(autoScrollVelocity(0, 0, 400, 64, 600)).toBe(-600)
    expect(autoScrollVelocity(368, 0, 400, 64, 600)).toBe(300)
    expect(autoScrollVelocity(400, 0, 400, 64, 600)).toBe(600)
  })

  it('stays at the top speed beyond the edge', () => {
    expect(autoScrollVelocity(-100, 0, 400, 64, 600)).toBe(-600)
    expect(autoScrollVelocity(500, 0, 400, 64, 600)).toBe(600)
  })

  it('shrinks the zones on a short scroller', () => {
    expect(autoScrollVelocity(60, 0, 120, 64, 600)).toBe(0)
  })
})

describe('scrollTopToReveal', () => {
  it('keeps the scroll position when the item is visible', () => {
    expect(scrollTopToReveal(120, 80, 100, 300, 8)).toBe(100)
  })

  it('scrolls up to an item above the view', () => {
    expect(scrollTopToReveal(40, 80, 100, 300, 8)).toBe(32)
  })

  it('scrolls down to an item below the view', () => {
    expect(scrollTopToReveal(380, 80, 100, 300, 8)).toBe(168)
  })

  it('never scrolls above the top', () => {
    expect(scrollTopToReveal(4, 80, 100, 300, 8)).toBe(0)
  })
})
