import * as THREE from 'three'

// The toolkit under every item model (VISUALS.md V2.1): small helpers for
// building toon-shaded objects, a library of 2D silhouettes to extrude, and
// pixel "decals" (glyphs painted on a 12 by 12 canvas) for the signature
// details that make an item readable at 24 pixels. Nothing here knows about
// a particular item: itemGenerators.js composes these into families, and
// data/itemModels.js says which family and parameters each item uses.

// ---- Palette (tokens from elementa.css plus the object colors the old sprites already used) ----
export const PAL = {
  ink: '#120c1a',
  white: '#fff4d6',
  gold: '#ffd166',
  goldHi: '#ffe8a3',
  goldLo: '#c46a24',
  gold2: '#f2a93b',
  stone: '#8a80a8',
  stoneLo: '#4a4061',
  iron: '#9aa0a6',
  wood: '#9a5f34',
  woodLo: '#5a3620',
  parch: '#e8dcc0',
  brass: '#c9a46b',
  arcane: '#8f6bff',
  arcaneHi: '#c8b6ff',
  green: '#5fd38a',
  red: '#ff5a5a',
  glass: '#dff3ff',
  navy: '#3d5fa5',
  leather: '#8a5a34',
}

const _a = new THREE.Color()
const _b = new THREE.Color()
export const mixHex = (a, b, t) => '#' + _a.set(a).lerp(_b.set(b), t).getHexString()

