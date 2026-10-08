import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from 'motion/react'
import { CircleAlert, CircleCheck, Info, LoaderCircle, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Toast as RadixToast } from 'radix-ui'
import { useLayoutEffect, useRef, useState } from 'react'
import {
  useReduceMotion,
  useScaleTransition,
} from '../../shared/demo-controls/DemoSettings'
import { crossfade, fadeIn, fadeOut } from '../../shared/motion'
import { dismissLabel } from './announcements'
import {
  contentFade,
  ENTER_OFFSET,
  EXIT_OFFSET,
  progressStep,
  stackSpring,
  SWIPE_EXIT_X,
  SWIPE_FADE_DISTANCE,
  SWIPE_MIN_OPACITY,
} from './motion'
import type { SlotTarget } from './stackLayout'
import type { Toast, ToastKind } from './toastStore'

const icons: Record<ToastKind, LucideIcon> = {
  info: Info,
  success: CircleCheck,
  error: CircleAlert,
  progress: LoaderCircle,
}

// Colour is never the only signal: every kind has its own icon as well.
const iconColors: Record<ToastKind, string> = {
  info: 'text-[var(--color-accent)]',
  success: 'text-[light-dark(#15803d,#4ade80)]',
  error: 'text-[var(--color-danger)]',
  progress: 'text-[var(--color-accent)]',
}

const barColors: Record<ToastKind, string> = {
  info: 'bg-[var(--color-accent)]',
  success: 'bg-[light-dark(#15803d,#4ade80)]',
  error: 'bg-[var(--color-danger)]',
  progress: 'bg-[var(--color-accent)]',
}

type ToastCardProps = {
  toast: Toast
  target: SlotTarget
  onHeight: (id: string, height: number) => void
  onDismiss: (id: string) => void
  /** Escape only dismisses a toast while the focus is inside the viewport. */
  isInViewport: (node: EventTarget | null) => boolean
}

export function ToastCard({
  toast,
  target,
  onHeight,
  onDismiss,
  isInViewport,
}: ToastCardProps) {
  const reduceMotion = useReduceMotion()
  const scale = useScaleTransition()
  const ref = useRef<HTMLLIElement>(null)
  // A swiped card leaves sideways. Any other card sinks and fades.
  const [swiped, setSwiped] = useState(false)
  const swipeX = useMotionValue(0)
  const swipeOpacity = useTransform(
    swipeX,
    [0, SWIPE_FADE_DISTANCE],
    [1, SWIPE_MIN_OPACITY],
  )

  // The stack needs the height of every card. Measured before paint, then
  // kept up to date, because a toast that is updated in place can change it.
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    onHeight(toast.id, node.offsetHeight)
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() =>
      onHeight(toast.id, node.offsetHeight),
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [toast.id, onHeight])

  const slot = {
    y: target.y,
    scaleX: target.scaleX,
    scaleY: target.scaleY,
  }
  // With reduced motion the cards change place at once, and only fade.
  const transition = reduceMotion
    ? { default: { duration: 0 }, opacity: crossfade }
    : { default: scale(stackSpring), opacity: scale(fadeIn) }
  const exit = reduceMotion
    ? { opacity: 0, transition: crossfade }
    : swiped
      ? { opacity: 0, x: SWIPE_EXIT_X, transition: scale(stackSpring) }
      : {
          opacity: 0,
          y: target.y + EXIT_OFFSET,
          transition: scale(fadeOut),
        }

  const Icon = icons[toast.kind]
  const spin = toast.kind === 'progress' && !reduceMotion

  return (
    <RadixToast.Root
      asChild
      forceMount
      open
      // Radix has no timer here: the store owns the timers.
      duration={Infinity}
      data-toast-id={toast.id}
      onOpenChange={(open) => {
        if (!open) onDismiss(toast.id)
      }}
      onEscapeKeyDown={(event) => {
        if (!isInViewport(event.target)) event.preventDefault()
      }}
      onSwipeMove={(event) => swipeX.set(event.detail.delta.x)}
      onSwipeCancel={() => {
        void animate(swipeX, 0, scale(stackSpring))
      }}
      onSwipeEnd={() => setSwiped(true)}
    >
      <motion.li
        ref={ref}
        initial={{
          opacity: 0,
          ...slot,
          y: reduceMotion ? slot.y : slot.y + ENTER_OFFSET,
        }}
        animate={{ opacity: 1, ...slot }}
        exit={exit}
        transition={transition}
        className="group absolute right-0 bottom-0 left-0 origin-bottom list-none pt-3 outline-none"
      >
        <motion.div
          style={{ x: swipeX, opacity: swipeOpacity }}
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-[var(--color-accent)]"
        >
          <motion.div
            initial={false}
            animate={{ opacity: target.showContent ? 1 : 0 }}
            transition={reduceMotion ? crossfade : scale(contentFade)}
            // Hidden content must not catch the pointer or the tap that
            // expands the pile.
            className={target.showContent ? undefined : 'pointer-events-none'}
          >
            <div className="flex items-start gap-3 py-3 pr-1 pl-4">
              <div className="relative mt-0.5 size-5 shrink-0">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={toast.kind}
                    aria-hidden="true"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={reduceMotion ? crossfade : scale(crossfade)}
                    className={`absolute inset-0 ${iconColors[toast.kind]}`}
                  >
                    <Icon className={`size-5 ${spin ? 'animate-spin' : ''}`} />
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="relative min-w-0 flex-1">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={`${toast.title}\n${toast.description ?? ''}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={reduceMotion ? crossfade : scale(crossfade)}
                  >
                    <p className="font-medium">{toast.title}</p>
                    {toast.description && (
                      <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                        {toast.description}
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              <RadixToast.Close asChild>
                <button
                  type="button"
                  aria-label={dismissLabel(toast.title)}
                  className="-mt-1 grid size-10 shrink-0 place-items-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-accent)]"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </RadixToast.Close>
            </div>
            {toast.progress !== undefined && (
              <div
                aria-hidden="true"
                className="mx-4 mb-3 h-1 overflow-hidden rounded-full bg-[var(--color-border)]"
              >
                <motion.div
                  initial={false}
                  animate={{ scaleX: toast.progress }}
                  transition={reduceMotion ? { duration: 0 } : progressStep}
                  className={`h-full origin-left ${barColors[toast.kind]}`}
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.li>
    </RadixToast.Root>
  )
}
