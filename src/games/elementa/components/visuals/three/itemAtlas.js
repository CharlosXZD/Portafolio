import * as THREE from 'three'

// Low-resolution 3D items (VISUALS.md V1 spike 2). One shared WebGL
// renderer draws a small parametric object from several angles, each frame
// is shrunk to NATIVE x NATIVE pixels, cleaned up like pixel art (hard
// alpha, a limited palette, a 1px ink outline) and kept in a sprite atlas.
// The game then only copies frames out of a cached 2D canvas: no live 3D
// per item, one WebGL context for the whole game, and the same atlas serves
// every copy of an item. Light comes from the top left, like the sprites.

export const NATIVE = 24 // final pixel size of one frame (matches the 24x24 relic spec in ASSETS.md)
export const FRAMES = 24 // angles per full turn
const SUPER = 96 // supersampled render size, shrunk to NATIVE for clean edges
const INK = [0x12, 0x0c, 0x1a]
const LEVELS = 5 // palette steps per channel

// Rarity -> how much the object itself glows (the halo is drawn by CSS).
const EMISSIVE = { common: 0, uncommon: 0.1, rare: 0.16, epic: 0.22, legendary: 0.3, mythic: 0.36 }

let shared = null
function sharedRenderer() {
  if (shared) return shared
  const canvas = document.createElement('canvas')
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(1)
  renderer.setSize(SUPER, SUPER, false)
  renderer.setClearColor(0x000000, 0)
  const ramp = new THREE.DataTexture(new Uint8Array([105, 165, 215, 255]), 4, 1, THREE.RedFormat)
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter
  ramp.needsUpdate = true
  shared = { renderer, ramp }
  return shared
}

function toon(color, ramp, rarity, extra = {}) {
  const c = new THREE.Color(color)
  return new THREE.MeshToonMaterial({
    color: c,
    gradientMap: ramp,
    emissive: c,
    emissiveIntensity: EMISSIVE[rarity] ?? 0,
    ...extra,
  })
}

const lathe = (points, segments = 8) => new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments)

// Each builder returns a Group sitting around the origin, tilted a little so
// the top is visible. `flat` shading keeps the facets crisp at 24px.
const BUILDERS = {
  // A brilliant-cut gem: pavilion, girdle, crown, table.
  gem(color, ramp, rarity) {
    const g = new THREE.Group()
    const geo = lathe(
      [
        [0, -1],
        [0.92, 0.02],
        [0.92, 0.2],
        [0.56, 0.58],
        [0, 0.58],
      ],
      8,
    )
    geo.computeVertexNormals()
    g.add(new THREE.Mesh(geo, toon(color, ramp, rarity, { flatShading: true })))
    const table = new THREE.Mesh(new THREE.CircleGeometry(0.5, 8), toon(new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.55), ramp, rarity))
    table.rotation.x = -Math.PI / 2
    table.position.y = 0.585
    g.add(table)
    g.rotation.x = 0.38
    return g
  },
  // A round flask with a neck, a cork and a liquid inside.
  potion(color, ramp, rarity) {
    const g = new THREE.Group()
    const body = []
    for (let i = 0; i <= 10; i++) {
      const a = -Math.PI / 2 + (i / 10) * (Math.PI * 0.86)
      body.push([Math.max(0.001, Math.cos(a) * 0.82), Math.sin(a) * 0.82 - 0.2])
    }
    body.push([0.24, 0.62], [0.24, 0.98], [0.32, 1.02], [0.32, 1.1])
    const glass = new THREE.Mesh(
      lathe(body, 10),
      new THREE.MeshToonMaterial({ color: '#dff3ff', gradientMap: ramp, transparent: true, opacity: 0.4, depthWrite: false }),
    )
    g.add(glass)
    const liquid = []
    for (let i = 0; i <= 8; i++) {
      const a = -Math.PI / 2 + (i / 8) * (Math.PI * 0.62)
      liquid.push([Math.max(0.001, Math.cos(a) * 0.72), Math.sin(a) * 0.72 - 0.2])
    }
    liquid.push([0.001, liquid[liquid.length - 1][1]])
    g.add(new THREE.Mesh(lathe(liquid, 10), toon(color, ramp, rarity)))
    const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.3, 8), toon('#a8744a', ramp, 'common'))
    cork.position.y = 1.2
    g.add(cork)
    g.rotation.x = 0.3
    return g
  },
  // A twenty-sided die.
  die(color, ramp, rarity) {
    const g = new THREE.Group()
    g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), toon(color, ramp, rarity, { flatShading: true })))
    g.rotation.x = 0.55
    g.rotation.z = 0.2
    return g
  },
}

function frameToPixels(renderer, scratch, sctx, small, mctx) {
  sctx.clearRect(0, 0, SUPER, SUPER)
  sctx.drawImage(renderer.domElement, 0, 0)
  // Two halvings keep edges clean without a custom filter.
  mctx.clearRect(0, 0, NATIVE * 2, NATIVE * 2)
  mctx.imageSmoothingQuality = 'high'
  mctx.drawImage(scratch, 0, 0, NATIVE * 2, NATIVE * 2)
  small.clearRect(0, 0, NATIVE, NATIVE)
  small.imageSmoothingQuality = 'high'
  small.drawImage(mctx.canvas, 0, 0, NATIVE, NATIVE)
  return small.getImageData(0, 0, NATIVE, NATIVE)
}

