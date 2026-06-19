import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PWA_MANIFEST, resolveBasePath } from '../vite.config'

describe('PWA and GitHub Pages configuration', () => {
  it('defines the installable app manifest and required icon sizes', () => {
    expect(PWA_MANIFEST).toMatchObject({
      name: "Keyboard Rubik's Cube",
      short_name: 'Rubik Cube',
      description: "A keyboard-first playable 3D Rubik's cube.",
      display: 'standalone',
      start_url: '.',
    })
    expect(PWA_MANIFEST.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sizes: '192x192' }),
        expect.objectContaining({ sizes: '512x512' }),
      ]),
    )
  })

  it('normalizes an environment-controlled GitHub Pages base path', () => {
    expect(resolveBasePath(undefined)).toBe('/')
    expect(resolveBasePath('keyboard-rubiks-cube')).toBe(
      '/keyboard-rubiks-cube/',
    )
    expect(resolveBasePath('/keyboard-rubiks-cube/')).toBe(
      '/keyboard-rubiks-cube/',
    )
  })

  it('includes a GitHub Pages workflow using official actions', () => {
    const workflowPath = resolve('.github/workflows/deploy.yml')
    expect(existsSync(workflowPath)).toBe(true)
    const workflow = readFileSync(workflowPath, 'utf8')
    expect(workflow).toContain('push:')
    expect(workflow).toContain('main')
    expect(workflow).toContain('actions/configure-pages@')
    expect(workflow).toContain('actions/upload-pages-artifact@')
    expect(workflow).toContain('actions/deploy-pages@')
  })

  it('documents GitHub Pages deployment and browser-local data', () => {
    const readme = readFileSync(resolve('README.md'), 'utf8')
    expect(readme).toContain('## Deploy to GitHub Pages')
    expect(readme).toContain('GitHub Actions')
    expect(readme).toContain('localStorage')
    expect(readme).toMatch(/no\s+cloud sync/)
  })
})
