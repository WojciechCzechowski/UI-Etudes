import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'
import { studies } from './src/studies/registry.ts'

// Each study has its own HTML entry in src/studies/<dir>/index.html but is
// served at /<slug>/. In dev the plugin rewrites the URL, in the build it
// moves the emitted HTML. Asset URLs in the HTML are absolute, so moving is safe.
function cleanStudyUrls(): Plugin {
  return {
    name: 'clean-study-urls',
    enforce: 'post',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const match = req.url?.match(/^\/([\w-]+)\/?(\?.*)?$/)
        const study = match && studies.find(({ slug }) => slug === match[1])
        if (study) {
          req.url = `/src/studies/${study.dir}/index.html${match[2] ?? ''}`
        }
        next()
      })
    },
    generateBundle(_options, bundle) {
      for (const { slug, dir } of studies) {
        const from = `src/studies/${dir}/index.html`
        const asset = bundle[from]
        if (!asset) continue
        if (asset.type !== 'asset') continue
        delete bundle[from]
        this.emitFile({
          type: 'asset',
          fileName: `${slug}/index.html`,
          source: asset.source,
        })
      }
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    cleanStudyUrls(),
  ],
  build: {
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        ...Object.fromEntries(
          studies.map(({ slug, dir }) => [
            slug,
            resolve(import.meta.dirname, `src/studies/${dir}/index.html`),
          ]),
        ),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    css: false,
  },
})
