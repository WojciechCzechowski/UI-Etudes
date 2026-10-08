import type { Transition } from 'motion/react'

// Motion values specific to this study. The reasoning for each is in README.md.

// Position, scale, enter and exit of the cards. Duration-based, so slow motion
// is a multiplier on `duration`. The same spring as studies 01 and 02.
export const stackSpring: Transition = {
  type: 'spring',
  duration: 0.4,
  bounce: 0,
}
// Alternatives to try:
// Snappy: { type: 'spring', duration: 0.3, bounce: 0 }
// Lively: { type: 'spring', duration: 0.35, bounce: 0.15 }

// Space between two cards when the stack is expanded, in px. It is padding on
// the card's list item, so the pointer never crosses a dead gap while the
// stack is under it.
export const GAP = 12

// How far the card behind peeks out above the one in front, per level.
export const PEEK = 10

// How much narrower each level behind the front card is.
export const SCALE_STEP = 0.05

// A new card rises this far into its place. A removed card sinks this far.
export const ENTER_OFFSET = 16
export const EXIT_OFFSET = 8

// Swipe: the card fades to `SWIPE_MIN_OPACITY` over `SWIPE_FADE_DISTANCE` px,
// and leaves to `SWIPE_EXIT_X` px when the swipe is completed.
export const SWIPE_FADE_DISTANCE = 160
export const SWIPE_MIN_OPACITY = 0.4
export const SWIPE_EXIT_X = 400

// The content of the cards behind the front card, and the progress bar.
export const contentFade: Transition = { duration: 0.15, ease: 'easeOut' }
export const progressStep: Transition = { duration: 0.12, ease: 'linear' }
