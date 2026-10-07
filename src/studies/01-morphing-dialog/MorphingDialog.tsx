import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from 'motion/react'
import type { AnimationPlaybackControls, Transition } from 'motion/react'
import { MessageCircle } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useRef, useState } from 'react'
import {
  useReduceMotion,
  useScaleTransition,
} from '../../shared/demo-controls/DemoSettings'
import { crossfade, fadeIn, fadeOut } from '../../shared/motion'
import { FeedbackForm } from './FeedbackForm'
import { overlayFade, surfaceDuration, surfaceSpring } from './motion'
import type { SendMessage } from './sendMessage'

// Radius and shadow are inline styles on purpose: Motion only corrects their
// distortion during layout animations when they are set through `style`.
// The button is 48px, so 24px makes it a circle. The dialog uses the same
// radius, so it never changes during the morph.
const RADIUS = 24
// The content fade-in starts halfway through the morph.
const CONTENT_FADE_IN: Transition = {
  ...fadeIn,
  delay: surfaceDuration / 2,
}
const FAB_SHADOW = '0 4px 12px rgb(0 0 0 / 0.2)'
const DIALOG_SHADOW = '0 24px 48px rgb(0 0 0 / 0.3)'

type MorphingDialogProps = {
  sendMessage: SendMessage
}

export function MorphingDialog({ sendMessage }: MorphingDialogProps) {
  const [open, setOpen] = useState(false)
  // Announced after the dialog is gone, so it lives outside the dialog.
  const [announcement, setAnnouncement] = useState('')
  const reduceMotion = useReduceMotion()
  const scale = useScaleTransition()
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Drives the fade of the dialog content (or of the whole surface when
  // motion is reduced). Closing is two steps: fade this to 0, then flip
  // `open`, so the surface only collapses once its content is gone.
  const contentOpacity = useMotionValue(0)
  const pendingClose = useRef<AnimationPlaybackControls | null>(null)

  // Progress of the morph: 0 looks like the button, 1 looks like the dialog.
  // Both elements read it, so the colour is continuous through the hand-off
  // between them, also when the morph is interrupted halfway.
  const morph = useMotionValue(0)
  const accentOpacity = useTransform(morph, [0, 0.1], [1, 0])
  const request = useRef<AbortController | null>(null)

  const contentIn = reduceMotion ? crossfade : CONTENT_FADE_IN
  const contentOut = reduceMotion ? crossfade : fadeOut
  const layoutId = reduceMotion ? undefined : 'surface'

  function openDialog() {
    setAnnouncement('')
    pendingClose.current = null
    setOpen(true)
    if (!reduceMotion) animate(morph, 1, scale(surfaceSpring))
    // The fade is delayed so that it starts shortly before the morph ends. A
    // reopen during the closing fade has no morph to wait for. Closing starts
    // a new animation on the same value, which also cancels a pending fade.
    animate(
      contentOpacity,
      1,
      scale(open ? { ...contentIn, delay: 0 } : contentIn),
    )
  }

  function closeDialog() {
    // Closing while Send is pending cancels it: nothing is sent.
    request.current?.abort()
    const fade = animate(contentOpacity, 0, scale(contentOut))
    pendingClose.current = fade
    // A reopen clears pendingClose, which cancels this close.
    void fade.then(() => {
      if (pendingClose.current !== fade) return
      pendingClose.current = null
      setOpen(false)
      if (!reduceMotion) animate(morph, 0, scale(surfaceSpring))
    })
  }

  function submit(message: string) {
    const controller = new AbortController()
    request.current = controller
    return sendMessage(message, { signal: controller.signal })
  }

  function handleSent() {
    setAnnouncement('Message sent')
    closeDialog()
  }

  function handleOpenChange(next: boolean) {
    if (next) openDialog()
    else closeDialog()
  }

  // With reduced motion the button stays in place under the overlay.
  const showButtonSurface = reduceMotion || !open

  return (
    <>
      <output aria-live="polite" className="sr-only">
        {announcement}
      </output>
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Trigger asChild>
          <motion.button
            ref={triggerRef}
            layoutRoot
            aria-label="Send feedback"
            className="group fixed right-4 bottom-4 z-10 grid size-12 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          >
            {showButtonSurface && (
              <motion.span
                layoutId={layoutId}
                transition={{ layout: scale(surfaceSpring) }}
                style={{ borderRadius: RADIUS, boxShadow: FAB_SHADOW }}
                className="absolute inset-0 overflow-hidden bg-[var(--color-accent)] transition-colors duration-150 group-hover:bg-[var(--color-accent-hover)]"
              >
                {/* Fades out as the button returns, mirroring the layer in
                    the dialog surface. */}
                {!reduceMotion && (
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-0 bg-[var(--color-surface)]"
                    style={{ opacity: morph }}
                  />
                )}
              </motion.span>
            )}
            <motion.span
              className="relative text-[var(--color-accent-text)]"
              initial={false}
              animate={{ opacity: open && !reduceMotion ? 0 : 1 }}
              transition={scale(
                open ? fadeOut : { ...fadeIn, delay: surfaceDuration },
              )}
            >
              <MessageCircle aria-hidden="true" className="size-6" />
            </motion.span>
          </motion.button>
        </Dialog.Trigger>
        <Dialog.Portal forceMount>
          <AnimatePresence>
            {open && (
              <Dialog.Overlay key="overlay" forceMount asChild>
                <motion.div
                  className="fixed inset-0 z-20 bg-black/40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={scale(overlayFade)}
                />
              </Dialog.Overlay>
            )}
            {open && (
              <Dialog.Content
                key="content"
                forceMount
                asChild
                onCloseAutoFocus={(event) => {
                  event.preventDefault()
                  triggerRef.current?.focus({ preventScroll: true })
                }}
              >
                {/* Wrapper only positions the surface. Inline pointer-events
                  because Radix sets it inline on modal content. */}
                <motion.div
                  layoutRoot
                  style={{ pointerEvents: 'none' }}
                  className="fixed inset-0 z-30 flex items-end justify-center p-4 md:items-center"
                >
                  <motion.div
                    layoutId={layoutId}
                    transition={{ layout: scale(surfaceSpring) }}
                    style={{
                      borderRadius: RADIUS,
                      boxShadow: DIALOG_SHADOW,
                      opacity: reduceMotion ? contentOpacity : 1,
                      pointerEvents: 'auto',
                    }}
                    className="relative w-full overflow-hidden bg-[var(--color-surface)] p-6 md:max-w-md"
                  >
                    {/* Accent layer that fades out as the surface grows, so
                        the colour morphs together with the shape. */}
                    {!reduceMotion && (
                      <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[var(--color-accent)]"
                        style={{ opacity: accentOpacity }}
                      />
                    )}
                    <motion.div layout="position" className="relative">
                      <motion.div
                        style={{ opacity: reduceMotion ? 1 : contentOpacity }}
                      >
                        <Dialog.Title className="text-lg font-semibold">
                          Send feedback
                        </Dialog.Title>
                        <Dialog.Description className="mt-1 mb-5 text-[var(--color-text-muted)]">
                          Tell us what you were trying to do and what got in the
                          way.
                        </Dialog.Description>
                        <FeedbackForm onSubmit={submit} onSent={handleSent} />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </Dialog.Content>
            )}
          </AnimatePresence>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
