import { animate, AnimatePresence, motion, useMotionValue } from 'motion/react'
import {
  useCallback,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { KeyboardEvent } from 'react'
import {
  useReduceMotion,
  useScaleTransition,
} from '../../shared/demo-controls/DemoSettings'
import { announcements, instructions } from './announcements'
import { GridItem } from './GridItem'
import { instant, liftFade, settleSpring } from './motion'
import type { Photo } from './photos'
import { moveItem, nextIndex, rowAndColumn, scrollTopToReveal } from './reorder'
import type { Direction, Geometry } from './reorder'
import type { Loading } from './useThumbnail'
import type { DragApi } from './useTileDrag'

const keyDirections: Record<string, Direction> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  Home: 'start',
  End: 'end',
}

/** The tile being moved and the order it started from, for Escape. */
type Moving = { id: string; mode: 'pointer' | 'keyboard'; origin: Photo[] }

/** The number of columns the browser resolved for the grid. */
function readColumns(list: HTMLElement) {
  const tracks = getComputedStyle(list).gridTemplateColumns
  return tracks && tracks !== 'none' ? tracks.split(' ').length : 1
}

type ReorderGridProps = {
  initialPhotos: Photo[]
  loading: Loading
  failOne: boolean
  /** A new value makes every thumbnail load again. */
  reloadKey: number
  /** A fixed number of columns, or `auto` to follow the width. */
  columns: number | 'auto'
}

