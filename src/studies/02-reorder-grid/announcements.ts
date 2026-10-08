// Screen reader copy for the live region. One place, so the wording is easy to
// change. `position` is 1-based.

type Where = { title: string; position: number; count: number }

export const announcements = {
  pickedUp: ({ title, position, count }: Where) =>
    `Picked up ${title}, position ${position} of ${count}. Use the arrow keys to move it, Space or Enter to drop it, Escape to cancel.`,
  moved: ({ title, position, count }: Where, row: number, column: number) =>
    `${title} moved to position ${position} of ${count}, row ${row}, column ${column}.`,
  dropped: ({ title, position, count }: Where) =>
    `${title} dropped at position ${position} of ${count}.`,
  cancelled: ({ title, position, count }: Where) =>
    `Move cancelled. ${title} is back at position ${position} of ${count}.`,
}

/** Read with each tile through aria-describedby. */
export const instructions =
  'Press Space or Enter to pick up. Use the arrow keys to move, then Space or Enter to drop, or Escape to cancel.'
