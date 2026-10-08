import { AnimatePresence, motion } from 'motion/react'
import { Toast as RadixToast } from 'radix-ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  useReduceMotion,
  useScaleTransition,
} from '../../shared/demo-controls/DemoSettings'
import { crossfade } from '../../shared/motion'
import { waitingText } from './announcements'
import { LiveRegions } from './LiveRegions'
import { stackSpring } from './motion'
import { stackLayout } from './stackLayout'
import { ToastCard } from './ToastCard'
import type { PauseReason, ToastStore } from './toastStore'
import { useToastState } from './useToastState'

// Keyboard focus only. A click that focuses a toast must not keep the stack
// open and the timers stopped after the pointer has left.
function isKeyboardFocus(target: EventTarget) {
  try {
    return target instanceof Element && target.matches(':focus-visible')
  } catch {
    // An engine without :focus-visible: count every focus.
    return true
  }
}

// Stops the timers for as long as `active` is true.
function usePauseReason(
  store: ToastStore,
  reason: PauseReason,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return
    store.pause(reason)
    return () => store.resume(reason)
  }, [store, reason, active])
}

type ToastViewportProps = {
  store: ToastStore
}

/**
 * The stack. Radix provides the landmark, the F8 hotkey, the list items and
 * the swipe. The study provides everything else: timers, announcements,
 * stacking and motion.
 */
