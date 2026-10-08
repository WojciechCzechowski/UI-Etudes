export type Photo = {
  id: string
  title: string
  /** Drives the colours of the generated placeholder and the load delay. */
  seed: number
}

const titles = [
  'Harbour at 6am',
  'Market stall',
  'Tram stop in the rain',
  'Rooftop laundry',
  'Night bakery',
  'Fog over the river',
  'Bike shop window',
  'Spring allotments',
  'Tiled staircase',
  'Fish counter',
  'Old cinema sign',
  'Courtyard plum tree',
  'Platform 3',
  'Corner kiosk',
  'Wet cobblestones',
  'Reading room',
  'Lighthouse path',
  'Last bus home',
]

export const photos: Photo[] = titles.map((title, index) => ({
  id: `photo-${index + 1}`,
  title,
  seed: index + 1,
}))

/**
 * A generated 4:3 placeholder as a data URI: a gradient with a horizon and a
 * sun. Deterministic per seed. No third-party photos.
 */
export function placeholderSrc({ seed }: Photo): string {
  const hue = (seed * 47) % 360
  const sky = (hue + 40) % 360
  const sunX = 80 + ((seed * 71) % 240)
  const horizon = 150 + ((seed * 29) % 70)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${sky} 70% 72%)"/><stop offset="1" stop-color="hsl(${hue} 65% 52%)"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><circle cx="${sunX}" cy="${horizon - 50}" r="34" fill="hsl(${sky} 90% 90%)" opacity="0.85"/><path d="M0 ${horizon} L90 ${horizon - 36} L170 ${horizon - 6} L260 ${horizon - 48} L400 ${horizon} V300 H0 Z" fill="hsl(${hue} 45% 28%)"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