// ---- 2D silhouettes, in a -1..1 box, to extrude into chunky pieces ----
const poly = (pts) => {
  const s = new THREE.Shape()
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)))
  s.closePath()
  return s
}
const SHAPES = {
  flame: () => {
    const s = new THREE.Shape()
    s.moveTo(0, 1)
    s.bezierCurveTo(0.25, 0.55, 0.85, 0.3, 0.8, -0.3)
    s.bezierCurveTo(0.75, -0.85, 0.3, -1, 0, -1)
    s.bezierCurveTo(-0.35, -1, -0.8, -0.8, -0.8, -0.25)
    s.bezierCurveTo(-0.8, 0.1, -0.5, 0.25, -0.35, 0.5)
    s.bezierCurveTo(-0.25, 0.2, -0.1, 0.45, 0, 1)
    return s
  },
  drop: () => {
    const s = new THREE.Shape()
    s.moveTo(0, 1)
    s.bezierCurveTo(0.2, 0.5, 0.78, 0.1, 0.7, -0.4)
    s.bezierCurveTo(0.62, -0.85, 0.3, -1, 0, -1)
    s.bezierCurveTo(-0.3, -1, -0.62, -0.85, -0.7, -0.4)
    s.bezierCurveTo(-0.78, 0.1, -0.2, 0.5, 0, 1)
    return s
  },
  bolt: () => poly([[0.15, 1], [-0.7, -0.1], [-0.05, -0.1], [-0.3, -1], [0.7, 0.2], [0.05, 0.2]]),
  heart: () => {
    const s = new THREE.Shape()
    s.moveTo(0, -0.95)
    s.bezierCurveTo(-0.3, -0.7, -1, -0.2, -1, 0.35)
    s.bezierCurveTo(-1, 0.85, -0.35, 1, 0, 0.55)
    s.bezierCurveTo(0.35, 1, 1, 0.85, 1, 0.35)
    s.bezierCurveTo(1, -0.2, 0.3, -0.7, 0, -0.95)
    return s
  },
  feather: () => {
    const s = new THREE.Shape()
    s.moveTo(0, 1.05)
    s.bezierCurveTo(0.7, 0.7, 0.75, -0.3, 0.1, -0.85)
    s.lineTo(0.04, -1.1)
    s.lineTo(-0.04, -1.1)
    s.lineTo(-0.1, -0.85)
    s.bezierCurveTo(-0.75, -0.3, -0.7, 0.7, 0, 1.05)
    return s
  },
  star: () => {
    const pts = []
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / 5
      const r = i % 2 ? 0.42 : 1
      pts.push([Math.cos(a) * r, Math.sin(a) * r])
    }
    return poly(pts)
  },
  leaf: () => {
    const s = new THREE.Shape()
    s.moveTo(0, -1)
    s.bezierCurveTo(0.9, -0.5, 0.9, 0.5, 0, 1)
    s.bezierCurveTo(-0.9, 0.5, -0.9, -0.5, 0, -1)
    return s
  },
  tag: () => poly([[-0.9, 0.55], [0.35, 0.55], [0.95, 0], [0.35, -0.55], [-0.9, -0.55]]),
  anvil: () => poly([[-1, 0.55], [1, 0.55], [1, 0.2], [0.35, 0.05], [0.35, -0.35], [0.7, -0.55], [0.7, -0.8], [-0.7, -0.8], [-0.7, -0.55], [-0.35, -0.35], [-0.35, 0.05], [-0.7, 0.2], [-1, 0.2]]),
  butterfly: () => poly([[0, 0.25], [0.35, 0.95], [1, 0.8], [0.95, 0.1], [0.4, -0.05], [0.9, -0.6], [0.45, -0.95], [0, -0.35], [-0.45, -0.95], [-0.9, -0.6], [-0.4, -0.05], [-0.95, 0.1], [-1, 0.8], [-0.35, 0.95]]),
  owl: () => poly([[-0.75, 1], [-0.45, 0.7], [0.45, 0.7], [0.75, 1], [0.8, 0.3], [0.9, -0.4], [0.55, -1], [-0.55, -1], [-0.9, -0.4], [-0.8, 0.3]]),
  thimble: () => poly([[-0.55, 0.95], [0.55, 0.95], [0.8, -0.2], [0.95, -0.7], [0.95, -1], [-0.95, -1], [-0.95, -0.7], [-0.8, -0.2]]),
  needle: () => poly([[0.08, 1], [0.12, 0.5], [0.12, -0.9], [-0.12, -0.9], [-0.12, 0.5], [-0.08, 1]]),
  bellows: () => poly([[-0.9, 0.7], [0.5, 0.45], [0.5, -0.45], [-0.9, -0.7], [-0.9, -0.2], [-0.55, 0], [-0.9, 0.2]]),
  mirror: () => {
    const s = new THREE.Shape()
    s.moveTo(0, 1)
    s.bezierCurveTo(0.8, 0.9, 0.8, -0.2, 0.15, -0.35)
    s.lineTo(0.15, -1)
    s.lineTo(-0.15, -1)
    s.lineTo(-0.15, -0.35)
    s.bezierCurveTo(-0.8, -0.2, -0.8, 0.9, 0, 1)
    return s
  },
  tablet: () => poly([[-0.7, -1], [0.7, -1], [0.75, 0.45], [0, 1.05], [-0.75, 0.45]]),
  shard: () => poly([[0.1, 1], [0.75, 0.2], [0.35, -0.95], [-0.55, -0.7], [-0.8, 0.1], [-0.3, 0.7]]),
  fan: () => {
    const s = new THREE.Shape()
    s.moveTo(0, -1)
    s.lineTo(-0.95, 0.35)
    s.absarc(0, -1, 1.65, Math.PI * 0.8, Math.PI * 0.2, true)
    s.lineTo(0, -1)
    return s
  },
  epsilon: () => poly([[0.7, 0.85], [0.1, 0.9], [-0.55, 0.55], [-0.7, 0.05], [-0.55, -0.5], [0.1, -0.9], [0.7, -0.85], [0.7, -0.5], [0.15, -0.55], [-0.2, -0.3], [-0.25, -0.12], [0.35, -0.12], [0.35, 0.18], [-0.25, 0.18], [-0.2, 0.32], [0.15, 0.55], [0.7, 0.5]]),
  keyhead: () => {
    const s = new THREE.Shape()
    s.absarc(0, 0.45, 0.5, 0, Math.PI * 2, false)
    s.holes.push((() => { const h = new THREE.Path(); h.absarc(0, 0.45, 0.2, 0, Math.PI * 2, true); return h })())
    return s
  },
}
const shapeCache = new Map()
export function silhouette(name) {
  if (!shapeCache.has(name)) shapeCache.set(name, SHAPES[name]())
  return shapeCache.get(name)
}
export const SHAPE_NAMES = Object.keys(SHAPES)

