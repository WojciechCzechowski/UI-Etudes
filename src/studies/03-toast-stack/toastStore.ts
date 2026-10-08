import { announcementFor } from './announcements'
import type { Announcement } from './announcements'

// The state of the toast stack. The reducer is pure: time is passed in, so
// every timer rule can be tested without waiting. `createToastStore` wraps it
// with the real timeouts and the announcements.

export type ToastKind = 'info' | 'success' | 'error' | 'progress'

/** Why the timers are stopped. They run only while no reason is active. */
export type PauseReason = 'hover' | 'focus' | 'touch' | 'hidden'

export type ToastInput = {
  kind: ToastKind
  title: string
  description?: string
  /** 0 to 1 for a determinate bar. Left out for an indeterminate one. */
  progress?: number
}

export type Toast = ToastInput & {
  id: string
  /** Time left on the timer, in ms. Infinity when the toast has no timer. */
  remaining: number
  /** Clock time at which the timer last started, null while it is stopped. */
  startedAt: number | null
}

export type ToastState = {
  /** Oldest first. Capped at `maxActive`. */
  active: Toast[]
  /** Waiting for a free slot. First in, first out, errors first. */
  queue: Toast[]
  pauses: PauseReason[]
}

export const MAX_ACTIVE = 3

// How long each kind stays. Errors stay longer because they need reading and
// often a reaction. Progress stays until it is updated to another kind.
export const durations: Record<ToastKind, number> = {
  info: 5000,
  success: 5000,
  error: 8000,
  progress: Infinity,
}

export const initialState: ToastState = { active: [], queue: [], pauses: [] }

export type ToastAction =
  | { type: 'show'; toast: Toast; now: number; maxActive: number }
  | { type: 'update'; id: string; patch: Partial<ToastInput>; now: number }
  | { type: 'dismiss'; id: string; now: number; maxActive: number }
  | { type: 'dismissAll' }
  | { type: 'pause'; reason: PauseReason; now: number }
  | { type: 'resume'; reason: PauseReason; now: number }

function isRunning(state: ToastState) {
  return state.pauses.length === 0
}

// Starts the timer of a toast, unless the toast has none or time is paused.
function start(toast: Toast, running: boolean, now: number): Toast {
  const startedAt = running && Number.isFinite(toast.remaining) ? now : null
  return { ...toast, startedAt }
}

// Stops the timer and keeps what is left of it.
function stop(toast: Toast, now: number): Toast {
  if (toast.startedAt === null) return toast
  const remaining = Math.max(0, toast.remaining - (now - toast.startedAt))
  return { ...toast, remaining, startedAt: null }
}

function fillFromQueue(
  state: ToastState,
  now: number,
  maxActive: number,
): ToastState {
  const active = [...state.active]
  const queue = [...state.queue]
  while (active.length < maxActive && queue.length > 0) {
    active.push(start(queue.shift()!, isRunning(state), now))
  }
  return { ...state, active, queue }
}

// An error goes ahead of everything that is not an error, so it is not stuck
// behind a burst of low value toasts. Errors keep their order among themselves.
function enqueue(queue: Toast[], toast: Toast): Toast[] {
  if (toast.kind !== 'error') return [...queue, toast]
  const firstOther = queue.findIndex(({ kind }) => kind !== 'error')
  const at = firstOther === -1 ? queue.length : firstOther
  return [...queue.slice(0, at), toast, ...queue.slice(at)]
}

// A change to what the toast says gives it a fresh timer. A change to the
// progress alone does not, otherwise a slow upload would never end.
function restartsTimer(patch: Partial<ToastInput>) {
  return 'kind' in patch || 'title' in patch || 'description' in patch
}

