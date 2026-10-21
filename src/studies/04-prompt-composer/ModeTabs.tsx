import { AnimatePresence, motion } from 'motion/react'
import { Tabs } from 'radix-ui'
import { useLayoutEffect, useRef, useState } from 'react'
import { crossfade } from '../../shared/motion'
import {
  useReduceMotion,
  useScaleTransition,
} from '../../shared/demo-controls/DemoSettings'
import { modeOrder, modes } from './modes'
import type { Mode } from './modes'
import { tabPillSpring } from './motion'

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]'

const pillClass =
  'absolute left-0 rounded-xl bg-[var(--color-surface)] shadow-[0_1px_2px_rgb(0_0_0/0.1)]'

type Box = { x: number; width: number }

/**
 * The tab strip. The white pill is one element that moves to the active tab.
 * Its position is measured inside the strip, not on the page: the card around
 * the strip changes height between modes and moves the strip on screen, and a
 * page-based animation (Motion's layoutId) made the pill travel diagonally.
 */
export function ModeTabs({ activeMode }: { activeMode: Mode }) {
  const reduceMotion = useReduceMotion()
  const scale = useScaleTransition()
  const list = useRef<HTMLDivElement>(null)
  const tabs = useRef(new Map<Mode, HTMLElement>())
  const [box, setBox] = useState<Box | null>(null)
  // Radix focuses a tab from script on mouse down, which some browsers treat
  // as keyboard focus and draw the ring on the first click after a load. While
  // the last input was a pointer the ring is hidden. Any key, or focus
  // leaving the strip (so Tab back in), brings it back.
  const [pointer, setPointer] = useState(false)

  // Measured before paint, so the first frame already has the pill in place.
  // Also re-measured when the strip changes size (window resize, font load).
  useLayoutEffect(() => {
    function measure() {
      const tab = tabs.current.get(activeMode)
      if (!tab) return
      setBox((previous) =>
        previous?.x === tab.offsetLeft && previous.width === tab.offsetWidth
          ? previous
          : { x: tab.offsetLeft, width: tab.offsetWidth },
      )
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    if (list.current) observer.observe(list.current)
    return () => observer.disconnect()
  }, [activeMode])

  return (
    <Tabs.List
      ref={list}
      aria-label="Generation type"
      data-pointer={pointer || undefined}
      onPointerDownCapture={() => setPointer(true)}
      onKeyDownCapture={() => setPointer(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPointer(false)
        }
      }}
      className="group/tabs relative flex rounded-2xl bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] p-1"
    >
      {!reduceMotion && box && (
        // First render: `initial={false}` places it without travelling.
        <motion.span
          aria-hidden="true"
          className={`${pillClass} top-1 bottom-1 will-change-transform`}
          initial={false}
          animate={{ x: box.x, width: box.width }}
          transition={scale(tabPillSpring)}
        />
      )}
      {modeOrder.map((value) => (
        <Tabs.Trigger
          key={value}
          ref={(node) => {
            if (node) tabs.current.set(value, node)
            else tabs.current.delete(value)
          }}
          value={value}
          className={`relative rounded-xl px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors duration-150 data-[state=active]:text-[var(--color-text)] sm:px-4 ${focusRing} group-data-[pointer]/tabs:focus-visible:outline-none`}
        >
          {reduceMotion && (
            // No travel: the pill fades out of one tab and into the next.
            <AnimatePresence>
              {value === activeMode && (
                <motion.span
                  aria-hidden="true"
                  className={`${pillClass} inset-y-0 right-0`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={crossfade}
                />
              )}
            </AnimatePresence>
          )}
          <span className="relative">{modes[value].label}</span>
        </Tabs.Trigger>
      ))}
    </Tabs.List>
  )
}