// ---- Pixel glyphs (decals) ----
// ASCII glyphs: x = foreground, y = second color, k = ink, w = white, . = clear.
const ASCII = {
  eye: ['............', '............', '...xxxxxx...', '..xwwwwwwx..', '.xwwkkkkwwx.', '.xwkkxxkkwx.', '.xwkkxxkkwx.', '.xwwkkkkwwx.', '..xwwwwwwx..', '...xxxxxx...', '............', '............'],
  flame: ['.....x......', '.....xx.....', '....xxx.....', '...xxxxx....', '..xxxyxxx...', '..xxyyyxx...', '.xxxyyyxxx..', '.xxyywyyxx..', '.xxyywyyxx..', '..xxyyyxx...', '...xxxxx....', '............'],
  drop: ['.....x......', '.....x......', '....xxx.....', '....xxx.....', '...xxxxx....', '..xxwxxxx...', '..xwxxxxx...', '..xxxxxxx...', '..xxxxxxx...', '...xxxxx....', '....xxx.....', '............'],
  bolt: ['......xx....', '.....xxx....', '....xxx.....', '...xxx......', '..xxxxxx....', '....xxxx....', '....xxx.....', '...xxx......', '...xx.......', '..xx........', '..x.........', '............'],
  spiral: ['..xxxxxxxx..', '.x........x.', 'x..xxxxxx..x', 'x.x......x.x', 'x.x.xxxx.x.x', 'x.x.x..x.x.x', 'x.x.x.xx.x.x', 'x.x.x....x.x', 'x.x.xxxxxx.x', 'x..x.......x', '.x..xxxxxxx.', '..xx........'],
  wave: ['............', '............', '..xx....xx..', '.xxxx..xxxx.', 'xx..xxxx..xx', 'x....xx....x', '............', '..xx....xx..', '.xxxx..xxxx.', 'xx..xxxx..xx', 'x....xx....x', '............'],
  leaf: ['.........xx.', '.......xxxxx', '.....xxxyxx.', '....xxxyxxx.', '...xxxyxxx..', '..xxxyxxx...', '..xxyxxx....', '.xxyxxx.....', '.xyxx.......', 'xyx.........', 'x...........', '............'],
  gear: ['....xxxx....', '.xx.xxxx.xx.', '.xxxxxxxxxx.', '..xxx..xxx..', 'xxxx....xxxx', 'xxxx....xxxx', 'xxxx....xxxx', 'xxxx....xxxx', '..xxx..xxx..', '.xxxxxxxxxx.', '.xx.xxxx.xx.', '....xxxx....'],
  star5: ['.....xx.....', '.....xx.....', '....xxxx....', 'xxxxxxxxxxxx', '.xxxxxxxxxx.', '..xxxxxxxx..', '...xxxxxx...', '..xxxxxxxx..', '..xxx..xxx..', '.xxx....xxx.', '.xx......xx.', '............'],
  star4: ['.....xx.....', '.....xx.....', '.....xx.....', '....xxxx....', '..xxxxxxxx..', 'xxxxxwwxxxxx', 'xxxxxwwxxxxx', '..xxxxxxxx..', '....xxxx....', '.....xx.....', '.....xx.....', '.....xx.....'],
  foldstar: ['............', '.....x......', '....xxx.....', '...xxxxx....', '..xxxwxxx...', '.xxxxwwxxx..', '..xxxwxxx...', '...xxxxx....', '....xxx.....', '.....x......', '............', '............'],
  skull: ['...xxxxxx...', '..xxxxxxxx..', '.xxxxxxxxxx.', '.xxkkxxkkxx.', '.xxkkxxkkxx.', '.xxxxxkxxxx.', '..xxxxxxxx..', '...xkxkxkx..', '...xkxkxkx..', '............', '............', '............'],
}

