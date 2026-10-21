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

export type Suggestion = {
  /** The chip's text. */
  label: string
  /** Fills the textbox when the chip is clicked. */
  prompt: string
}

export type Setting = {
  label: string
  Icon: LucideIcon
  /** Shown muted: the option does not apply to the current model. */
  disabled?: boolean
}

export type ModeConfig = {
  label: string
  /** Chips in the band above the card. */
  suggestions: Suggestion[]
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
      {
        label: 'Surreal Dreamscape',
        prompt:
          'A vast, ethereal landscape where gravity seems to bend. Floating islands drift in a sky painted with swirling nebulae of vibrant colors. Strange, bioluminescent flora grows on the islands, casting an otherworldly glow. In the distance, a colossal, crystalline structure pierces the clouds. The overall mood is mysterious and awe-inspiring, with a touch of the uncanny.',
      },
      {
        label: 'Cyberpunk Alleyway',
        prompt:
          'A narrow, rain-slicked alleyway in a futuristic cyberpunk city at night. Neon signs in various Asian languages cast vibrant, distorted reflections on the wet pavement. Steam rises from grates, and holographic advertisements flicker erratically. A lone figure in a trench coat walks away from the camera, silhouetted against the glowing signs.',
      },
      {
        label: 'Enchanted Forest',
        prompt:
          'An ancient, mystical forest bathed in dappled sunlight filtering through a dense canopy. Giant, moss-covered trees with gnarled roots dominate the scene. Luminescent mushrooms and glowing fireflies dot the undergrowth. A small, clear stream meanders through the forest floor, reflecting the magical atmosphere. The air feels thick with ancient magic.',
      },
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
    suggestions: [
      {
        label: 'Surreal Dreamscape',
        prompt:
          'A vast, ethereal landscape where gravity seems to bend. Floating islands drift in a sky painted with swirling nebulae of vibrant colors. Strange, bioluminescent flora grows on the islands, casting an otherworldly glow. In the distance, a colossal, crystalline structure pierces the clouds. The overall mood is mysterious and awe-inspiring, with a touch of the uncanny.',
      },
      {
        label: 'Steampunk Inventor',
        prompt:
          'Portrait of a Victorian-era inventor in their cluttered workshop, surrounded by gears, brass contraptions, and bubbling beakers. They have goggles perched on their forehead and a determined expression. The lighting is warm and dramatic, with shafts of light illuminating dust motes in the air. The style should be photorealistic with a touch of painterly texture.',
      },
      {
        label: 'Cyberpunk Alley',
        prompt:
          'A narrow, rain-slicked alleyway in a futuristic cyberpunk city at night. Neon signs cast vibrant reflections on the wet pavement. Flying vehicles are visible in the distance between towering skyscrapers. A lone figure in a trench coat walks away from the camera. Emphasize atmospheric effects like steam rising from grates and lens flare from the neon lights.',
      },
    ],
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
