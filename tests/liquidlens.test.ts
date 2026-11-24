import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'

import { glassMaterial } from '../src/components/glass/glass-tokens.ts'

const core = readFileSync(new URL('../vendor/LiquidLens/packages/core/liquid-glass.js', import.meta.url), 'utf8')

// The real vendor engine runs against an instrumented DOM/canvas. No optical code is mocked.
function environment(userAgent = 'Chrome/140.0', reduced = false) {
  const registry = new Map<string, Node>()
  const images: ImageData[] = []
  const callbacks: Array<() => void> = []
  const listeners = new Map<string, Set<unknown>>()
  const mediaListeners: Array<() => void> = []
  const mutations: Array<(records: Array<{ addedNodes: Node[]; removedNodes: Node[] }>) => void> = []
  const preferences = { reduced }

  class Node {
    nodeType = 1
    isConnected = true
    dataset: Record<string, string> = {}
    children: Node[] = []
    innerHTML = ''
    style: Record<string, unknown> & { setProperty: (key: string, value: string) => void; removeProperty: (key: string) => void } = {
      setProperty: (key, value) => { this.style[key] = value },
      removeProperty: (key) => {
        const camelCase = key.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase())
        delete this.style[key]
        delete this.style[camelCase]
      },
    }
    classList = { contains: () => false }
    matches() { return Object.hasOwn(this.dataset, 'glass') }
    querySelectorAll(): Node[] { return this.children.flatMap((node) => [...(node.matches() ? [node] : []), ...node.querySelectorAll()]) }
    setAttribute(key: string, value: string) { if (key === 'id') registry.set(value, this) }
    appendChild(node: Node) { this.children.push(node) }
    contains(node: Node): boolean { return this === node || this.children.some((child) => child.contains(node)) }
    remove() {
      this.isConnected = false
      for (const [key, node] of registry) if (node === this) registry.delete(key)
    }
    getBoundingClientRect() { return { width: 160, height: 64 } }
  }
  const body = new Node()
  const surface = new Node()
  surface.dataset.glass = ''
  body.appendChild(surface)
  const document = {
    body, readyState: 'complete', documentElement: new Node(),
    getElementById: (id: string) => registry.get(id),
    querySelectorAll: () => body.querySelectorAll().filter((node) => node.isConnected),
    createElementNS: () => new Node(),
    createElement: () => ({
      width: 0, height: 0,
      getContext: () => ({
        createImageData: (width: number, height: number) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) }),
        putImageData: (image: ImageData) => images.push(image),
      }),
      toDataURL: () => 'data:image/png;base64,AA==',
    }),
  }
  const window = {
    addEventListener: (event: string, callback: unknown) => {
      if (!listeners.has(event)) listeners.set(event, new Set())
      listeners.get(event)?.add(callback)
    },
    removeEventListener: (event: string, callback: unknown) => listeners.get(event)?.delete(callback),
    matchMedia: (query: string) => ({
      matches: query.includes('reduced-transparency') && preferences.reduced,
      addEventListener: (_event: string, callback: () => void) => mediaListeners.push(callback),
      removeEventListener: () => {},
    }),
    ResizeObserver: true, MutationObserver: true,
  }
  const context = {
    window, document, navigator: { userAgent }, innerWidth: 1000, innerHeight: 800,
    getComputedStyle: () => ({ borderTopLeftRadius: '24px' }),
    ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
    MutationObserver: class {
      constructor(callback: typeof mutations[number]) { mutations.push(callback) }
      observe() {} disconnect() {}
    },
    setTimeout: () => 1, clearTimeout: () => {},
    requestAnimationFrame: (callback: () => void) => { callbacks.push(callback); return callbacks.length },
    cancelAnimationFrame: () => {},
    LiquidGlass: undefined as unknown as {
      init: (options?: object) => void; apply: (element: Node) => void; destroy: () => void
    },
  }
  runInNewContext(core, context)
  return {
    engine: context.LiquidGlass, surface, registry, images, preferences, mediaListeners, mutations, listeners,
    flush: () => { while (callbacks.length) callbacks.shift()?.() },
    wrapper: () => new Node(),
  }
}

test('Chromium uses the original displacement engine with non-neutral edge pixels', () => {
  const env = environment()
  env.engine.init(glassMaterial)
  assert.match(String(env.surface.style.backdropFilter), /blur\(2px\).*url\(#lg/)
  assert.match(env.registry.get(env.surface.dataset.lgId)?.innerHTML || '', /feDisplacementMap.*scale="18"/)
  const image = env.images[0]
  const center = (Math.floor(image.height / 2) * image.width + Math.floor(image.width / 2)) * 4
  assert.equal(image.data[center], 128)
  assert.equal(image.data[center + 1], 128)
  assert.ok(image.data.some((value, index) => index % 4 === 0 && value < 128))
  assert.ok(image.data.some((value, index) => index % 4 === 0 && value > 128))
  const before = env.images.length
  env.engine.init(glassMaterial)
  assert.equal(env.images.length, before, 'repeated init schedules rather than duplicating observers')
})

test('Safari, Firefox and Chrome on iOS use blur/specular without allocating maps', () => {
  for (const agent of ['Version/18 Safari/605', 'Firefox/140', 'iPhone CriOS/140 Safari/605']) {
    const env = environment(agent)
    env.engine.init(glassMaterial)
    assert.match(String(env.surface.style.backdropFilter), /^blur\(2px\) saturate\(1.25\)$/)
    assert.equal(env.images.length, 0)
    assert.equal(env.surface.dataset.lgId, undefined)
  }
})

test('reduced transparency skips maps at startup and releases existing filters when changed', () => {
  const initial = environment('Chrome/140', true)
  initial.engine.init(glassMaterial)
  assert.equal(initial.images.length, 0)
  const env = environment()
  env.engine.init(glassMaterial)
  const id = env.surface.dataset.lgId
  env.preferences.reduced = true
  env.mediaListeners.forEach((callback) => callback())
  env.flush()
  assert.equal(env.registry.has(id), false, 'obsolete filter removed after preference change')
  assert.equal(env.surface.style.backdropFilter, undefined)
})

test('route removal releases maps and engine teardown removes window listeners', () => {
  const env = environment()
  env.engine.init(glassMaterial)
  const id = env.surface.dataset.lgId
  env.surface.isConnected = false
  env.mutations[0]([{ addedNodes: [], removedNodes: [env.surface] }])
  assert.equal(env.registry.has(id), false, 'detached element filter removed')
  env.engine.destroy()
  assert.equal(env.listeners.get('resize')?.size, 0)
  assert.equal(env.listeners.get('pointermove')?.size, 0)
  assert.equal(env.registry.has('lg-filter-root'), false)
})
