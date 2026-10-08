import type { Transition } from 'motion/react'

// Motion values specific to this study. The reasoning for each is in README.md.

// Tiles making room for the dragged tile, the dragged tile settling into its
// slot after a drop, and the drop marker moving between slots. Same spring as
// the surface in study 01. Duration-based, so slow motion is a multiplier.
export const settleSpring: Transition = {
  type: 'spring',
  duration: 0.4,
  bounce: 0,
}

// Layout changes that must not animate: the dragged tile while the pointer
// owns its position.
export const instant: Transition = { duration: 0 }

// A thumbnail replacing its skeleton.
export const imageFade: Transition = { duration: 0.3, ease: 'easeOut' }

// The lift shadow on the dragged tile and the drop marker appearing.
export const liftFade: Transition = { duration: 0.15, ease: 'easeOut' }
