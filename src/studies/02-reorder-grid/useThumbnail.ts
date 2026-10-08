import { useEffect, useState } from 'react'
import type { Photo } from './photos'

export type Loading = 'instant' | 'normal' | 'slow'
export type LoadState = 'loading' | 'loaded' | 'error'

/** The photo that fails when "Make one thumbnail fail" is on. */
export const FAILING_PHOTO_ID = 'photo-4'

// A fixed spread per photo, so every tile finishes at a different time and a
// reload looks the same each run.
function delayFor({ seed }: Photo, loading: Loading): number {
  if (loading === 'instant') return 0
  const spread = (seed * 397) % 1000
  return loading === 'slow' ? 1500 + spread * 3 : 300 + spread
}

/**
 * Simulates a thumbnail request. The result is tied to `reloadKey`, so a new
 * key goes back to loading without a state update in the effect.
 */
export function useThumbnail(
  photo: Photo,
  loading: Loading,
  failOne: boolean,
  reloadKey: number,
): LoadState {
  const [loadedKey, setLoadedKey] = useState<number | null>(null)
  const delay = delayFor(photo, loading)

  useEffect(() => {
    if (delay === 0) return
    const timer = setTimeout(() => setLoadedKey(reloadKey), delay)
    return () => clearTimeout(timer)
  }, [delay, reloadKey])

  const done = delay === 0 || loadedKey === reloadKey
  if (!done) return 'loading'
  return failOne && photo.id === FAILING_PHOTO_ID ? 'error' : 'loaded'
}
