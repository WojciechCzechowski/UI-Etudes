import type { Transition, Variants } from 'motion/react'

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

// Page entrance, shared by the hub and every study: the title and the content
// rise into place one after another. Plays once on load, so there is nothing
// to interrupt.
const rise = {
  distance: 12,
  duration: 0.45,
  stagger: 0.06,
  // Fast start, long settle.
  ease: [0.22, 1, 0.36, 1],
} as const

const riseTransition: Transition = { duration: rise.duration, ease: rise.ease }

type Entrance = {
  container: Variants
  /** For content that travels while it fades in. */
  item: Variants
  /**
   * For position: fixed controls. A transform on an ancestor would make them
   * position against it instead of the viewport, so they only fade.
   */
  fade: Variants
}

/** Reduced motion: no travel and no stagger, everything fades in together. */
export function entrance(reduceMotion: boolean): Entrance {
  const fade: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: reduceMotion ? crossfade : riseTransition,
    },
  }
  if (reduceMotion) {
    return { container: { hidden: {}, show: {} }, item: fade, fade }
  }
  return {
    container: {
      hidden: {},
      show: { transition: { staggerChildren: rise.stagger } },
    },
    item: {
      hidden: { opacity: 0, y: rise.distance },
      show: { opacity: 1, y: 0, transition: riseTransition },
    },
    fade,
  }
}