// Runes: strokes on the 12 by 12 grid, each [x0, y0, x1, y1].
const RUNE_STROKES = {
  echo: [[3, 2, 3, 9], [3, 2, 8, 2], [3, 5, 7, 5], [3, 9, 8, 9], [9, 3, 9, 8]],
  glass: [[5, 1, 8, 5], [8, 5, 5, 10], [5, 10, 3, 5], [3, 5, 5, 1], [5, 3, 6, 6], [6, 6, 4, 8]],
  kinship: [[2, 4, 6, 4], [2, 8, 6, 8], [2, 4, 2, 8], [6, 4, 6, 8], [5, 6, 9, 6], [9, 3, 9, 9]],
  ember: [[6, 1, 6, 10], [6, 4, 3, 7], [6, 4, 9, 7], [3, 10, 9, 10]],
  anchor: [[6, 1, 6, 10], [3, 4, 9, 4], [2, 8, 6, 10], [10, 8, 6, 10]],
  wild: [[6, 1, 6, 10], [2, 3, 10, 8], [10, 3, 2, 8]],
  gold: [[3, 3, 9, 3], [3, 3, 3, 9], [3, 9, 9, 9], [9, 6, 9, 9], [6, 6, 9, 6]],
  link: [[1, 4, 5, 4], [1, 8, 5, 8], [1, 4, 1, 8], [5, 4, 5, 8], [4, 5, 8, 5], [4, 9, 8, 9], [4, 5, 4, 9], [8, 5, 8, 9]],
  double: [[3, 1, 3, 10], [4, 1, 4, 10], [8, 1, 8, 10], [9, 1, 9, 10], [3, 5, 9, 5]],
}

// Constellation charts: stars as [x, y] and lines as index pairs, per sign.
const SIGNS = {
  kindle: { stars: [[6, 1], [3, 5], [9, 5], [4, 9], [8, 9]], lines: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4]] },
  forge: { stars: [[1, 3], [10, 3], [6, 6], [3, 9], [9, 9]], lines: [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4]] },
  scald: { stars: [[6, 1], [6, 5], [3, 8], [9, 8], [6, 10]], lines: [[0, 1], [1, 2], [1, 3], [1, 4]] },
  mist: { stars: [[2, 7], [5, 4], [8, 5], [10, 8], [6, 9]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]] },
  bloom: { stars: [[6, 10], [6, 6], [3, 3], [9, 3], [6, 1]], lines: [[0, 1], [1, 2], [1, 3], [1, 4]] },
  dust: { stars: [[6, 6], [8, 4], [9, 7], [5, 9], [2, 6], [4, 2]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
  resonance: { stars: [[3, 2], [3, 9], [9, 2], [9, 9]], lines: [[0, 1], [2, 3], [0, 2], [1, 3]] },
  pair: { stars: [[3, 6], [9, 6]], lines: [[0, 1]] },
  three: { stars: [[6, 2], [2, 9], [10, 9]], lines: [[0, 1], [1, 2], [2, 0]] },
  straight: { stars: [[2, 10], [4, 8], [6, 6], [8, 4], [10, 2]], lines: [[0, 1], [1, 2], [2, 3], [3, 4]] },
}
export const SIGN_NAMES = Object.keys(SIGNS)
export const RUNE_NAMES = Object.keys(RUNE_STROKES)

function line(set, x0, y0, x1, y1) {
  let dx = Math.abs(x1 - x0)
  let dy = -Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx + dy
  for (;;) {
    set(x0, y0)
    if (x0 === x1 && y0 === y1) break
    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x0 += sx
    }
    if (e2 <= dx) {
      err += dx
      y0 += sy
    }
  }
}