export function ReorderGrid({
  initialPhotos,
  loading,
  failOne,
  reloadKey,
  columns: columnSetting,
}: ReorderGridProps) {
  const reduceMotion = useReduceMotion()
  const scale = useScaleTransition()
  const instructionsId = useId()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const [photos, setPhotos] = useState(initialPhotos)
  const [moving, setMoving] = useState<Moving | null>(null)
  const [focusId, setFocusId] = useState(initialPhotos[0].id)
  const [announcement, setAnnouncement] = useState('')
  const [measuredColumns, setMeasuredColumns] = useState(1)
  // Counts resizes while a tile is moving, so the drop marker is measured again.
  const [resizes, setResizes] = useState(0)
  // The drop marker is moved through motion values, not state.
  const markerX = useMotionValue(0)
  const markerY = useMotionValue(0)
  const markerWidth = useMotionValue(0)
  const markerHeight = useMotionValue(0)
  const markedId = useRef<string | null>(null)
  const columns = columnSetting === 'auto' ? measuredColumns : columnSetting

  // Handlers run outside render, so they read the latest values from refs.
  const photosRef = useRef(photos)
  const movingRef = useRef(moving)
  const columnsRef = useRef(columns)
  useLayoutEffect(() => {
    photosRef.current = photos
    movingRef.current = moving
    columnsRef.current = columns
  })

  useLayoutEffect(() => {
    const list = listRef.current!
    const update = () => {
      setMeasuredColumns(readColumns(list))
      if (movingRef.current) setResizes((count) => count + 1)
    }
    update()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(update)
    observer.observe(list)
    return () => observer.disconnect()
  }, [])

  const tileElement = (id: string) =>
    listRef.current?.querySelector<HTMLElement>(`[data-tile-id="${id}"]`)

  const describe = (id: string, list: Photo[] = photosRef.current) => {
    const index = list.findIndex((photo) => photo.id === id)
    return { title: list[index].title, position: index + 1, count: list.length }
  }

  const api: DragApi = useMemo(
    () => ({
      scroller: scrollerRef,
      list: listRef,
      measure: (): Geometry => {
        const list = listRef.current!
        const style = getComputedStyle(list)
        const first = list.firstElementChild as HTMLElement
        return {
          left: first.offsetLeft,
          top: first.offsetTop,
          columns: columnsRef.current,
          count: photosRef.current.length,
          cellWidth: first.offsetWidth,
          cellHeight: first.offsetHeight,
          gapX: parseFloat(style.columnGap) || 0,
          gapY: parseFloat(style.rowGap) || 0,
        }
      },
      indexOf: (id) => photosRef.current.findIndex((photo) => photo.id === id),
      begin: (id) => {
        if (movingRef.current) return false
        const next: Moving = { id, mode: 'pointer', origin: photosRef.current }
        movingRef.current = next
        setMoving(next)
        setFocusId(id)
        return true
      },
      moveTo: (id, index) => {
        setPhotos((current) => {
          const from = current.findIndex((photo) => photo.id === id)
          if (from < 0 || from === index) return current
          return moveItem(current, from, index)
        })
      },
      end: (id, cancel) => {
        const current = movingRef.current
        if (current?.id !== id) return
        movingRef.current = null
        setMoving(null)
        if (cancel) {
          photosRef.current = current.origin
          setPhotos(current.origin)
        }
        const message = cancel ? announcements.cancelled : announcements.dropped
        setAnnouncement(message(describe(id)))
      },
    }),
    [],
  )

  const movingId = moving?.id ?? null
  const movingMode = moving?.mode ?? null
  const markerTransition = reduceMotion ? instant : scale(settleSpring)

  // Keep the drop marker on the slot of the moving tile. Its offsets are its
  // layout position, so they are right while the tile is still animating. The
  // marker jumps to a new tile and glides between that tile's slots.
  const moveMarker = useEffectEvent((id: string) => {
    const tile = tileElement(id)?.parentElement
    if (!tile) return
    markerWidth.set(tile.offsetWidth)
    markerHeight.set(tile.offsetHeight)
    if (markedId.current !== id || reduceMotion) {
      markedId.current = id
      markerX.jump(tile.offsetLeft)
      markerY.jump(tile.offsetTop)
    } else {
      animate(markerX, tile.offsetLeft, markerTransition)
      animate(markerY, tile.offsetTop, markerTransition)
    }
  })
  useLayoutEffect(() => {
    if (movingId) moveMarker(movingId)
    else markedId.current = null
  }, [photos, movingId, columns, resizes])

  // After a keyboard move the DOM order changes, which can drop focus. Put it
  // back, and scroll the tile into view from its layout position, because its
  // visual position is still on the way.
  useLayoutEffect(() => {
    if (movingMode !== 'keyboard' || !movingId) return
    const element = tileElement(movingId)
    if (element && document.activeElement !== element) {
      element.focus({ preventScroll: true })
    }
    const tile = element?.parentElement
    const scroller = scrollerRef.current
    if (tile && scroller) {
      scroller.scrollTop = scrollTopToReveal(
        tile.offsetTop,
        tile.offsetHeight,
        scroller.scrollTop,
        scroller.clientHeight,
      )
    }
  }, [photos, movingId, movingMode])

  const focusIndex = useCallback((index: number) => {
    const photo = photosRef.current[index]
    setFocusId(photo.id)
    tileElement(photo.id)?.focus()
  }, [])

  function handleKeyDown(event: KeyboardEvent<HTMLElement>, id: string) {
    const current = movingRef.current
    const list = photosRef.current
    const index = list.findIndex((photo) => photo.id === id)
    const direction = keyDirections[event.key]
    const confirm = event.key === ' ' || event.key === 'Enter'

    if (!current) {
      if (confirm) {
        event.preventDefault()
        const next: Moving = { id, mode: 'keyboard', origin: list }
        movingRef.current = next
        setMoving(next)
        setAnnouncement(announcements.pickedUp(describe(id)))
      } else if (direction) {
        event.preventDefault()
        focusIndex(nextIndex(index, direction, columnsRef.current, list.length))
      }
      return
    }
    if (current.mode !== 'keyboard' || current.id !== id) return

    if (confirm) {
      event.preventDefault()
      api.end(id, false)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      api.end(id, true)
    } else if (direction) {
      event.preventDefault()
      const to = nextIndex(index, direction, columnsRef.current, list.length)
      if (to === index) return
      api.moveTo(id, to)
      const { row, column } = rowAndColumn(to, columnsRef.current)
      setAnnouncement(
        announcements.moved(
          { title: list[index].title, position: to + 1, count: list.length },
          row,
          column,
        ),
      )
    }
  }

  // Focus leaving a picked up tile cancels the move. A reorder also makes the
  // browser blur the tile for a moment, so check again once the commit has
  // put focus back.
  function handleBlur(id: string) {
    setTimeout(() => {
      const current = movingRef.current
      if (current?.mode !== 'keyboard' || current.id !== id) return
      if (document.activeElement !== tileElement(id)) api.end(id, true)
    }, 0)
  }

  return (
    <div>
      <p id={instructionsId} className="sr-only">
        {instructions}
      </p>
      {/* layoutScroll lets Motion account for the scroll position of this
          container when it measures layout changes inside it. */}
      <motion.div
        ref={scrollerRef}
        layoutScroll
        className="h-[min(30rem,70dvh)] overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--color-border)]"
      >
        <div className="relative">
          {/* Before the list, so the tiles paint above it. Outside the list,
              because a list may only contain list items. */}
          <AnimatePresence>
            {moving && (
              <motion.div
                key="marker"
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-0 rounded-[var(--radius-md)] border-2 border-dashed border-[var(--color-accent)]"
                style={{
                  x: markerX,
                  y: markerY,
                  width: markerWidth,
                  height: markerHeight,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reduceMotion ? instant : scale(liftFade)}
              />
            )}
          </AnimatePresence>
          <ul
            ref={listRef}
            aria-label="Photos"
            style={
              columnSetting === 'auto'
                ? undefined
                : {
                    gridTemplateColumns: `repeat(${columnSetting}, minmax(0, 1fr))`,
                  }
            }
            className={`relative m-0 grid gap-3 p-3 ${columnSetting === 'auto' ? 'grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]' : ''}`}
          >
            {photos.map((photo, index) => (
              <GridItem
                key={photo.id}
                photo={photo}
                index={index}
                count={photos.length}
                api={api}
                instructionsId={instructionsId}
                tabbable={photo.id === focusId}
                moving={moving?.id === photo.id ? moving.mode : null}
                loading={loading}
                failOne={failOne}
                reloadKey={reloadKey}
                onKeyDown={handleKeyDown}
                onFocus={setFocusId}
                onBlur={handleBlur}
              />
            ))}
          </ul>
        </div>
      </motion.div>
      <output aria-live="polite" className="sr-only">
        {announcement}
      </output>
    </div>
  )
}