export function ToastViewport({ store }: ToastViewportProps) {
  const { active, queue } = useToastState(store)
  const reduceMotion = useReduceMotion()
  const scale = useScaleTransition()
  const viewportRef = useRef<HTMLOListElement>(null)
  // Radix announces a toast by itself. Its announcer goes into a container
  // that screen readers skip, because the live regions say it instead.
  const [muted, setMuted] = useState<HTMLElement | null>(null)

  const [hover, setHover] = useState(false)
  const [focusWithin, setFocusWithin] = useState(false)
  const [touchExpanded, setTouchExpanded] = useState(false)
  const [heights, setHeights] = useState<Record<string, number>>({})
  // Where the focus was before it entered the stack, so it can go back there.
  const returnFocus = useRef<Element | null>(null)
  const tapStartedCollapsed = useRef(false)

  const expanded = hover || focusWithin || touchExpanded
  const { targets, height: stackHeight } = stackLayout(
    active.map(({ id }) => id),
    heights,
    expanded,
  )

  usePauseReason(store, 'hover', hover)
  usePauseReason(store, 'focus', focusWithin)
  usePauseReason(store, 'touch', touchExpanded)

  // A hidden tab pauses the timers. Radix pauses on window blur only, which
  // also happens when the window merely loses focus.
  useEffect(() => {
    const sync = () => {
      if (document.hidden) store.pause('hidden')
      else store.resume('hidden')
    }
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => {
      document.removeEventListener('visibilitychange', sync)
      store.resume('hidden')
    }
  }, [store])

  // A pile with one toast has nothing to expand. When the last toast goes
  // away under the pointer, the browser has not reported that the pointer
  // left, so the hover is cleared here. Adjusted during render, not in an
  // effect, so no frame is drawn with the old value.
  const count = active.length
  const [previousCount, setPreviousCount] = useState(count)
  if (count !== previousCount) {
    setPreviousCount(count)
    if (count <= 1) setTouchExpanded(false)
    if (count === 0) setHover(false)
  }

  // A tap outside the stack folds it again.
  useEffect(() => {
    if (!touchExpanded) return
    const fold = (event: PointerEvent) => {
      if (!viewportRef.current?.contains(event.target as Node)) {
        setTouchExpanded(false)
      }
    }
    document.addEventListener('pointerdown', fold)
    return () => document.removeEventListener('pointerdown', fold)
  }, [touchExpanded])

  const onHeight = useCallback((id: string, height: number) => {
    setHeights((current) =>
      current[id] === height ? current : { ...current, [id]: height },
    )
  }, [])

  const isInViewport = useCallback(
    (node: EventTarget | null) =>
      node instanceof Node && Boolean(viewportRef.current?.contains(node)),
    [],
  )

  // When the toast that has the focus goes away, the focus goes to the newest
  // toast that is left, or back to where it came from. It never falls to the
  // page. Radix has already moved the focus from the toast to the viewport
  // when this runs.
  function handleDismiss(id: string) {
    const viewport = viewportRef.current
    const card = viewport?.querySelector(`[data-toast-id="${id}"]`)
    const focused = document.activeElement
    if (viewport && (focused === viewport || card?.contains(focused))) {
      const next = active.findLast((toast) => toast.id !== id)
      const target = next
        ? viewport.querySelector<HTMLElement>(`[data-toast-id="${next.id}"]`)
        : returnFocus.current
      if (target instanceof HTMLElement && target.isConnected) {
        target.focus({ preventScroll: true })
      }
    }
    store.dismiss(id)
  }

  // Native listeners, not React props. Radix renders the toasts in a portal
  // into the viewport, and a React event from a portal bubbles through the
  // React tree, where the viewport is not an ancestor of the toasts.
  const latest = useRef({ expanded, count })
  useEffect(() => {
    latest.current = { expanded, count }
  })
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const enter = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') setHover(true)
    }
    const leave = () => setHover(false)

    const focusIn = (event: FocusEvent) => {
      const from = event.relatedTarget as Node | null
      if (!viewport.contains(from)) returnFocus.current = from as Element | null
      if (isKeyboardFocus(event.target!)) setFocusWithin(true)
    }
    const focusOut = (event: FocusEvent) => {
      if (!viewport.contains(event.relatedTarget as Node | null)) {
        setFocusWithin(false)
      }
    }

    // On touch there is no hover. The first tap on a pile opens it and does
    // nothing else; the next tap works as usual.
    const press = (event: PointerEvent) => {
      const { expanded, count } = latest.current
      tapStartedCollapsed.current =
        event.pointerType === 'touch' && !expanded && count > 1
    }
    const click = (event: MouseEvent) => {
      // Keyboard clicks have no pointer press, and detail is 0 for them.
      if (!tapStartedCollapsed.current || event.detail === 0) return
      tapStartedCollapsed.current = false
      event.preventDefault()
      event.stopPropagation()
      setTouchExpanded(true)
    }

    viewport.addEventListener('pointerenter', enter)
    viewport.addEventListener('pointerleave', leave)
    viewport.addEventListener('focusin', focusIn)
    viewport.addEventListener('focusout', focusOut)
    viewport.addEventListener('pointerdown', press, true)
    viewport.addEventListener('click', click, true)
    return () => {
      viewport.removeEventListener('pointerenter', enter)
      viewport.removeEventListener('pointerleave', leave)
      viewport.removeEventListener('focusin', focusIn)
      viewport.removeEventListener('focusout', focusOut)
      viewport.removeEventListener('pointerdown', press, true)
      viewport.removeEventListener('click', click, true)
    }
  }, [])

  const moveCaption = reduceMotion ? { duration: 0 } : scale(stackSpring)

  return (
    <RadixToast.Provider
      label="Notification"
      duration={Infinity}
      swipeDirection="right"
      announcerContainer={muted ?? undefined}
    >
      <div ref={setMuted} hidden aria-hidden="true" />
      <LiveRegions store={store} />
      <AnimatePresence initial={false}>
        {active.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            target={targets[toast.id]}
            onHeight={onHeight}
            onDismiss={handleDismiss}
            isInViewport={isInViewport}
          />
        ))}
      </AnimatePresence>
      <RadixToast.Viewport
        ref={viewportRef}
        hotkey={['F8']}
        className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 m-0 w-[calc(100vw-2rem)] list-none p-0 outline-none sm:w-[360px]"
      />
      <AnimatePresence>
        {queue.length > 0 && (
          <motion.p
            key="waiting"
            // Sits above the stack and follows its top edge.
            initial={{ opacity: 0, y: -stackHeight - 8 }}
            animate={{ opacity: 1, y: -stackHeight - 8 }}
            exit={{ opacity: 0 }}
            transition={{ default: moveCaption, opacity: crossfade }}
            className="pointer-events-none fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-text-muted)] shadow-sm"
          >
            {waitingText(queue.length)}
          </motion.p>
        )}
      </AnimatePresence>
    </RadixToast.Provider>
  )
}
