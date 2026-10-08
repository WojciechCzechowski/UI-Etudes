import { ImageOff } from 'lucide-react'
import { motion } from 'motion/react'
import {
  useReduceMotion,
  useScaleTransition,
} from '../../shared/demo-controls/DemoSettings'
import { crossfade } from '../../shared/motion'
import { imageFade } from './motion'
import { placeholderSrc } from './photos'
import type { Photo } from './photos'
import type { LoadState } from './useThumbnail'

type ThumbnailProps = { photo: Photo; state: LoadState }

/**
 * A 4:3 box that never changes size. The skeleton, the error and the image
 * all fill it, so loading cannot shift the layout.
 */
export function Thumbnail({ photo, state }: ThumbnailProps) {
  const reduceMotion = useReduceMotion()
  const scale = useScaleTransition()

  return (
    <span className="relative block aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-border)]">
      {state === 'loading' && (
        <span
          data-testid="skeleton"
          className={`absolute inset-0 bg-[var(--color-border)] ${reduceMotion ? '' : 'animate-pulse'}`}
        />
      )}
      {state === 'error' && (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-2 text-center text-xs text-[var(--color-text-muted)]">
          <ImageOff aria-hidden="true" className="size-5" />
          Could not load
        </span>
      )}
      {state === 'loaded' && (
        <motion.img
          src={placeholderSrc(photo)}
          alt=""
          draggable={false}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={scale(reduceMotion ? crossfade : imageFade)}
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </span>
  )
}
