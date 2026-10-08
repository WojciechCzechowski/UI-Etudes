// Pure logic for the grid: no DOM, no React. Coordinates are in the padding box
// of the grid list, the same space as `offsetLeft` and `offsetTop` of its items.

export type Point = { x: number; y: number }

export type Geometry = {
  /** Where slot 0 starts: the padding of the list. */
  left: number
  top: number
  columns: number
  count: number
  cellWidth: number
  cellHeight: number
  gapX: number
  gapY: number
}

/** Pointer movement before a press becomes a drag, in px. */
export const DRAG_THRESHOLD = 4

/** Extra distance a slot must win by before the dragged tile switches slots. */
export const SLOT_HYSTERESIS = 8

/** Distance from the scroller edge where auto-scroll starts, in px. */
export const AUTO_SCROLL_ZONE = 64

/** Auto-scroll speed at the edge of the scroller, in px per second. */
export const AUTO_SCROLL_MAX_SPEED = 720

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function moveItem<T>(items: readonly T[], from: number, to: number) {
  const next = [...items]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

export type Direction = 'left' | 'right' | 'up' | 'down' | 'start' | 'end'

/**
 * The index a keyboard step leads to. Left and right follow reading order, so
 * they wrap across rows. Up and down keep the column; down from the row above
 * a shorter last row lands on the last item. Steps past an edge stay put.
 */
export function nextIndex(
  index: number,
  direction: Direction,
  columns: number,
  count: number,
): number {
  const last = count - 1
  switch (direction) {
    case 'left':
      return Math.max(index - 1, 0)
    case 'right':
      return Math.min(index + 1, last)
    case 'up':
      return index - columns >= 0 ? index - columns : index
    case 'down': {
      if (index + columns <= last) return index + columns
      const inLastRow =
        Math.floor(index / columns) === Math.floor(last / columns)
      return inLastRow ? index : last
    }
    case 'start':
      return 0
    case 'end':
      return last
  }
}

export function rowAndColumn(index: number, columns: number) {
  return { row: Math.floor(index / columns) + 1, column: (index % columns) + 1 }
}

/** Top left corner of a slot. */
export function slotOrigin(index: number, g: Geometry): Point {
  return {
    x: g.left + (index % g.columns) * (g.cellWidth + g.gapX),
    y: g.top + Math.floor(index / g.columns) * (g.cellHeight + g.gapY),
  }
}

function distanceToSlotCenter(point: Point, index: number, g: Geometry) {
  const origin = slotOrigin(index, g)
  return Math.hypot(
    point.x - (origin.x + g.cellWidth / 2),
    point.y - (origin.y + g.cellHeight / 2),
  )
}

/**
 * The slot whose center is nearest to the point. The tile only leaves
 * `current` when the new slot is closer by more than `hysteresis`, so a pointer
 * resting on the border between two slots does not make them swap back and
 * forth.
 */
export function slotAtPoint(
  point: Point,
  g: Geometry,
  current: number,
  hysteresis = 0,
): number {
  const rows = Math.ceil(g.count / g.columns)
  const column = Math.round(
    (point.x - g.left - g.cellWidth / 2) / (g.cellWidth + g.gapX),
  )
  const row = Math.round(
    (point.y - g.top - g.cellHeight / 2) / (g.cellHeight + g.gapY),
  )
  const candidate = Math.min(
    Math.min(Math.max(row, 0), rows - 1) * g.columns +
      Math.min(Math.max(column, 0), g.columns - 1),
    g.count - 1,
  )
  if (candidate === current) return current
  const gain =
    distanceToSlotCenter(point, current, g) -
    distanceToSlotCenter(point, candidate, g)
  return gain > hysteresis ? candidate : current
}

/**
 * Scroll speed in px per second, negative is up. Zero outside the edge zones,
 * ramping linearly to `maxSpeed` at the edge and staying there beyond it. The
 * zone shrinks on a short scroller so the two zones never overlap.
 */
export function autoScrollVelocity(
  pointerY: number,
  top: number,
  bottom: number,
  zone = AUTO_SCROLL_ZONE,
  maxSpeed = AUTO_SCROLL_MAX_SPEED,
): number {
  const size = Math.min(zone, (bottom - top) / 3)
  if (size <= 0) return 0
  if (pointerY < top + size) {
    return -maxSpeed * Math.min((top + size - pointerY) / size, 1)
  }
  if (pointerY > bottom - size) {
    return maxSpeed * Math.min((pointerY - (bottom - size)) / size, 1)
  }
  return 0
}

/** The smallest scroll that brings an item fully into view, with a margin. */
export function scrollTopToReveal(
  itemTop: number,
  itemHeight: number,
  scrollTop: number,
  viewportHeight: number,
  margin = 8,
): number {
  if (itemTop - margin < scrollTop) return Math.max(itemTop - margin, 0)
  const itemBottom = itemTop + itemHeight + margin
  if (itemBottom > scrollTop + viewportHeight) {
    return itemBottom - viewportHeight
  }
  return scrollTop
}
