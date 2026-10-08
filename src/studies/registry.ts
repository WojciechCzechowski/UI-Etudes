// The list of studies. Read by the Vite config (entries and URLs) and by the
// root index page. Imports nothing, so studies stay independent of each other.
export type StudyEntry = {
  /** URL segment: the study is served at `/<slug>/`. */
  slug: string
  /** Folder name under `src/studies/`. */
  dir: string
  title: string
  summary: string
}

export const studies: StudyEntry[] = [
  {
    slug: 'morphing-dialog',
    dir: '01-morphing-dialog',
    title: 'Morphing button to dialog',
    summary: 'A floating button that grows into a dialog and back.',
  },
  {
    slug: 'reorder-grid',
    dir: '02-reorder-grid',
    title: 'Drag to reorder a thumbnail grid',
    summary: 'Reorder photos by pointer, touch or keyboard. Every tile moves.',
  },
  {
    slug: 'toast-stack',
    dir: '03-toast-stack',
    title: 'Toast stack with interruption handling',
    summary:
      'Notifications that stack, update in place and get out of the way.',
  },
]
