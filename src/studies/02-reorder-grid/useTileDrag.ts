import { animate, useMotionValue } from 'motion/react'
import type { Transition } from 'motion/react'
import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import type { PointerEvent, RefObject } from 'react'
import {
  autoScrollVelocity,
  clamp,
  DRAG_THRESHOLD,
  slotAtPoint,
  SLOT_HYSTERESIS,
} from './reorder'
import type { Geometry } from './reorder'

/** What a tile needs from the grid to be dragged. */
export type DragApi = {
  scroller: RefObject<HTMLElement | null>
  list: RefObject<HTMLElement | null>
  measure: () => Geometry
  indexOf: (id: string) => number
  /** False when another tile is already being moved. */
  begin: (id: string) => boolean
  moveTo: (id: string, index: number) => void
  end: (id: string, cancel: boolean) => void
}

export type DragPhase = 'idle' | 'dragging' | 'settling'

type Session = {
  pointerId: number
  target: HTMLElement
  clientX: number
  clientY: number
  startX: number
  startY: number
  started: boolean
  /** Where inside the tile the pointer took hold of it. */
  grabX: number
  grabY: number
  /** Sub-pixel scroll carried to the next frame. */
  remainder: number
  frame: number
  lastTime: number | null
  cleanup: () => void
}

type Options = {
  id: string
  index: number
  api: DragApi
  tileRef: RefObject<HTMLLIElement | null>
  reduceMotion: boolean
  /** The settle transition, already scaled by slow motion. */
  settle: Transition
}

/**
 * Pointer dragging of one tile. While dragging, the tile follows the pointer
 * through the motion values `x` and `y`, which are offsets from its current
 * slot. The order changes live, so the slot moves under the tile and the offset
 * is recomputed every time. Neighbours reorder through their layout animation.
 * On release the offset animates to zero, which settles the tile into its slot.
 */