const decalCache = new Map()
/** A 12 by 12 pixel-art canvas texture for a named glyph. `fg` and `bg` fill the x and y cells. */
export function glyphTexture(name, fg = '#ffffff', bg = '#ffd166') {
  const key = `${name}|${fg}|${bg}`
  if (decalCache.has(key)) return decalCache.get(key)
  const c = document.createElement('canvas')
  c.width = c.height = 12
  const ctx = c.getContext('2d')
  const px = (x, y, color) => {
    ctx.fillStyle = color
    ctx.fillRect(x, y, 1, 1)
  }
  if (ASCII[name]) {
    const colors = { x: fg, y: bg, k: PAL.ink, w: '#ffffff' }
    ASCII[name].forEach((row, y) => [...row].forEach((ch, x) => colors[ch] && px(x, y, colors[ch])))
  } else if (RUNE_STROKES[name]) {
    RUNE_STROKES[name].forEach(([a, b, c2, d]) => line((x, y) => px(x, y, fg), a, b, c2, d))
  } else if (SIGNS[name]) {
    const s = SIGNS[name]
    s.lines.forEach(([a, b]) => line((x, y) => px(x, y, bg), ...s.stars[a], ...s.stars[b]))
    s.stars.forEach(([x, y]) => {
      px(x, y, fg)
      px(x - 1, y, fg)
      px(x + 1, y, fg)
      px(x, y - 1, fg)
      px(x, y + 1, fg)
    })
  }
  const tex = new THREE.CanvasTexture(c)
  tex.magFilter = tex.minFilter = THREE.NearestFilter
  tex.generateMipmaps = false
  tex.colorSpace = THREE.SRGBColorSpace
  decalCache.set(key, tex)
  return tex
}
export const GLYPH_NAMES = [...Object.keys(ASCII), ...RUNE_NAMES.map((n) => n), ...SIGN_NAMES.map((n) => n)]

/** The shared builder context handed to every generator. */
export function makeKit(ramp, colors) {
  const resolve = (c) => colors[c] ?? c
  const flat = (geo) => {
    const g = geo.index ? geo.toNonIndexed() : geo
    g.computeVertexNormals()
    return g
  }
  /** A toon-lit mesh. o.glow = 0..1 self-light, o.op = opacity, o.flat = faceted. */
  const M = (geo, color, o = {}) => {
    const col = new THREE.Color(resolve(color))
    const mat = new THREE.MeshToonMaterial({
      color: col,
      gradientMap: ramp,
      emissive: col,
      emissiveIntensity: o.glow ?? 0,
      transparent: o.op != null,
      opacity: o.op ?? 1,
      depthWrite: o.op == null,
    })
    return new THREE.Mesh(o.flat ? flat(geo) : geo, mat)
  }
  /** An unlit, full-bright mesh for sparks, flames and glints. */
  const G = (geo, color) => new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: resolve(color), toneMapped: false }))
  const at = (o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
    o.position.set(x, y, z)
    o.rotation.set(rx, ry, rz)
    return o
  }
  const grp = (...kids) => {
    const g = new THREE.Group()
    kids.flat().forEach((k) => k && g.add(k))
    return g
  }
  const k = {
    THREE,
    PAL,
    colors,
    c: resolve,
    M,
    G,
    at,
    grp,
    flat,
    box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
    cyl: (rt, rb, h, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s),
    sph: (r, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h),
    cone: (r, h, s = 8) => new THREE.ConeGeometry(r, h, s),
    tor: (R, r, rs = 6, ts = 14) => new THREE.TorusGeometry(R, r, rs, ts),
    ico: (r, d = 0) => new THREE.IcosahedronGeometry(r, d),
    oct: (r) => new THREE.OctahedronGeometry(r, 0),
    dodeca: (r) => new THREE.DodecahedronGeometry(r, 0),
    lathe: (pts, seg = 10) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg),
    ext: (name, depth = 0.4, bevel = 0.07) => {
      const g = new THREE.ExtrudeGeometry(silhouette(name), { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments: 6 })
      g.center()
      return g
    },
    /** A pixel glyph on a flat plane, facing +z. */
    decal: (name, size, fg = '#ffffff', bg = PAL.gold) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        new THREE.MeshBasicMaterial({ map: glyphTexture(name, resolve(fg), resolve(bg)), transparent: true, alphaTest: 0.5, toneMapped: false, side: THREE.DoubleSide }),
      )
      return m
    },
  }
  return k
}
