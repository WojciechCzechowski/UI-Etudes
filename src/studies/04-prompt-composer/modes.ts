import {
  AudioLines,
  Clock,
  Film,
  Image,
  Layers2,
  Podcast,
  Scaling,
  Tag,
  UserRoundPlus,
  Volume2,
  WandSparkles,
  RectangleHorizontal,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type Mode = 'image' | 'video' | 'lipsync'

export type Slot = { label: string; Icon: LucideIcon }

export type Setting = {
  label: string
  Icon: LucideIcon
  /** Shown muted: the option does not apply to the current model. */
  disabled?: boolean
}

export type ModeConfig = {
  label: string
  /** Chips in the band above the card. */
  suggestions: string[]
  /** Brand Kit pill with a close button. Without it, a prompts button. */
  brandKit: boolean
  slots: Slot[]
  /** No placeholder means no text field. */
  placeholder: string | null
  settings: Setting[]
  credits: string | null
}

export const modeOrder: Mode[] = ['image', 'video', 'lipsync']

const imageRefs: Slot = { label: 'Image refs', Icon: Image }

export const modes: Record<Mode, ModeConfig> = {
  image: {
    label: 'Image',
    suggestions: [
      'Surreal Dreamscape',
      'Cyberpunk Alleyway',
      'Enchanted Forest',
    ],
    brandKit: true,
    slots: [imageRefs],
    placeholder: 'Describe your image or reference by using @...',
    settings: [
      { label: 'GPT Image 2.5 Sunburst', Icon: Image },
      { label: '16:9', Icon: RectangleHorizontal },
      { label: '1K', Icon: Scaling },
      { label: 'High', Icon: Tag },
      { label: '4', Icon: Layers2 },
      { label: 'On', Icon: WandSparkles },
    ],
    credits: '52 left',
  },
  video: {
    label: 'Video',
    suggestions: ['Surreal Dreamscape', 'Cyberpunk Alley', 'Enchanted Forest'],
    brandKit: true,
    slots: [
      { label: 'Start frame', Icon: Image },
      { label: 'End frame', Icon: Image },
      imageRefs,
      { label: 'Video refs', Icon: Film },
      { label: 'Audio refs', Icon: AudioLines },
    ],
    placeholder: 'Describe your video or reference by using @...',
    settings: [
      { label: 'Seedance 2.5', Icon: Film },
      { label: '16:9', Icon: RectangleHorizontal },
      { label: '1080p', Icon: Scaling },
      { label: '4s', Icon: Clock },
      { label: 'On', Icon: Volume2 },
      { label: '1', Icon: Layers2 },
      { label: 'On', Icon: WandSparkles },
    ],
    credits: null,
  },
  lipsync: {
    label: 'Lip sync',
    suggestions: [],
    brandKit: false,
    slots: [
      { label: 'Avatar', Icon: Image },
      { label: 'Speech', Icon: AudioLines },
    ],
    placeholder: null,
    settings: [
      { label: 'HeyGen Avatar 4', Icon: UserRoundPlus },
      { label: '16:9', Icon: RectangleHorizontal },
      { label: '1080p', Icon: Scaling, disabled: true },
      { label: 'Stable', Icon: Podcast },
      { label: '1', Icon: Layers2 },
    ],
    credits: null,
  },
}