export function useTileDrag({
  id,
  index,
  api,
  tileRef,
  reduceMotion,
  settle,
}: Options) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const [phase, setPhase] = useState<DragPhase>('idle')
  const session = useRef<Session | null>(null)
  // Top left of the tile when it was released, in list coordinates.
  const released = useRef({ left: 0, top: 0 })

  // The visual top left of the dragged tile, in list coordinates. The list
  // rect moves with the scroll, so this stays right while auto-scrolling. It
  // is kept inside the list: a transform counts as scrollable overflow, so a
  // tile dragged past the end would make the scroller longer, auto-scroll
  // would follow, and the tile would run away from the content.
  function tilePosition(s: Session) {
    const list = api.list.current!
    const rect = list.getBoundingClientRect()
    const tile = tileRef.current!
    return {
      left: clamp(
        s.clientX - rect.left - s.grabX,
        0,
        list.offsetWidth - tile.offsetWidth,
      ),
      top: clamp(
        s.clientY - rect.top - s.grabY,
        0,
        list.offsetHeight - tile.offsetHeight,
      ),
    }
  }

  function placeTile(s: Session) {
    const tile = tileRef.current
    if (!tile) return
    const { left, top } = tilePosition(s)
    x.set(left - tile.offsetLeft)
    y.set(top - tile.offsetTop)
  }

  function update(s: Session) {
    placeTile(s)
    // The slot follows the pointer itself, so it is not clamped.
    const rect = api.list.current!.getBoundingClientRect()
    const pointer = { x: s.clientX - rect.left, y: s.clientY - rect.top }
    const current = api.indexOf(id)
    const next = slotAtPoint(pointer, api.measure(), current, SLOT_HYSTERESIS)
    if (next !== current) api.moveTo(id, next)
  }

  // The slot moved under the tile: keep the tile under the pointer.
  const keepUnderPointer = useEffectEvent(() => {
    const s = session.current
    if (s?.started) placeTile(s)
  })
  useLayoutEffect(() => keepUnderPointer(), [index])

  function finish(cancel: boolean) {
    const s = session.current
    if (!s) return
    session.current = null
    s.cleanup()
    if (!s.started) return
    released.current = tilePosition(s)
    api.end(id, cancel)
    if (reduceMotion) {
      // No travel: the tile is in its slot at once.
      x.set(0)
      y.set(0)
      setPhase('idle')
    } else {
      setPhase('settling')
    }
  }

  function start(s: Session) {
    const tile = tileRef.current
    if (!tile || !api.begin(id)) {
      session.current = null
      s.cleanup()
      return
    }
    // A settle may still be running: take over from where the tile is now.
    x.stop()
    y.stop()
    const rect = tile.getBoundingClientRect()
    s.grabX = s.clientX - rect.left
    s.grabY = s.clientY - rect.top
    s.started = true
    setPhase('dragging')
    s.target.focus({ preventScroll: true })

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      finish(true)
    }
    window.addEventListener('keydown', onKeyDown)

    // Scroll the container while the pointer is near its top or bottom edge.
    function tick(time: number) {
      const current = session.current
      if (!current?.started) return
      const scroller = api.scroller.current!
      const elapsed = current.lastTime === null ? 0 : time - current.lastTime
      current.lastTime = time
      const rect = scroller.getBoundingClientRect()
      const velocity = autoScrollVelocity(
        current.clientY,
        rect.top,
        rect.bottom,
      )
      if (velocity !== 0) {
        const wanted = current.remainder + (velocity * elapsed) / 1000
        const whole = Math.trunc(wanted)
        current.remainder = wanted - whole
        const before = scroller.scrollTop
        scroller.scrollTop = before + whole
        if (scroller.scrollTop !== before) update(current)
      }
      current.frame = requestAnimationFrame(tick)
    }
    s.frame = requestAnimationFrame(tick)

    const cleanup = s.cleanup
    s.cleanup = () => {
      cleanup()
      window.removeEventListener('keydown', onKeyDown)
      cancelAnimationFrame(s.frame)
    }
    update(s)
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.button !== 0 || session.current) return
    // Touch and pen drag from the handle only, so the rest of the tile still
    // scrolls the page. The mouse drags from anywhere on the tile.
    const target = event.target as Element
    if (
      event.pointerType !== 'mouse' &&
      !target.closest('[data-drag-handle]')
    ) {
      return
    }
    const element = event.currentTarget
    element.setPointerCapture(event.pointerId)
    session.current = {
      pointerId: event.pointerId,
      target: element,
      clientX: event.clientX,
      clientY: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      started: false,
      grabX: 0,
      grabY: 0,
      remainder: 0,
      frame: 0,
      lastTime: null,
      cleanup: () => {
        if (element.hasPointerCapture(event.pointerId)) {
          element.releasePointerCapture(event.pointerId)
        }
      },
    }
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    const s = session.current
    if (!s || event.pointerId !== s.pointerId) return
    s.clientX = event.clientX
    s.clientY = event.clientY
    if (s.started) {
      update(s)
    } else if (
      Math.hypot(s.clientX - s.startX, s.clientY - s.startY) >= DRAG_THRESHOLD
    ) {
      start(s)
    }
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    if (session.current?.pointerId === event.pointerId) finish(false)
  }

  function onPointerCancel(event: PointerEvent<HTMLElement>) {
    if (session.current?.pointerId === event.pointerId) finish(true)
  }

  // Settling: the tile is already in its final slot, so only the offset is
  // left. Read the latest settings without restarting the animation when they
  // change.
  const runSettle = useEffectEvent(() => {
    const tile = tileRef.current!
    x.set(released.current.left - tile.offsetLeft)
    y.set(released.current.top - tile.offsetTop)
    let live = true
    const controls = [animate(x, 0, settle), animate(y, 0, settle)]
    Promise.all(controls).then(() => {
      if (live) setPhase('idle')
    })
    return () => {
      live = false
      controls.forEach((control) => control.stop())
    }
  })
  useLayoutEffect(() => {
    if (phase === 'settling') return runSettle()
  }, [phase])

  useEffect(() => () => session.current?.cleanup(), [])

  return {
    x,
    y,
    phase,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  }
}
