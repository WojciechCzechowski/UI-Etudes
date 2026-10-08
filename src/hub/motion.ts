import type { Transition, Variants } from 'motion/react'
import { crossfade } from '../shared/motion'

// The hub page entrance: title, intro, label, rows and footer rise into place
// one after another. Plays once on load, so there is nothing to interrupt.
const rise = {
  distance: 12,
  duration: 0.45,
  stagger: 0.06,
  // Fast start, long settle.
  ease: [0.22, 1, 0.36, 1],
} as const

const riseTransition: Transition = { duration: rise.duration, ease: rise.ease }

type Entrance = { container: Variants; item: Variants }

/** Reduced motion: no travel and no stagger, everything fades in together. */
export function entrance(reduceMotion: boolean): Entrance {
  if (reduceMotion) {
    return {
      container: { hidden: {}, show: {} },
      item: {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: crossfade },
      },
    }
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
  }
}
