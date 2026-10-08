import { GripVertical } from 'lucide-react'
import { animate, motion, useMotionValue } from 'motion/react'
import { useEffectEvent, useLayoutEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import {
  useReduceMotion,
  useScaleTransition,
} from '../../shared/demo-controls/DemoSettings'
import { crossfade } from '../../shared/motion'
import { instant, liftFade, settleSpring } from './motion'
import type { Photo } from './photos'
import { Thumbnail } from './Thumbnail'
import { useThumbnail } from './useThumbnail'
import type { Loading } from './useThumbnail'
import { useTileDrag } from './useTileDrag'
import type { DragApi } from './useTileDrag'

const liftedShadow = '0 12px 24px rgb(0 0 0 / 0.25)'

type GridItemProps = {
  photo: Photo
  index: number
  count: number
  api: DragApi
  /** Id of the element with the keyboard instructions. */
  instructionsId: string
  /** The one tile in the tab order. */
  tabbable: boolean
  /** Set while this tile is being moved. */
  moving: 'pointer' | 'keyboard' | null
  loading: Loading
  failOne: boolean
  reloadKey: number
  onKeyDown: (event: KeyboardEvent<HTMLElement>, id: string) => void
  onFocus: (id: string) => void
  onBlur: (id: string) => void
}

export function GridItem({
  photo,
  index,
  count,
  api,
  instructionsId,
  tabbable,
  moving,
  loading,
  failOne,
  reloadKey,
  onKeyDown,
  onFocus,
  onBlur,
}: GridItemProps) {
  const tileRef = useRef<HTMLLIElement>(null)
  const reduceMotion = useReduceMotion()
  const scale = useScaleTransition()
  const state = useThumbnail(photo, loading, failOne, reloadKey)
  const { x, y, phase, handlers } = useTileDrag({
    id: photo.id,
    index,
    api,
    tileRef,
    reduceMotion,
    settle: scale(settleSpring),
  })

  // Reduced motion: no tile travels, so a tile that changed slot fades back in
  // instead. The tile under the pointer is excluded, it changes slot often.
  const opacity = useMotionValue(1)
  const previousIndex = useRef(index)
  const fadeBackIn = useEffectEvent(() => {
    if (!reduceMotion || phase === 'dragging') return
    opacity.set(0.4)
    animate(opacity, 1, crossfade)
  })
  useLayoutEffect(() => {
    if (previousIndex.current === index) return
    previousIndex.current = index
    fadeBackIn()
  }, [index])

  // The pointer owns the position of a dragged tile and of one settling after
  // a drop, so their layout changes must not animate.
  const layoutTransition =
    reduceMotion || phase !== 'idle' ? instant : scale(settleSpring)
  const lifted = phase !== 'idle' || moving !== null
  const failed = state === 'error' ? ', could not load' : ''

  return (
    <motion.li
      ref={tileRef}
      layout="position"
      transition={{ layout: layoutTransition }}
      style={{ x, y, opacity }}
      className={`relative list-none ${lifted ? 'z-10' : ''}`}
    >
      <button
        type="button"
        tabIndex={tabbable ? 0 : -1}
        data-tile-id={photo.id}
        aria-roledescription="sortable item"
        aria-label={`${photo.title}${failed}, position ${index + 1} of ${count}`}
        aria-describedby={instructionsId}
        aria-pressed={moving !== null}
        onKeyDown={(event) => onKeyDown(event, photo.id)}
        onFocus={() => onFocus(photo.id)}
        onBlur={() => onBlur(photo.id)}
        {...handlers}
        className={`group relative block w-full select-none rounded-[var(--radius-md)] border bg-[var(--color-surface)] p-2 text-left text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${phase === 'dragging' ? 'cursor-grabbing' : 'cursor-grab'} ${moving ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'}`}
      >
        {/* The lifted shadow is a layer that fades in, so the shadow is not
            repainted on every frame. */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[var(--radius-md)]"
          style={{ boxShadow: liftedShadow }}
          initial={false}
          animate={{ opacity: lifted ? 1 : 0 }}
          transition={reduceMotion ? crossfade : scale(liftFade)}
        />
        <Thumbnail photo={photo} state={state} />
        <span className="mt-2 block truncate px-0.5 text-sm">
          {photo.title}
        </span>
        <span
          data-drag-handle=""
          aria-hidden="true"
          className="absolute top-3.5 right-3.5 grid size-10 touch-none place-items-center rounded-full bg-[var(--color-surface)]/80 opacity-0 transition-opacity duration-150 group-hover:opacity-100 pointer-coarse:opacity-100"
        >
          <GripVertical className="size-5" />
        </span>
      </button>
    </motion.li>
  )
}
