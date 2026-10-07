import type { Transition } from 'motion/react'

// Motion values shared by every study. Only generic values live here. Values
// that belong to one interaction live in that study's own motion.ts.

// Plain fades. A study adds its own delay when it needs one.
export const fadeIn: Transition = { duration: 0.15, ease: 'easeOut' }
export const fadeOut: Transition = { duration: 0.1, ease: 'easeIn' }

// Replaces the morph when reduced motion is on.
export const crossfade: Transition = { duration: 0.15, ease: 'easeOut' }

// Multiplies the time based parts of a transition. Used by slow motion.
export function scaleTransition(
  transition: Transition,
  factor: number,
): Transition {
  if (factor === 1) return transition
  const scaled = { ...transition } as Record<string, unknown>
  if (typeof scaled.duration === 'number') scaled.duration *= factor
  if (typeof scaled.delay === 'number') scaled.delay *= factor
  return scaled as Transition
}