// Hard alpha, a limited palette, then a 1px ink outline around the shape.
function pixelate(img) {
  const { data } = img
  const solid = new Uint8Array(NATIVE * NATIVE)
  const step = 255 / (LEVELS - 1)
  for (let i = 0; i < NATIVE * NATIVE; i++) {
    const o = i * 4
    if (data[o + 3] < 100) {
      data[o + 3] = 0
      continue
    }
    solid[i] = 1
    data[o] = Math.round(data[o] / step) * step
    data[o + 1] = Math.round(data[o + 1] / step) * step
    data[o + 2] = Math.round(data[o + 2] / step) * step
    data[o + 3] = 255
  }
  for (let y = 0; y < NATIVE; y++) {
    for (let x = 0; x < NATIVE; x++) {
      const i = y * NATIVE + x
      if (solid[i]) continue
      const near = (x > 0 && solid[i - 1]) || (x < NATIVE - 1 && solid[i + 1]) || (y > 0 && solid[i - NATIVE]) || (y < NATIVE - 1 && solid[i + NATIVE])
      if (near) {
        const o = i * 4
        data[o] = INK[0]
        data[o + 1] = INK[1]
        data[o + 2] = INK[2]
        data[o + 3] = 255
      }
    }
  }
  return img
}

const cache = new Map()
const stats = new Map()

/** Cost numbers for every atlas built so far (the Visual Lab shows them). */
export function getAtlasStats() {
  return [...stats.entries()].map(([key, s]) => ({ key, ...s }))
}

/**
 * Builds (once) and returns the atlas for an item: a canvas of FRAMES frames
 * side by side, plus its cost. Resolves to null when WebGL is missing, so the
 * caller can fall back to the sprite.
 */
export function getAtlas({ shape, color, rarity = 'common' }) {
  const key = `${shape}|${color}|${rarity}`
  if (cache.has(key)) return cache.get(key)
  const job = new Promise((resolve) => {
    // Never block the click that asked for it: build on the next frame.
    requestAnimationFrame(() => {
      try {
        const t0 = performance.now()
        const { renderer, ramp } = sharedRenderer()
        const build = BUILDERS[shape]
        if (!build) return resolve(null)
        const scene = new THREE.Scene()
        const item = build(color, ramp, rarity)
        const holder = new THREE.Group()
        holder.add(item)
        scene.add(holder)
        // Centre the object so it turns around the middle of its box.
        const box = new THREE.Box3().setFromObject(holder)
        item.position.sub(box.getCenter(new THREE.Vector3()))
        // Fit the widest extent of the turning object, not its corner-to-corner diagonal.
        const size = box.getSize(new THREE.Vector3())
        const half = (Math.max(size.x, size.y, size.z) / 2) * (NATIVE / (NATIVE - 3))
        const camera = new THREE.OrthographicCamera(-half, half, half, -half, 0.1, 20)
        camera.position.set(0, 0, 8)
        scene.add(new THREE.HemisphereLight('#ffffff', '#6a5a8a', 0.7))
        const sun = new THREE.DirectionalLight('#fff4e0', 2.6)
        sun.position.set(-3, 4, 5) // top left
        scene.add(sun)

        const atlas = document.createElement('canvas')
        atlas.width = NATIVE * FRAMES
        atlas.height = NATIVE
        const actx = atlas.getContext('2d')
        const scratch = document.createElement('canvas')
        scratch.width = scratch.height = SUPER
        const sctx = scratch.getContext('2d')
        const mid = document.createElement('canvas')
        mid.width = mid.height = NATIVE * 2
        const mctx = mid.getContext('2d')
        const smallCanvas = document.createElement('canvas')
        smallCanvas.width = smallCanvas.height = NATIVE
        const small = smallCanvas.getContext('2d', { willReadFrequently: true })

        for (let f = 0; f < FRAMES; f++) {
          holder.rotation.y = (f / FRAMES) * Math.PI * 2
          renderer.render(scene, camera)
          const img = pixelate(frameToPixels(renderer, scratch, sctx, small, mctx))
          actx.putImageData(img, f * NATIVE, 0)
        }
        scene.traverse((o) => {
          o.geometry?.dispose()
          o.material?.dispose?.()
        })
        const ms = performance.now() - t0
        stats.set(key, { ms, frames: FRAMES, native: NATIVE, bytes: atlas.width * atlas.height * 4 })
        resolve({ canvas: atlas, ms })
      } catch {
        resolve(null)
      }
    })
  })
  cache.set(key, job)
  return job
}

/** Microseconds to copy one frame from an atlas onto a canvas, averaged. */
export async function benchmarkDraw(spec, runs = 2000) {
  const atlas = await getAtlas(spec)
  if (!atlas) return null
  const c = document.createElement('canvas')
  c.width = c.height = NATIVE
  const ctx = c.getContext('2d')
  const t0 = performance.now()
  for (let i = 0; i < runs; i++) {
    ctx.clearRect(0, 0, NATIVE, NATIVE)
    ctx.drawImage(atlas.canvas, (i % FRAMES) * NATIVE, 0, NATIVE, NATIVE, 0, 0, NATIVE, NATIVE)
  }
  return ((performance.now() - t0) / runs) * 1000
}