export function toastReducer(
  state: ToastState,
  action: ToastAction,
): ToastState {
  switch (action.type) {
    case 'show': {
      if (state.active.length < action.maxActive) {
        const toast = start(action.toast, isRunning(state), action.now)
        return { ...state, active: [...state.active, toast] }
      }
      return { ...state, queue: enqueue(state.queue, action.toast) }
    }

    case 'update': {
      const knows = (toast: Toast) => toast.id === action.id
      if (!state.active.some(knows) && !state.queue.some(knows)) return state
      const restart = restartsTimer(action.patch)
      const active = state.active.map((toast) => {
        if (!knows(toast)) return toast
        const next = { ...toast, ...action.patch }
        if (!restart) return next
        const fresh = { ...next, remaining: durations[next.kind] }
        return start(fresh, isRunning(state), action.now)
      })
      const queue = state.queue.map((toast) => {
        if (!knows(toast)) return toast
        const next = { ...toast, ...action.patch }
        return restart ? { ...next, remaining: durations[next.kind] } : next
      })
      return { ...state, active, queue }
    }

    case 'dismiss': {
      const knows = (toast: Toast) => toast.id === action.id
      if (!state.active.some(knows) && !state.queue.some(knows)) return state
      const next = {
        ...state,
        active: state.active.filter((toast) => !knows(toast)),
        queue: state.queue.filter((toast) => !knows(toast)),
      }
      return fillFromQueue(next, action.now, action.maxActive)
    }

    case 'dismissAll':
      return { ...state, active: [], queue: [] }

    case 'pause': {
      if (state.pauses.includes(action.reason)) return state
      const pauses = [...state.pauses, action.reason]
      if (state.pauses.length > 0) return { ...state, pauses }
      return {
        ...state,
        pauses,
        active: state.active.map((toast) => stop(toast, action.now)),
      }
    }

    case 'resume': {
      if (!state.pauses.includes(action.reason)) return state
      const pauses = state.pauses.filter((reason) => reason !== action.reason)
      if (pauses.length > 0) return { ...state, pauses }
      return {
        ...state,
        pauses,
        active: state.active.map((toast) => start(toast, true, action.now)),
      }
    }
  }
}

// What the live regions should say after a state change. A toast is announced
// when it becomes active and again whenever its words change. A change to the
// progress alone is not announced, it would be noise.
export function announcementsBetween(
  before: ToastState,
  after: ToastState,
): Announcement[] {
  const previous = new Map(before.active.map((toast) => [toast.id, toast]))
  return after.active.flatMap((toast) => {
    const old = previous.get(toast.id)
    const changed =
      !old ||
      old.kind !== toast.kind ||
      old.title !== toast.title ||
      old.description !== toast.description
    return changed ? [announcementFor(toast)] : []
  })
}

export type ToastStore = {
  getState: () => ToastState
  subscribe: (listener: () => void) => () => void
  /** Called once for every sentence the live regions should say. */
  subscribeAnnouncements: (
    listener: (announcement: Announcement) => void,
  ) => () => void
  show: (input: ToastInput) => string
  update: (id: string, patch: Partial<ToastInput>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
  pause: (reason: PauseReason) => void
  resume: (reason: PauseReason) => void
}

export function createToastStore(maxActive = MAX_ACTIVE): ToastStore {
  let state = initialState
  let nextId = 1
  const listeners = new Set<() => void>()
  const announcementListeners = new Set<(announcement: Announcement) => void>()
  // One timeout per running toast. `startedAt` and `remaining` tell a stale
  // one from a current one.
  const timers = new Map<
    string,
    {
      handle: ReturnType<typeof setTimeout>
      startedAt: number
      remaining: number
    }
  >()

  function syncTimers() {
    for (const [id, timer] of timers) {
      const toast = state.active.find((toast) => toast.id === id)
      if (
        toast?.startedAt === timer.startedAt &&
        toast.remaining === timer.remaining
      ) {
        continue
      }
      clearTimeout(timer.handle)
      timers.delete(id)
    }
    for (const toast of state.active) {
      if (toast.startedAt === null || timers.has(toast.id)) continue
      const left = toast.remaining - (Date.now() - toast.startedAt)
      timers.set(toast.id, {
        startedAt: toast.startedAt,
        remaining: toast.remaining,
        handle: setTimeout(() => dismiss(toast.id), Math.max(0, left)),
      })
    }
  }

  function dispatch(action: ToastAction) {
    const before = state
    state = toastReducer(state, action)
    if (state === before) return
    syncTimers()
    listeners.forEach((listener) => listener())
    for (const announcement of announcementsBetween(before, state)) {
      announcementListeners.forEach((listener) => listener(announcement))
    }
  }

  function dismiss(id: string) {
    dispatch({ type: 'dismiss', id, now: Date.now(), maxActive })
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    subscribeAnnouncements(listener) {
      announcementListeners.add(listener)
      return () => announcementListeners.delete(listener)
    },
    show(input) {
      const id = String(nextId++)
      const toast: Toast = {
        ...input,
        id,
        remaining: durations[input.kind],
        startedAt: null,
      }
      dispatch({ type: 'show', toast, now: Date.now(), maxActive })
      return id
    },
    update(id, patch) {
      dispatch({ type: 'update', id, patch, now: Date.now() })
    },
    dismiss,
    dismissAll() {
      dispatch({ type: 'dismissAll' })
    },
    pause(reason) {
      dispatch({ type: 'pause', reason, now: Date.now() })
    },
    resume(reason) {
      dispatch({ type: 'resume', reason, now: Date.now() })
    },
  }
}
