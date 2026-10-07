import { animate, AnimatePresence, motion, useMotionValue } from 'motion/react'
import type { AnimationPlaybackControls } from 'motion/react'
import { Dialog } from 'radix-ui'
import { useRef, useState } from 'react'
import {
  useReduceMotion,
  useScaleTransition,
} from '../../shared/demo-controls/DemoSettings'
import {
  contentFadeIn,
  contentFadeOut,
  crossfade,
  overlayFade,
  surfaceSpring,
} from '../../shared/motion'
import type { CreateFolder } from './folders'
import { NewFolderForm } from './NewFolderForm'

// Radius and shadow are inline styles on purpose: Motion only corrects their
// distortion during layout animations when they are set through `style`.
const FAB_RADIUS = 28
const DIALOG_RADIUS = 20
const FAB_SHADOW = '0 4px 12px rgb(0 0 0 / 0.2)'
const DIALOG_SHADOW = '0 24px 48px rgb(0 0 0 / 0.3)'

type MorphingDialogProps = {
  createFolder: CreateFolder
  onCreated: (name: string) => void
}

export function MorphingDialog({
  createFolder,
  onCreated,
}: MorphingDialogProps) {
  const [open, setOpen] = useState(false)
  const reduceMotion = useReduceMotion()
  const scale = useScaleTransition()
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Drives the fade of the dialog content (or of the whole surface when
  // motion is reduced). Closing is two steps: fade this to 0, then flip
  // `open`, so the surface only collapses once its content is gone.
  const contentOpacity = useMotionValue(0)
  const pendingClose = useRef<AnimationPlaybackControls | null>(null)
  const request = useRef<AbortController | null>(null)

  const fadeIn = reduceMotion ? crossfade : contentFadeIn
  const fadeOut = reduceMotion ? crossfade : contentFadeOut
  const layoutId = reduceMotion ? undefined : 'surface'

  function openDialog() {
    pendingClose.current = null
    setOpen(true)
    animate(contentOpacity, 1, scale(fadeIn))
  }

  function closeDialog() {
    // Closing while Create is pending cancels it: no folder is created.
    request.current?.abort()
    const fade = animate(contentOpacity, 0, scale(fadeOut))
    pendingClose.current = fade
    // A reopen clears pendingClose, which cancels this close.
    void fade.then(() => {
      if (pendingClose.current !== fade) return
      pendingClose.current = null
      setOpen(false)
    })
  }

  function submit(name: string) {
    const controller = new AbortController()
    request.current = controller
    return createFolder(name, { signal: controller.signal })
  }

  function handleCreated(name: string) {
    onCreated(name)
    closeDialog()
  }

  function handleOpenChange(next: boolean) {
    if (next) openDialog()
    else closeDialog()
  }

  // With reduced motion the button stays in place under the overlay.
  const showButtonSurface = reduceMotion || !open

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <motion.button
          ref={triggerRef}
          layoutRoot
          aria-label="New folder"
          className="fixed right-4 bottom-4 z-10 grid size-14 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        >
          {showButtonSurface && (
            <motion.span
              layoutId={layoutId}
              transition={{ layout: scale(surfaceSpring) }}
              style={{ borderRadius: FAB_RADIUS, boxShadow: FAB_SHADOW }}
              className="absolute inset-0 bg-[var(--color-accent)]"
            />
          )}
          <motion.svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="relative size-6 text-[var(--color-accent-text)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            initial={false}
            animate={{ opacity: open && !reduceMotion ? 0 : 1 }}
            transition={scale(open ? contentFadeOut : contentFadeIn)}
          >
            <path d="M12 5v14M5 12h14" />
          </motion.svg>
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
                    borderRadius: DIALOG_RADIUS,
                    boxShadow: DIALOG_SHADOW,
                    opacity: reduceMotion ? contentOpacity : 1,
                  }}
                  className="pointer-events-auto w-full bg-[var(--color-surface)] p-6 md:max-w-md"
                >
                  <motion.div
                    layout="position"
                    style={{ opacity: reduceMotion ? 1 : contentOpacity }}
                  >
                    <Dialog.Title className="text-lg font-semibold">
                      New folder
                    </Dialog.Title>
                    <Dialog.Description className="mt-1 mb-5 text-[var(--color-text-muted)]">
                      Folders keep related files together. You can rename it
                      later.
                    </Dialog.Description>
                    <NewFolderForm
                      onSubmit={submit}
                      onCreated={handleCreated}
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
            </Dialog.Content>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
