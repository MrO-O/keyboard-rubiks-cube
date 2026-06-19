import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { VitePWA, type ManifestOptions } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export const PWA_MANIFEST: Partial<ManifestOptions> = {
  name: "Keyboard Rubik's Cube",
  short_name: 'Rubik Cube',
  description: "A keyboard-first playable 3D Rubik's cube.",
  display: 'standalone',
  start_url: '.',
  theme_color: '#111827',
  background_color: '#f4f1ea',
  icons: [
    {
      src: 'icons/icon-192.svg',
      sizes: '192x192',
      type: 'image/svg+xml',
      purpose: 'any maskable',
    },
    {
      src: 'icons/icon-512.svg',
      sizes: '512x512',
      type: 'image/svg+xml',
      purpose: 'any maskable',
    },
  ],
}

export function resolveBasePath(value?: string): string {
  const trimmed = value?.trim()
  if (!trimmed || trimmed === '/') return '/'
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = command === 'serve' ? '/' : resolveBasePath(env.VITE_BASE_PATH)

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/favicon.svg'],
        manifest: PWA_MANIFEST,
        devOptions: { enabled: true },
      }),
    ],
    test: {
      environment: 'node',
    },
  }
})
