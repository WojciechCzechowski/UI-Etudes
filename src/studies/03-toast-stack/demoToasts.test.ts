import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { startUpload } from './demoToasts'
import { createToastStore } from './toastStore'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('startUpload', () => {
  it('follows one toast from progress to done', () => {
    const store = createToastStore()
    startUpload(store, { durationMs: 1000, fail: false })
    const [toast] = store.getState().active

    vi.advanceTimersByTime(500)
    expect(store.getState().active[0]).toMatchObject({
      id: toast.id,
      kind: 'progress',
      progress: 0.5,
    })

    vi.advanceTimersByTime(500)
    expect(store.getState().active).toHaveLength(1)
    expect(store.getState().active[0]).toMatchObject({
      id: toast.id,
      kind: 'success',
      title: '3 files uploaded',
    })
  })

  it('turns the same toast into an error when the upload fails', () => {
    const store = createToastStore()
    startUpload(store, { durationMs: 1000, fail: true })
    const [toast] = store.getState().active

    vi.advanceTimersByTime(1000)

    expect(store.getState().active).toHaveLength(1)
    expect(store.getState().active[0]).toMatchObject({
      id: toast.id,
      kind: 'error',
      title: 'Upload failed',
    })
  })

  it('shows the result in a new toast if the first one was dismissed', () => {
    const store = createToastStore()
    startUpload(store, { durationMs: 1000, fail: true })
    store.dismiss(store.getState().active[0].id)

    vi.advanceTimersByTime(1000)

    expect(store.getState().active).toHaveLength(1)
    expect(store.getState().active[0]).toMatchObject({
      kind: 'error',
      title: 'Upload failed',
    })
  })

  it('stops when asked to', () => {
    const store = createToastStore()
    const stop = startUpload(store, { durationMs: 1000, fail: false })

    stop()
    vi.advanceTimersByTime(2000)

    expect(store.getState().active[0].kind).toBe('progress')
  })
})
