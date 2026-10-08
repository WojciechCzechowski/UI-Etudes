import { GAP, PEEK, SCALE_STEP } from './motion'

// Where each card sits. Cards are stacked from the bottom edge of the
// viewport, newest in front. Every value is a transform, so nothing in the
// page moves.

export type SlotTarget = {
  y: number
  scaleX: number
  scaleY: number
  /** False for the cards behind the front one while the pile is collapsed. */
  showContent: boolean
}

export type StackLayout = {
  targets: Record<string, SlotTarget>
  /** Distance from the bottom edge to the top of the stack, in px. */
  height: number
}

/** Used until a card has been measured. */
export const DEFAULT_HEIGHT = 72

/**
 * @param ids Card ids, oldest first.
 * @param heights Measured height of each card's list item, with its gap.
 * @param expanded Every card at full size, or a compact pile.
 */
export function stackLayout(
  ids: string[],
  heights: Record<string, number>,
  expanded: boolean,
): StackLayout {
  const targets: Record<string, SlotTarget> = {}
  if (ids.length === 0) return { targets, height: 0 }

  const heightOf = (id: string) => heights[id] || DEFAULT_HEIGHT
  const surfaceOf = (id: string) => heightOf(id) - GAP
  const newestFirst = [...ids].reverse()
  const front = newestFirst[0]

  let below = 0
  newestFirst.forEach((id, depth) => {
    if (expanded) {
      targets[id] = {
        y: below === 0 ? 0 : -below,
        scaleX: 1,
        scaleY: 1,
        showContent: true,
      }
      below += heightOf(id)
      return
    }
    if (depth === 0) {
      targets[id] = { y: 0, scaleX: 1, scaleY: 1, showContent: true }
      return
    }
    // A card behind is stretched so its top edge shows `PEEK` px above the
    // card in front of it, whatever its own height. Its content is hidden, so
    // the stretch is not visible in the text.
    targets[id] = {
      y: 0,
      scaleX: 1 - depth * SCALE_STEP,
      scaleY: (surfaceOf(front) + depth * PEEK) / surfaceOf(id),
      showContent: false,
    }
  })

  const height = expanded
    ? below - GAP
    : surfaceOf(front) + (ids.length - 1) * PEEK
  return { targets, height }
}
