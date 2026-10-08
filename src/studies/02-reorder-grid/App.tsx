import { useState } from 'react'
import type { ReactNode } from 'react'
import { PageShell } from '../../shared/PageShell'
import { DemoControls } from '../../shared/demo-controls/DemoControls'
import { defaultGridSettings, describeGrid, GridControls } from './GridControls'
import { photos } from './photos'
import { ReorderGrid } from './ReorderGrid'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 leading-relaxed">{children}</div>
    </section>
  )
}

const list = 'list-disc space-y-2 pl-5'

export function App() {
  const [grid, setGrid] = useState(defaultGridSettings)
  // A new key makes every thumbnail load again.
  const [reloadKey, setReloadKey] = useState(0)

  return (
    <PageShell title="Drag to reorder a thumbnail grid">
      <div className="flex flex-col gap-3 leading-relaxed">
        <p>
          Reorder the photos by dragging them, by touch, or from the keyboard.
          While you move one, every other tile slides to its new place, so you
          can see the whole result before you let go.
        </p>
      </div>

      <div className="mt-6">
        <ReorderGrid
          initialPhotos={photos}
          loading={grid.loading}
          failOne={grid.failOne}
          reloadKey={reloadKey}
          columns={grid.columns}
        />
      </div>

      <Section title="What the motion communicates">
        <ul className={list}>
          <li>
            Where it will land. A dashed outline marks the slot the tile will
            drop into, and it moves as you cross from slot to slot.
          </li>
          <li>
            What moved. The tiles that make room slide to their new places, so
            the new order is visible before you drop.
          </li>
          <li>
            That it is yours. The dragged tile is lifted by a shadow and follows
            the pointer exactly. On release it settles into its slot.
          </li>
        </ul>
      </Section>

      <Section title="What this study covers">
        <ul className={list}>
          <li>
            <strong>Pointer and touch.</strong> With a mouse, drag from anywhere
            on a tile. On touch, drag from the grip in the corner, so the rest
            of the tile still scrolls the page.
          </li>
          <li>
            <strong>Keyboard.</strong> Tab to the grid, move between tiles with
            the arrow keys, press Space or Enter to pick one up, move it with
            the arrow keys in two dimensions, and press Space or Enter to drop
            it. Escape puts it back where it was.
          </li>
          <li>
            <strong>Screen readers.</strong> Each tile announces its position.
            Picking up, every step, dropping and cancelling are announced.
          </li>
          <li>
            <strong>Auto-scroll.</strong> Hold a tile near the top or bottom
            edge of the grid and it scrolls.
          </li>
          <li>
            <strong>Loading.</strong> Tiles show a skeleton, then the image
            fades in. The tile never changes size.
          </li>
          <li>
            <strong>Responsive columns.</strong> The column count follows the
            width. Resize the window while holding a tile.
          </li>
          <li>
            <strong>Reduced motion.</strong> Tiles do not travel. A tile that
            changes place fades in again instead. The dragged tile still follows
            the pointer.
          </li>
        </ul>
      </Section>

      <Section title="How to try it and check it">
        <p>
          Open the gear in the top-right corner. While it is closed, a small
          text next to it lists every setting that differs from its default.
        </p>
        <ul className={list}>
          <li>
            <strong>Image loading.</strong> Instant, normal or slow. Reload
            images to watch the skeletons again.
          </li>
          <li>
            <strong>Make one image fail.</strong> The fourth tile shows an
            error. It can still be moved.
          </li>
          <li>
            <strong>Columns.</strong> Force 2, 4 or 6 columns to check keyboard
            movement in each layout.
          </li>
          <li>
            <strong>Preview reduced motion, Theme, Slow motion.</strong> Shared
            by every study.
          </li>
        </ul>
      </Section>

      <DemoControls tweaks={describeGrid(grid)}>
        <GridControls
          value={grid}
          onChange={(next) => {
            // Image settings only show on a fresh load.
            if (
              next.loading !== grid.loading ||
              next.failOne !== grid.failOne
            ) {
              setReloadKey((key) => key + 1)
            }
            setGrid(next)
          }}
          onReload={() => setReloadKey((key) => key + 1)}
        />
      </DemoControls>
    </PageShell>
  )
}
