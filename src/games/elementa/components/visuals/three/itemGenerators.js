// Item generator families (VISUALS.md V2.1). Each family is a function from
// parameters to a THREE.Group built with the toolkit in itemKit.js: every
// relic, consumable, rune, Constellation, Totem and Law is one family plus
// its parameters in data/itemModels.js, never a bespoke model. Objects sit
// around the origin, about two units tall at most, y up, light from the top
// left. Colors are names ('main', 'mainHi', 'mainLo', 'trim', 'gold', ...) or
// hex; `main` is the item's element color (or a neutral tone) and `trim` is
// its rarity color, so rarity and element read without any new colors.

const TAU = Math.PI * 2

// ---- Details every family can carry (p.d is a list of names) ----
const DETAILS = {
  // Four colored sparks around the item.
  sparks: (k) => k.grp([[0.8, 0.7, 0.3, 'gold'], [-0.85, 0.2, 0.2, 'mainHi'], [0.6, -0.55, 0.45, 'white'], [-0.5, 0.85, -0.3, 'main']].map(([x, y, z, c]) => k.at(k.G(k.box(0.14, 0.14, 0.14), c), x, y, z, 0.3, 0.5, 0.2))),
  // A bright glint on the upper left.
  glint: (k) => k.at(k.G(k.box(0.22, 0.22, 0.05), 'white'), -0.55, 0.65, 0.65, 0, 0, Math.PI / 4),
  // A thin band in the rarity color around the middle.
  band: (k) => k.at(k.M(k.tor(0.95, 0.07, 5, 16), 'trim', { glow: 0.3 }), 0, 0, 0, Math.PI / 2),
  // Cracks of light on the front.
  cracks: (k) => k.grp(k.at(k.G(k.box(0.07, 0.8, 0.05), 'glow'), -0.15, 0.1, 0.9, 0, 0, 0.35), k.at(k.G(k.box(0.07, 0.5, 0.05), 'glow'), 0.25, -0.2, 0.9, 0, 0, -0.5)),
  // A small gold lightning arc beside the item.
  bolt: (k) => k.at(k.G(k.ext('bolt', 0.12, 0.02), 'gold'), 0.85, 0.6, 0.2, 0, 0, -0.2),
  // A little anemone: glowing tentacles on top.
  anemone: (k) => k.grp([-0.25, 0, 0.25].map((x, i) => k.at(k.G(k.cone(0.07, 0.5 - Math.abs(x) * 0.5, 4), i === 1 ? 'white' : 'mainHi'), x, 0.8, 0.1, 0, 0, -x))),
  // Light split into four colors.
  rays: (k) => k.grp(['fire', 'earth', 'water', 'air'].map((c, i) => k.at(k.G(k.box(1.3, 0.12, 0.08), c), 1.15, 0.4 - i * 0.28, 0.3, 0, 0, 0.2 - i * 0.14))),
  // The four element colors hovering over the item.
  fourcolors: (k) => k.grp(['fire', 'water', 'earth', 'air'].map((c, i) => k.at(k.G(k.box(0.2, 0.2, 0.2), c), Math.cos(i * 1.57 + 0.4) * 0.75, 1.1 + Math.sin(i * 1.57 + 0.4) * 0.2, Math.sin(i * 1.57 + 0.4) * 0.5, 0.3, 0.4, 0.2))),
  // A bright star at the tip.
  starglow: (k) => k.at(k.G(k.ext('star', 0.1, 0.02), 'gold'), 0, 0.95, 0.25, 0, 0, 0.2),
  // Two tiny bone dice.
  dicepair: (k) => k.grp(k.at(k.M(k.box(0.3, 0.3, 0.3), 'parch'), -0.2, -0.1, 0.1, 0.4, 0.5, 0), k.at(k.M(k.box(0.3, 0.3, 0.3), 'parch'), 0.2, 0.1, 0.1, 0.2, 0.9, 0.3)),
  // A thin cage of wire around the item.
  cage: (k) => k.grp([0, 1, 2].map((i) => k.at(k.M(k.tor(1.1, 0.03, 3, 18), 'iron'), 0, 0, 0, 0.4, i * 1.05, 0))),
  // A ribbon tied round the item.
  ribbon: (k) => k.grp(k.at(k.M(k.tor(0.7, 0.06, 4, 14), 'red'), 0, -0.05, 0, Math.PI / 2), k.at(k.M(k.box(0.18, 0.4, 0.06), 'red'), -0.12, -0.35, 0.72, 0, 0, 0.3), k.at(k.M(k.box(0.18, 0.4, 0.06), 'red'), 0.12, -0.35, 0.72, 0, 0, -0.3)),
}

// ---- gem ----
function gem(k, p) {
  const g = k.grp()
  const cut = p.cut ?? 'facet'
  if (cut === 'facet') {
    const geo = k.lathe([[0.001, -1], [0.92, 0.02], [0.92, 0.2], [0.56, 0.58], [0.001, 0.58]], p.sides ?? 8)
    g.add(k.M(geo, 'main', { flat: true, glow: p.glow ?? 0.1 }))
    g.add(k.at(k.M(new k.THREE.CircleGeometry(0.5, p.sides ?? 8), 'mainHi'), 0, 0.585, 0, -Math.PI / 2))
    g.rotation.x = 0.38
  } else if (cut === 'round') {
    g.add(k.M(k.ico(0.9, 1), 'main', { flat: true, glow: p.glow ?? 0.1 }))
  } else if (cut === 'rough') {
    const m = k.M(k.dodeca(0.9), 'main', { flat: true })
    m.scale.set(1, 1.15, 0.9)
    g.add(m, k.at(k.M(k.oct(0.4), 'mainHi', { flat: true }), 0.6, -0.4, 0.3, 0.3, 0.4, 0.2), k.at(k.M(k.oct(0.3), 'mainLo', { flat: true }), -0.65, -0.55, 0.2, 0.1, 0.2, -0.3))
  } else if (cut === 'prism') {
    g.add(k.M(k.cyl(0.8, 0.8, 1.9, 3), 'main', { flat: true, glow: 0.2 }), k.at(k.G(k.box(0.14, 1.5, 0.05), 'white'), -0.1, 0, 0.62))
    g.rotation.set(0.15, 0.2, 0.1)
  } else if (cut === 'cabochon') {
    g.add(k.M(k.lathe([[0.001, 0.9], [0.5, 0.78], [0.85, 0.4], [0.95, 0], [0.95, -0.25], [0.001, -0.25]], 12), 'main', { glow: 0.12 }))
  } else {
    // shard, heart, drop: an extruded silhouette
    g.add(k.M(k.ext(cut, p.depth ?? 0.5, 0.1), 'main', { flat: true, glow: p.glow ?? 0.1 }))
  }
  return g
}

// ---- flask: bottles, vials, crucibles and capsules ----
function flask(k, p) {
  const g = k.grp()
  const body = p.body ?? 'round'
  const glass = p.glass ?? 'glass'
  const profile = {
    round: [[0.001, -1], [0.55, -0.9], [0.82, -0.45], [0.82, 0], [0.55, 0.45], [0.26, 0.62], [0.26, 1], [0.33, 1.04], [0.33, 1.14]],
    tall: [[0.001, -1], [0.4, -0.95], [0.55, -0.6], [0.55, 0.3], [0.38, 0.55], [0.22, 0.65], [0.22, 1.05], [0.3, 1.1], [0.3, 1.2]],
    vial: [[0.001, -0.95], [0.4, -0.9], [0.45, -0.7], [0.45, 0.5], [0.3, 0.7], [0.3, 0.95], [0.38, 1], [0.38, 1.1]],
    bottle: [[0.001, -1], [0.6, -0.95], [0.7, -0.7], [0.7, 0.1], [0.45, 0.45], [0.3, 0.7], [0.3, 1], [0.38, 1.05], [0.38, 1.15]],
    dropper: [[0.001, -1], [0.62, -0.95], [0.72, -0.7], [0.72, 0.2], [0.36, 0.4], [0.36, 0.6]],
    capsule: [[0.001, -1.05], [0.35, -0.95], [0.5, -0.6], [0.5, 0.6], [0.35, 0.95], [0.001, 1.05]],
    crucible: [[0.001, -0.7], [0.45, -0.68], [0.78, -0.3], [0.95, 0.3], [1, 0.62], [0.9, 0.62], [0.001, 0.62]],
  }[body]
  g.add(k.M(k.lathe(profile, 12), glass, { op: body === 'crucible' ? 1 : 0.42 }))
  if (body === 'crucible') {
    g.children[0].material.color.set(k.c('stone'))
    g.children[0].material.emissive.set(k.c('stoneLo'))
    g.add(k.at(k.G(new k.THREE.CircleGeometry(0.88, 12), p.liquid ?? 'main'), 0, 0.64, 0, -Math.PI / 2))
    g.add(k.at(k.M(k.tor(0.95, 0.07, 4, 14), 'trim', { glow: 0.3 }), 0, 0.62, 0, Math.PI / 2))
    ;[-0.55, 0.55].forEach((x) => g.add(k.at(k.M(k.cyl(0.07, 0.07, 0.6, 4), 'ink'), x, -0.9, 0)))
  } else {
    const lvl = p.level ?? 0.55
    const top = -1 + lvl * 1.6
    const liquid = profile.filter(([, y]) => y <= top).map(([r, y]) => [Math.max(0.001, r - 0.09), y])
    liquid.push([0.001, top])
    g.add(k.M(k.lathe(liquid, 12), p.liquid ?? 'main', { glow: p.glow ?? 0.25 }))
    if (body !== 'dropper') g.add(k.at(k.M(k.cyl(0.26, 0.2, 0.32, 8), p.cork ?? 'wood'), 0, profile[profile.length - 1][1] + 0.1, 0))
    else g.add(k.at(k.M(k.sph(0.38, 8, 6), 'ink'), 0, 0.95, 0))
  }
  if (p.swirl) g.add(k.at(k.decal('spiral', 0.9, p.swirl, 'white'), 0, -0.2, 0.83))
  if (p.bubbles) [[0.2, 0.2], [-0.15, 0.45], [0.1, 0.7]].forEach(([x, y]) => g.add(k.at(k.G(k.box(0.1, 0.1, 0.1), 'white'), x, y, 0.4)))
  g.rotation.x = 0.25
  return g
}

// ---- scrolls and charts ----
function scroll(k, p) {
  const g = k.grp()
  if (p.kind === 'fold') {
    g.add(k.M(k.box(1.7, 1.2, 0.14), p.paper ?? 'parch'))
    g.add(k.at(k.M(k.box(0.08, 1.2, 0.18), 'woodLo'), 0, 0, 0.02))
    g.add(k.at(k.M(k.box(0.04, 1.2, 0.18), 'ink'), -0.55, 0, 0.02), k.at(k.M(k.box(0.04, 1.2, 0.18), 'ink'), 0.55, 0, 0.02))
    if (p.decal) g.add(k.at(k.decal(p.decal, 0.9, p.fg ?? 'white', p.bg ?? 'gold'), 0.3, 0, 0.1))
    g.rotation.set(0.3, 0.4, 0)
  } else {
    const roll = k.M(k.cyl(0.45, 0.45, 1.5, 10), p.paper ?? 'parch')
    roll.rotation.z = Math.PI / 2
    g.add(roll)
    ;[-0.78, 0.78].forEach((x) => g.add(k.at(k.M(k.cyl(0.3, 0.3, 0.12, 8), p.cap ?? 'woodLo'), x, 0, 0, 0, 0, Math.PI / 2)))
    g.add(k.at(k.M(k.tor(0.46, 0.07, 4, 12), p.tie ?? 'red'), 0.1, 0, 0, 0, Math.PI / 2))
    g.add(k.at(k.M(k.tor(0.46, 0.07, 4, 12), p.tie ?? 'red'), -0.4, 0, 0, 0, Math.PI / 2))
    if (p.decal) g.add(k.at(k.decal(p.decal, 0.55, p.fg ?? 'white', p.bg ?? 'gold'), 0.55, 0.05, 0.44, 0, 0.3, 0))
    g.rotation.set(0.5, -0.4, 0.5)
  }
  return g
}

// ---- tools and small hardware ----
function tool(k, p) {
  const g = k.grp()
  const kind = p.kind
  if (kind === 'chisel') {
    g.add(k.at(k.M(k.box(0.34, 1.1, 0.14), 'iron'), 0, 0.3, 0), k.at(k.M(k.box(0.36, 0.2, 0.16), 'white'), 0, 0.88, 0))
    g.add(k.at(k.M(k.cyl(0.22, 0.2, 0.9, 8), 'wood'), 0, -0.65, 0), k.at(k.M(k.tor(0.22, 0.05, 4, 10), 'trim', { glow: 0.3 }), 0, -0.25, 0, Math.PI / 2))
    g.rotation.z = -0.5
  } else if (kind === 'plumb') {
    g.add(k.at(k.M(k.cone(0.55, 1.2, 8), 'iron'), 0, -0.45, 0, Math.PI))
    g.add(k.at(k.M(k.cyl(0.55, 0.55, 0.2, 8), 'iron'), 0, 0.15, 0), k.at(k.M(k.cyl(0.04, 0.04, 0.9, 4), 'parch'), 0, 0.7, 0), k.at(k.M(k.tor(0.12, 0.04, 4, 8), 'trim'), 0, 1.15, 0))
  } else if (kind === 'anchor') {
    g.add(k.at(k.M(k.cyl(0.1, 0.1, 1.7, 6), 'iron'), 0, 0, 0), k.at(k.M(k.tor(0.2, 0.07, 4, 10), 'iron'), 0, 0.95, 0))
    g.add(k.at(k.M(k.box(0.9, 0.12, 0.12), 'iron'), 0, 0.55, 0))
    const arc = k.M(new k.THREE.TorusGeometry(0.65, 0.1, 5, 12, Math.PI), 'iron')
    g.add(k.at(arc, 0, -0.3, 0, 0, 0, Math.PI))
    ;[-0.65, 0.65].forEach((x) => g.add(k.at(k.M(k.cone(0.2, 0.35, 4), 'iron'), x, -0.28, 0, 0, 0, x > 0 ? 0 : 0)))
    g.add(k.at(k.M(k.tor(0.95, 0.05, 4, 16), 'trim', { glow: 0.3 }), 0, 0, -0.05))
  } else if (kind === 'latch') {
    g.add(k.M(k.box(1.4, 0.3, 0.14), 'brass'), k.at(k.M(k.box(0.5, 0.7, 0.14), 'brass'), -0.55, 0.1, 0))
    g.add(k.at(k.M(k.box(1.0, 0.16, 0.14), 'goldHi'), 0.2, 0.35, 0.05, 0, 0, 0.5))
    g.add(k.at(k.M(k.cyl(0.07, 0.07, 0.2, 6), 'ink'), -0.55, 0.1, 0.1, Math.PI / 2))
  } else if (kind === 'vane') {
    g.add(k.at(k.M(k.cyl(0.07, 0.09, 1.9, 6), 'brass'), 0, -0.05, 0), k.at(k.M(k.sph(0.16, 6, 5), 'goldHi'), 0, 0.95, 0))
    g.add(k.at(k.M(k.cone(0.2, 0.55, 4), 'brass'), 0.75, 0.55, 0, 0, 0, -Math.PI / 2), k.at(k.M(k.box(1.2, 0.1, 0.1), 'brass'), 0.1, 0.55, 0))
    g.add(k.at(k.M(k.box(0.5, 0.35, 0.08), 'brass'), -0.55, 0.55, 0))
    g.add(k.at(k.M(k.box(0.7, 0.08, 0.08), 'brass'), 0, -0.5, 0), k.at(k.M(k.box(0.08, 0.7, 0.08), 'brass'), 0, -0.5, 0))
  } else if (kind === 'tongs') {
    ;[0.35, -0.35].forEach((a) => g.add(k.at(k.M(k.box(0.14, 1.9, 0.12), 'iron'), 0, 0, 0, 0, 0, a)))
    g.add(k.at(k.M(k.cyl(0.12, 0.12, 0.2, 6), 'ink'), 0, 0.15, 0, Math.PI / 2))
  } else if (kind === 'weights') {
    ;[-0.5, 0.5].forEach((x) => g.add(k.at(k.M(k.cyl(0.38, 0.5, 0.9, 8), 'iron'), x, -0.3, 0), k.at(k.M(k.tor(0.14, 0.05, 4, 8), 'parch'), x, 0.28, 0)))
    g.add(k.at(k.M(new k.THREE.TorusGeometry(0.5, 0.04, 4, 14, Math.PI), 'parch'), 0, 0.28, 0))
  } else if (kind === 'loom') {
    g.add(k.at(k.M(k.box(1.8, 0.14, 0.14), 'wood'), 0, 0.8, 0), k.at(k.M(k.box(1.8, 0.14, 0.14), 'wood'), 0, -0.8, 0))
    ;[-0.85, 0.85].forEach((x) => g.add(k.at(k.M(k.box(0.14, 1.74, 0.14), 'woodLo'), x, 0, 0)))
    for (let i = 0; i < 6; i++) g.add(k.at(k.G(k.box(0.05, 1.5, 0.05), 'gold'), -0.6 + i * 0.24, 0, 0.05))
    g.add(k.at(k.M(k.box(1.5, 0.16, 0.2), 'trim', { glow: 0.2 }), 0, 0.1, 0.1))
    g.rotation.set(0.15, 0.5, 0)
  } else if (kind === 'bellows') {
    g.add(k.M(k.ext('bellows', 0.7, 0.08), 'wood'), k.at(k.M(k.cyl(0.14, 0.2, 0.7, 6), 'iron'), 0.95, 0, 0, 0, 0, Math.PI / 2))
    g.add(k.at(k.M(k.box(0.12, 0.55, 0.9), 'woodLo'), -0.2, 0.4, 0, 0, 0, 0.1))
    g.rotation.set(0.2, 0.4, 0)
  }
  return g
}

// ---- coins and seals ----
function coin(k, p) {
  const g = k.grp()
  const stack = p.stack ?? 1
  const base = p.color ?? 'main'
  if (p.pile) {
    // Three standing stacks of coins of different heights.
    ;[[-0.7, 3, 0.1], [0.05, 5, 0.3], [0.75, 2, 0]].forEach(([x, n, z]) => {
      for (let i = 0; i < n; i++) g.add(k.at(k.M(k.cyl(0.52, 0.52, 0.18, 12), i % 2 ? 'goldHi' : 'gold', { glow: 0.12 }), x, -0.95 + i * 0.2, z))
    })
    g.rotation.x = 0.45
    return g
  }
  for (let i = 0; i < stack; i++) {
    const c = k.M(k.cyl(0.9, 0.9, p.seal ? 0.3 : 0.2, p.seal ? 10 : 14), base, { glow: 0.1 })
    c.rotation.x = Math.PI / 2
    c.position.z = (i - (stack - 1) / 2) * 0.28
    g.add(c)
    const rim = k.M(k.tor(0.88, 0.07, 4, p.seal ? 10 : 16), p.seal ? base : 'trim', { glow: p.seal ? 0 : 0.3 })
    rim.position.z = c.position.z
    g.add(rim)
  }
  const z = ((stack - 1) / 2) * 0.28 + (p.seal ? 0.17 : 0.12)
  if (p.front) g.add(k.at(k.decal(p.front, p.seal ? 1.1 : 1.0, p.fg ?? 'white', p.bg ?? 'ink'), 0, 0, z))
  if (p.back) g.add(k.at(k.decal(p.back, 1.0, p.fg ?? 'white', p.bg ?? 'ink'), 0, 0, -z, 0, Math.PI))
  if (p.seal) g.add(k.at(k.M(k.box(0.12, 0.7, 0.05), 'parch'), 0.35, -1, -0.1, 0, 0, 0.2))
  g.rotation.x = 0.0
  return g
}

// ---- tomes ----
function tome(k, p) {
  const g = k.grp()
  g.add(k.M(k.box(1.45, 1.8, 0.5), p.cover ?? 'main'))
  g.add(k.at(k.M(k.box(1.3, 1.65, 0.38), 'parch'), 0.07, 0, 0))
  g.add(k.at(k.M(k.box(0.14, 1.8, 0.56), p.spine ?? 'woodLo'), -0.66, 0, 0))
  g.add(k.at(k.M(k.box(1.0, 0.1, 0.06), 'trim', { glow: 0.3 }), 0.15, 0.6, 0.26), k.at(k.M(k.box(1.0, 0.1, 0.06), 'trim', { glow: 0.3 }), 0.15, -0.6, 0.26))
  if (p.decal) g.add(k.at(k.decal(p.decal, 0.8, p.fg ?? 'white', p.bg ?? 'gold'), 0.15, 0, 0.27))
  if (p.marks) for (let i = 0; i < 4; i++) g.add(k.at(k.M(k.box(0.06, 0.2, 0.52), i % 2 ? 'red' : 'gold'), 0.55, 0.9 - i * 0.02, 0, 0))
  g.rotation.set(0.25, -0.5, 0)
  return g
}

// ---- pouches ----
function pouch(k, p) {
  const g = k.grp()
  g.add(k.M(k.lathe([[0.001, -0.95], [0.55, -0.9], [0.9, -0.5], [0.85, 0], [0.6, 0.45], [0.3, 0.7], [0.001, 0.7]], 10), p.color ?? 'leather'))
  g.add(k.at(k.M(k.tor(0.34, 0.1, 5, 10), 'trim', { glow: 0.2 }), 0, 0.62, 0, Math.PI / 2))
  g.add(k.at(k.M(k.cone(0.5, 0.55, 8), p.color ?? 'leather'), 0, 0.98, 0, 0, 0, 0.15))
  if (p.patch) g.add(k.at(k.M(k.box(0.5, 0.45, 0.08), 'parch'), 0.35, -0.2, 0.78, 0, 0.3, 0.2), k.at(k.M(k.box(0.5, 0.04, 0.1), 'ink'), 0.35, -0.2, 0.8, 0, 0.3, 0.2))
  if (p.shards) [[0.1, 1.25, 0, 'gold'], [-0.18, 1.15, 0.1, 'mainHi'], [0.3, 1.12, 0.1, 'white']].forEach(([x, y, z, c]) => g.add(k.at(k.M(k.oct(0.2), c, { glow: 0.3 }), x, y, z, 0.3, 0.4, 0)))
  return g
}

// ---- crowns and temples ----
function crown(k, p) {
  const g = k.grp()
  if (p.kind === 'temple') {
    // A tiny temple: steps, four tall columns with empty tops, a shallow roof.
    g.add(k.at(k.M(k.box(2.1, 0.2, 1.3), 'stone'), 0, -1.0, 0), k.at(k.M(k.box(1.9, 0.18, 1.1), 'stoneLo'), 0, -0.82, 0))
    ;[-0.78, -0.26, 0.26, 0.78].forEach((x, i) => {
      g.add(k.at(k.M(k.cyl(0.13, 0.15, 1.45, 6), 'parch'), x, -0.05, 0.1))
      g.add(k.at(k.M(k.box(0.34, 0.1, 0.34), 'parch'), x, 0.7, 0.1), k.at(k.G(k.box(0.12, 0.12, 0.12), p.gems?.[i] ?? 'trim'), x, 0.98, 0.1, 0.3, 0.4, 0))
    })
    g.add(k.at(k.M(k.box(2.0, 0.2, 1.1), 'stone'), 0, 0.82, 0), k.at(k.M(k.cone(1.1, 0.4, 4), 'stone'), 0, 1.12, 0, 0, Math.PI / 4, 0))
    g.rotation.set(0.25, 0.1, 0)
    return g
  }
  const n = p.points ?? 5
  g.add(k.at(k.M(k.cyl(0.95, 0.95, 0.5, 14), 'main'), 0, -0.45, 0))
  g.add(k.at(k.M(k.tor(0.95, 0.07, 4, 16), 'trim', { glow: 0.3 }), 0, -0.2, 0, Math.PI / 2), k.at(k.M(k.tor(0.95, 0.07, 4, 16), 'trim', { glow: 0.3 }), 0, -0.7, 0, Math.PI / 2))
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU
    const tall = p.circlet ? 0.28 : i % 2 ? 0.6 : 0.95
    g.add(k.at(k.M(k.cone(0.24, tall + 0.4, 5), 'main'), Math.cos(a) * 0.82, -0.2 + tall / 2 + 0.2, Math.sin(a) * 0.82))
    const gc = p.gems?.[i % p.gems.length]
    g.add(k.at(k.M(k.sph(0.13, 6, 5), gc ?? 'white', { glow: 0.6 }), Math.cos(a) * 0.82, -0.2 + tall + 0.4, Math.sin(a) * 0.82))
  }
  if (p.notches) for (let i = 0; i < 9; i++) g.add(k.at(k.M(k.box(0.05, 0.3, 0.05), 'goldLo'), Math.cos((i / 9) * TAU) * 0.97, -0.45, Math.sin((i / 9) * TAU) * 0.97, 0, -(i / 9) * TAU, 0))
  g.rotation.x = 0.4
  return g
}

// ---- rings, knots and bells ----
function ring(k, p) {
  const g = k.grp()
  const kind = p.kind ?? 'band'
  if (kind === 'knot') {
    g.add(k.M(new k.THREE.TorusKnotGeometry(0.62, 0.17, 48, 6, 2, 3), 'main', { glow: 0.5 }))
  } else if (kind === 'runes') {
    g.add(k.M(k.tor(0.88, 0.1, 5, 16), 'stoneLo'))
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU
      g.add(k.at(k.M(k.box(0.34, 0.34, 0.3), 'stone'), Math.cos(a) * 0.88, Math.sin(a) * 0.88, 0, 0, 0, a))
      g.add(k.at(k.G(k.box(0.12, 0.12, 0.05), 'trim'), Math.cos(a) * 0.88, Math.sin(a) * 0.88, 0.17))
    }
    g.add(k.M(k.ico(0.38, 0), 'main', { flat: true, glow: 0.7 }))
  } else if (kind === 'twin') {
    g.add(k.at(k.M(k.tor(0.62, 0.17, 6, 16), 'gold'), -0.35, 0, 0, 0, 0.35), k.at(k.M(k.tor(0.62, 0.17, 6, 16), 'iron'), 0.35, 0, 0, 0, -0.35))
    g.add(k.at(k.G(k.box(0.22, 0.22, 0.5), 'white'), 0, 0, 0))
  } else if (kind === 'setting') {
    g.add(k.at(k.M(k.tor(0.6, 0.16, 6, 14), 'gold'), 0, -0.45, 0, Math.PI / 2 - 0.5))
    g.add(k.at(k.M(k.cyl(0.5, 0.3, 0.3, 8), 'gold'), 0, 0.1, 0))
    ;[-0.35, 0.35].forEach((x) => g.add(k.at(k.M(k.cone(0.13, 0.7, 5), 'gold'), x, 0.6, 0, 0, 0, x > 0 ? -0.2 : 0.2)))
    g.add(k.at(k.G(k.box(0.12, 0.12, 0.12), 'white'), 0, 0.65, 0.3))
  } else if (kind === 'bell') {
    const bell = (r, y) => k.at(k.M(k.lathe([[0.001, r * 1.0], [r * 0.3, r * 0.95], [r * 0.7, r * 0.2], [r * 0.95, -r * 0.7], [r * 1.05, -r * 0.8], [r * 0.9, -r * 0.8], [r * 0.7, -r * 0.2], [r * 0.001, 0]], 10), p.metal ?? 'brass'), 0, y, 0)
    g.add(bell(1.05, 0.1))
    if (p.inner) g.add(k.at(k.M(k.lathe([[0.001, 0.5], [0.2, 0.45], [0.35, 0.05], [0.45, -0.35], [0.001, -0.35]], 8), 'goldLo', { op: 0.9 }), 0, -0.2, 0))
    g.add(k.at(k.M(k.sph(0.22, 6, 5), 'ink'), 0, -0.65, 0))
    if (p.echo) [1.25, 1.55].forEach((r, i) => g.add(k.at(k.G(new k.THREE.TorusGeometry(r, 0.07, 3, 20, Math.PI * 0.45), i ? 'trim' : 'white'), 0, 0.1, 0.2, 0, 0, -Math.PI * 0.22)))
  } else {
    g.add(k.M(k.tor(0.8, 0.16, 6, 16), 'main'))
    g.add(k.at(k.G(k.box(0.5, 0.2, 0.2), 'white'), 0, 0.8, 0.0))
  }
  g.rotation.x = kind === 'bell' ? 0 : 0.35
  return g
}

// ---- hourglass ----
function hourglass(k, p) {
  const g = k.grp()
  g.add(k.at(k.M(k.cyl(0.8, 0.8, 0.16, 12), 'wood'), 0, 1, 0), k.at(k.M(k.cyl(0.8, 0.8, 0.16, 12), 'wood'), 0, -1, 0))
  ;[0, 1, 2].forEach((i) => g.add(k.at(k.M(k.cyl(0.06, 0.06, 2, 4), 'woodLo'), Math.cos((i / 3) * TAU + 0.5) * 0.7, 0, Math.sin((i / 3) * TAU + 0.5) * 0.7)))
  const glass = k.lathe([[0.001, 0.95], [0.6, 0.9], [0.62, 0.4], [0.1, 0.05], [0.62, -0.4], [0.6, -0.9], [0.001, -0.95]], 10)
  g.add(k.M(glass, 'glass', { op: 0.35 }))
  const sand = p.sand ?? 'gold'
  const topLevel = p.top ?? 0.4
  if (topLevel > 0.05) g.add(k.M(k.lathe([[0.001, 0.1 + topLevel * 0.7], [0.5 * (0.2 + topLevel), 0.1 + topLevel * 0.7], [0.05, 0.1], [0.001, 0.1]], 8), sand, { glow: 0.25 }))
  g.add(k.at(k.M(k.cone(0.55, 0.55, 8), sand, { glow: 0.25 }), 0, -0.65, 0))
  g.add(k.at(k.G(k.box(0.05, 0.4, 0.05), sand), 0, -0.1, 0))
  if (p.flow === 'up') g.add(k.at(k.G(k.cone(0.14, 0.3, 4), 'white'), 0, 0.55, 0.3))
  if (p.embers) [[0.2, 0.1], [-0.25, -0.3], [0.1, -0.5]].forEach(([x, y]) => g.add(k.at(k.G(k.box(0.12, 0.12, 0.12), 'gold'), x, y, 0.2)))
  if (p.cracked) g.add(k.at(k.G(k.box(0.05, 1.2, 0.05), 'ink'), 0.3, 0.3, 0.6, 0, 0, 0.3))
  g.rotation.x = 0.15
  return g
}

// ---- clockwork ----
function clock(k, p) {
  const g = k.grp()
  const kind = p.kind
  const cog = (r, teeth, depth, color) => {
    const c = k.grp(k.M(k.cyl(r, r, depth, 14), color))
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * TAU
      c.add(k.at(k.M(k.box(r * 0.38, r * 0.38, depth), color), Math.cos(a) * r * 1.05, 0, Math.sin(a) * r * 1.05, 0, -a, 0))
    }
    c.add(k.at(k.M(k.cyl(r * 0.35, r * 0.35, depth + 0.04, 8), 'ink'), 0, 0, 0))
    c.rotation.x = Math.PI / 2
    return c
  }
  if (kind === 'gear') {
    g.add(cog(0.8, 10, 0.35, p.color ?? 'iron'))
    if (p.hot) g.add(k.at(k.G(k.box(0.07, 0.8, 0.05), 'glow'), -0.1, 0.1, 0.2, 0, 0, 0.4), k.at(k.G(k.box(0.07, 0.6, 0.05), 'glow'), 0.3, -0.2, 0.2, 0, 0, -0.6))
  } else if (kind === 'watch' || kind === 'stopwatch') {
    const body = k.M(k.cyl(0.85, 0.85, 0.4, 16), p.color ?? 'gold')
    body.rotation.x = Math.PI / 2
    g.add(body)
    const face = k.at(k.M(new k.THREE.CircleGeometry(0.72, 16), 'parch'), 0, 0, 0.21)
    g.add(face, k.at(k.M(k.tor(0.85, 0.07, 4, 16), 'trim', { glow: 0.3 }), 0, 0, 0.19))
    g.add(k.at(k.M(k.box(0.07, 0.5, 0.04), 'ink'), 0, 0.2, 0.24), k.at(k.M(k.box(0.35, 0.07, 0.04), 'ink'), 0.15, 0, 0.24))
    ;[0, 1, 2, 3].forEach((i) => g.add(k.at(k.M(k.box(0.06, 0.1, 0.03), 'ink'), Math.sin((i * Math.PI) / 2) * 0.6, Math.cos((i * Math.PI) / 2) * 0.6, 0.23)))
    g.add(k.at(k.M(k.cyl(0.14, 0.14, 0.25, 6), p.color ?? 'gold'), 0, 1.0, 0))
    if (kind === 'watch') g.add(k.at(k.M(k.tor(0.22, 0.05, 4, 8), p.color ?? 'gold'), 0, 1.3, 0), k.at(k.M(new k.THREE.TorusGeometry(0.5, 0.04, 3, 10, Math.PI * 1.4), 'gold'), 0.4, 1.0, 0, 0, 0, 0.3))
    else g.add(k.at(k.M(k.cyl(0.1, 0.1, 0.3, 6), p.color ?? 'gold'), 0.6, 0.75, 0, 0, 0, -0.8), k.at(k.G(k.box(0.12, 0.12, 0.05), 'glow'), 0, 0.45, 0.26))
  } else if (kind === 'gyro') {
    ;[[0.9, 0], [0.7, Math.PI / 2], [0.5, 0.6]].forEach(([r, rot], i) => g.add(k.at(k.M(k.tor(r, 0.07, 5, 16), i === 0 ? 'iron' : i === 1 ? 'trim' : 'mainHi', { glow: i === 1 ? 0.3 : 0 }), 0, 0, 0, 0, rot, i * 0.4)))
    g.add(k.M(k.cyl(0.32, 0.32, 0.12, 10), 'main'), k.at(k.M(k.cyl(0.05, 0.05, 1.9, 4), 'ink'), 0, 0, 0, Math.PI / 2))
    g.add(k.at(k.M(k.sph(0.12, 6, 5), 'white'), 0, 0, 0.1))
  } else if (kind === 'spring') {
    for (let i = 0; i < 7; i++) g.add(k.at(k.M(k.tor(0.55 - Math.abs(i - 3) * 0.04, 0.09, 4, 14), i % 2 ? 'brass' : 'goldHi'), 0, -0.7 + i * 0.24, 0, Math.PI / 2 + 0.15))
    g.add(k.at(k.M(k.cyl(0.07, 0.07, 1.9, 4), 'iron'), 0, 0, 0))
    g.add(k.at(cog(0.45, 8, 0.3, 'gold'), 0.55, -0.9, 0.35))
    g.add(k.at(k.M(k.box(0.7, 0.07, 0.06), 'brass'), 0.5, 0.8, 0, 0, 0, 0.5))
  } else if (kind === 'metronome') {
    g.add(k.M(k.cyl(0.35, 0.95, 1.9, 4), 'wood'))
    g.children[0].rotation.y = Math.PI / 4
    g.add(k.at(k.M(k.box(0.06, 1.6, 0.06), 'brass'), 0.1, 0.3, 0.5, 0, 0, -0.25))
    g.add(k.at(k.M(k.box(0.26, 0.26, 0.26), 'gold', { glow: 0.2 }), 0.18, 0.55, 0.5, 0.3, 0.3, 0))
    g.add(k.at(k.M(k.box(0.7, 0.12, 0.1), 'woodLo'), 0, -0.9, 0.55))
  } else if (kind === 'cuckoo') {
    g.add(k.M(k.box(1.5, 1.2, 0.8), 'wood'), k.at(k.M(k.cone(1.25, 0.8, 4), 'woodLo'), 0, 1.0, 0, 0, Math.PI / 4, 0))
    g.add(k.at(k.M(new k.THREE.CircleGeometry(0.42, 12), 'parch'), 0, -0.1, 0.41), k.at(k.M(k.box(0.06, 0.32, 0.04), 'ink'), 0, 0, 0.44), k.at(k.M(k.box(0.24, 0.06, 0.04), 'ink'), 0.1, -0.1, 0.44))
    g.add(k.at(k.M(k.box(0.4, 0.3, 0.1), 'ink'), 0, 0.72, 0.4), k.at(k.M(k.sph(0.2, 6, 5), 'main'), 0, 0.74, 0.62), k.at(k.M(k.cone(0.07, 0.3, 4), 'gold'), 0, 0.74, 0.88, Math.PI / 2))
    ;[-0.5, 0.5].forEach((x) => g.add(k.at(k.M(k.cone(0.14, 0.4, 5), 'goldLo'), x, -0.95, 0, Math.PI)))
    g.rotation.set(0.15, 0.4, 0)
  }
  if (kind === 'gear' || kind === 'gyro') g.rotation.x = 0.1
  return g
}

// ---- rocks and stones ----
function rock(k, p) {
  const g = k.grp()
  const kind = p.kind
  const jag = (geo, amt = 0.18) => {
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const s = Math.sin(i * 12.9898) * 43758.5453
      const f = 1 + (s - Math.floor(s) - 0.5) * amt
      pos.setXYZ(i, pos.getX(i) * f, pos.getY(i) * f, pos.getZ(i) * f)
    }
    geo.computeVertexNormals()
    return geo
  }
  if (kind === 'boulder' || kind === 'core') {
    const m = k.M(jag(k.ico(0.95, 1), 0.3), kind === 'core' ? 'inkLight' : p.cap ? 'mainLo' : (p.color ?? 'main'), { flat: true })
    m.scale.set(1.05, 0.85, 0.95)
    g.add(m)
    if (p.cap) g.add(k.at(k.M(jag(k.ico(0.7, 1), 0.25), 'main', { flat: true }), 0, 0.28, 0), k.at(k.M(jag(k.ico(0.4, 0), 0.2), 'mainHi', { flat: true }), -0.35, 0.55, 0.3))
    if (p.moss) g.add(k.at(k.M(k.ico(0.7, 1), 'green', { flat: true }), 0, 0.4, 0), k.at(k.M(k.ico(0.35, 0), 'green', { flat: true }), -0.5, 0.2, 0.5))
    if (p.light || kind === 'core') {
      // Thick veins that poke out of the rock so they read at 24 pixels.
      const lava = p.light ?? 'main'
      g.add(k.at(k.G(k.box(0.16, 1.2, 0.3), lava), -0.25, 0.05, 0.78, 0, 0, 0.35), k.at(k.G(k.box(0.14, 0.8, 0.3), lava), 0.35, -0.15, 0.76, 0, 0, -0.55), k.at(k.G(k.box(0.12, 0.6, 0.3), 'gold'), 0.05, 0.45, 0.82, 0, 0, 1.0), k.at(k.G(k.box(0.5, 0.12, 0.3), lava), -0.1, -0.5, 0.74, 0, 0, 0.1))
    }
  } else if (kind === 'river') {
    const m = k.M(k.sph(0.95, 12, 9), 'main')
    m.scale.set(1.1, 0.78, 0.9)
    g.add(m, k.at(k.M(k.sph(0.5, 8, 6), 'mainHi'), -0.25, 0.3, 0.45), k.at(k.decal('wave', 0.8, 'mainHi', 'mainHi'), 0.1, -0.2, 0.76), k.at(k.M(k.cyl(1.0, 1.1, 0.12, 12), 'mainLo'), 0, -0.62, 0))
  } else if (kind === 'slab') {
    g.add(k.at(k.M(k.box(1.8, 0.5, 1.3), 'mainLo'), 0, -0.55, 0), k.at(k.M(k.box(1.6, 0.45, 1.2), 'main'), 0.05, -0.05, 0), k.at(k.M(k.box(1.3, 0.4, 1.0), 'mainHi'), -0.1, 0.38, 0.02, 0, 0.1, 0), k.at(k.M(k.box(0.7, 0.3, 0.7), 'main'), -0.2, 0.7, 0))
    g.rotation.y = 0.5
  } else if (kind === 'stones3') {
    ;[[-0.7, 0.1, 1.5, 0.3], [0.7, 0.2, 1.7, -0.2], [0, -0.05, 1.3, 0.1]].forEach(([x, z, h, r], i) => g.add(k.at(k.M(k.box(0.5, h, 0.4), 'main', { flat: true }), x, -1 + h / 2, z - (i === 2 ? 0.5 : 0), 0, 0, r)))
    g.add(k.at(k.M(k.cyl(1.2, 1.3, 0.15, 12), 'mainLo'), 0, -1.05, 0))
    ;[-0.7, 0.7].forEach((x) => g.add(k.at(k.M(k.box(0.2, 0.1, 0.1), 'green'), x, 0.3, 0.22)))
  } else if (kind === 'arch') {
    g.add(k.M(k.ext('tag', 0.8, 0.08), 'main'))
    g.children[0].rotation.z = Math.PI / 2
    g.add(k.at(k.decal(p.glyph ?? 'star4', 0.7, 'trim', 'white'), 0, 0, 0.5))
  } else if (kind === 'whet') {
    if (p.pips) {
      // Standing, with three pips of light climbing above it.
      g.add(k.at(k.M(k.box(1.1, 1.5, 0.7), p.color ?? 'iron', { flat: true }), 0, -0.2, 0), k.at(k.M(k.box(1.1, 0.12, 0.7), 'white'), 0, 0.56, 0))
      for (let i = 0; i < 3; i++) g.add(k.at(k.G(k.box(0.22, 0.22, 0.22), i === 1 ? 'white' : 'gold'), -0.45 + i * 0.45, 0.95 + (i === 1 ? 0.2 : 0), 0.1, 0.3, 0.4, 0))
      g.add(k.at(k.M(k.box(0.9, 0.1, 0.05), 'trim', { glow: 0.4 }), 0, -0.2, 0.37))
    } else {
      g.add(k.M(k.box(1.8, 0.55, 0.9), p.color ?? 'iron'))
      g.add(k.at(k.M(k.box(1.8, 0.08, 0.9), 'white'), 0, 0.3, 0))
      g.rotation.set(0.5, -0.4, 0.1)
    }
  } else if (kind === 'charm') {
    const m = k.M(k.sph(0.9, 10, 8), p.color ?? 'iron')
    m.scale.set(0.95, 1.05, 0.55)
    g.add(m, k.at(k.decal(p.glyph ?? 'eye', 1.05, 'white', 'white'), 0, 0.05, 0.52))
  } else if (kind === 'runestone') {
    // A pointed standing stone with the rune cut in the front and glowing in the rarity color.
    g.add(k.M(k.ext('tablet', 0.5, 0.1), p.color ?? 'stone', { flat: true }))
    g.add(k.at(k.G(k.box(1.1, 1.5, 0.04), 'inkLight'), 0, -0.15, 0.38))
    g.add(k.at(k.decal(p.glyph, 1.1, 'trim', 'white'), 0, -0.15, 0.42))
    g.add(k.at(k.G(k.box(0.14, 0.14, 0.14), 'trim'), 0.5, 0.75, 0.35, 0.3, 0.4, 0))
  } else if (kind === 'ammonite') {
    g.add(k.at(k.M(k.box(1.9, 1.5, 0.6), 'stone'), 0, 0, -0.1))
    for (let i = 0; i < 5; i++) g.add(k.at(k.M(new k.THREE.TorusGeometry(0.62 - i * 0.1, 0.1, 4, 14, Math.PI * 1.6), 'mainHi'), 0.08 * i, 0.05, 0.25, 0, 0, i * 0.9))
  }
  return g
}

// ---- totem ----
function totem(k, p) {
  const g = k.grp()
  const faces = p.faces ?? ['flame', 'eye', 'drop']
  g.add(k.at(k.M(k.cyl(0.78, 0.9, 0.2, 8), 'stoneLo'), 0, -1.0, 0))
  faces.forEach((f, i) => {
    const y = -0.65 + i * 0.7
    g.add(k.at(k.M(k.box(1.1 - i * 0.1, 0.66, 1.0 - i * 0.1), i % 2 ? 'mainHi' : 'main'), 0, y, 0))
    g.add(k.at(k.M(k.box(1.2 - i * 0.1, 0.07, 1.1 - i * 0.1), 'trim', { glow: 0.3 }), 0, y + 0.34, 0))
    g.add(k.at(k.decal(f, 0.6, 'white', 'ink'), 0, y, 0.56 - i * 0.05))
  })
  g.add(k.at(k.M(k.cone(0.45, 0.5, 4), 'mainLo'), 0, 1.0, 0, 0, Math.PI / 4, 0))
  ;[-0.65, 0.65].forEach((x) => g.add(k.at(k.M(k.box(0.5, 0.18, 0.2), 'mainLo'), x, 0.2, 0)))
  g.rotation.set(0.1, 0.3, 0)
  return g
}

// ---- flat silhouettes, extruded ----
function cut(k, p) {
  const g = k.grp()
  const shape = p.shape
  if (shape === 'clover') {
    // Four hearts, tips together, and a short stem.
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4
      const h = k.M(k.ext('heart', p.depth ?? 0.3, 0.06), i % 2 ? 'green' : 'greenHi', { flat: true, glow: 0.15 })
      h.scale.setScalar(0.62)
      h.position.set(Math.cos(a) * 0.6, Math.sin(a) * 0.6, 0)
      h.rotation.z = a - Math.PI / 2
      g.add(h)
      g.add(k.at(k.M(k.box(0.06, 0.55, 0.05), 'woodLo'), Math.cos(a) * 0.55, Math.sin(a) * 0.55, 0.28, 0, 0, a - Math.PI / 2))
    }
    g.add(k.at(k.M(k.box(0.12, 0.8, 0.12), 'woodLo'), 0.3, -1.05, 0, 0, 0, 0.3))
  } else {
    const body = k.M(k.ext(shape, p.depth ?? 0.35, 0.08), p.color ?? 'main', { flat: true, glow: p.glow ?? 0.12 })
    if (p.flip) body.rotation.z = Math.PI
    if (p.rot) body.rotation.z = p.rot
    if (p.size) body.scale.setScalar(p.size)
    g.add(body)
    if (p.pair) {
      const b2 = body.clone()
      b2.scale.setScalar(0.7)
      b2.position.set(0.95, -0.2, -0.2)
      body.position.x = -0.35
      g.add(b2)
    }
  }
  if (p.disc) g.add(k.at(k.M(k.cyl(1.25, 1.25, 0.1, 18), 'glass', { op: 0.3 }), 0, 0, 0.36, Math.PI / 2), k.at(k.M(k.tor(1.25, 0.06, 3, 18), 'glass'), 0, 0, 0.36))
  if (p.quill) g.add(k.at(k.M(k.box(0.07, 2.0, 0.1), 'ink'), 0.02, -0.05, (p.depth ?? 0.35) / 2 + 0.12, 0, 0, -0.12))
  if (p.ribs) for (let i = -2; i <= 2; i++) g.add(k.at(k.M(k.box(0.05, 1.7, 0.08), 'ink'), Math.sin(i * 0.36) * 0.85, -1 + Math.cos(i * 0.36) * 0.85, (p.depth ?? 0.35) / 2 + 0.1, 0, 0, -i * 0.36))
  if (p.spots) {
    g.add(k.at(k.M(k.box(0.1, 1.5, 0.1), 'ink'), 0, 0, (p.depth ?? 0.35) / 2 + 0.1))
    ;[[-0.6, 0.55], [0.6, 0.55], [-0.5, -0.45], [0.5, -0.45]].forEach(([x, y]) => g.add(k.at(k.G(k.box(0.22, 0.22, 0.05), 'gold'), x, y, (p.depth ?? 0.35) / 2 + 0.12)))
  }
  if (p.inner) {
    const inner = k.G(k.ext(p.inner, (p.depth ?? 0.35) * 0.6, 0.04), p.innerColor ?? 'gold')
    inner.scale.setScalar(0.55)
    inner.position.set(0, -0.15, 0.2)
    g.add(inner)
  }
  if (p.decal) g.add(k.at(k.decal(p.decal, p.decalSize ?? 0.9, p.fg ?? 'white', p.bg ?? 'ink'), 0, p.decalY ?? 0, (p.depth ?? 0.35) / 2 + 0.1))
  if (p.thread) g.add(k.at(k.M(k.tor(p.threadR ?? 0.35, p.threadR ? 0.07 : 0.04, 3, 12), p.thread, { glow: 0.5 }), p.threadR ? 0.45 : 0, p.threadR ? -0.6 : -0.2, 0, Math.PI / 2 - 0.4))
  if (p.pin) g.add(k.at(k.M(k.cyl(0.05, 0.05, 1.1, 4), 'iron'), 0, 0, 0, Math.PI / 2))
  g.rotation.x = 0.1
  return g
}

// ---- orbs ----
function orb(k, p) {
  const g = k.grp()
  g.add(k.M(k.sph(0.85, 12, 10), p.color ?? 'main', { glow: p.glow ?? 0.15 }))
  if (p.halo) g.add(k.at(k.G(k.tor(1.15, 0.05, 3, 24), 'white'), 0, 0, 0, Math.PI / 2 - 0.5, 0.2, 0))
  if (p.rings) g.add(k.at(k.M(k.tor(1.0, 0.06, 4, 20), 'trim', { glow: 0.3 }), 0, 0, 0, Math.PI / 2 - 0.4))
  if (p.glint !== false) g.add(k.at(k.G(k.box(0.2, 0.2, 0.05), 'white'), -0.4, 0.45, 0.7, 0, 0, Math.PI / 4))
  return g
}

// ---- chest ----
function chest(k, p) {
  const g = k.grp()
  g.add(k.at(k.M(k.box(1.8, 0.95, 1.2), 'wood'), 0, -0.4, 0))
  const lid = k.M(new k.THREE.CylinderGeometry(0.62, 0.62, 1.8, 10, 1, false, 0, Math.PI), 'woodLo')
  lid.rotation.set(0, Math.PI / 2, Math.PI / 2)
  lid.position.set(0, 0.08, 0)
  g.add(lid)
  ;[-0.55, 0.55].forEach((x) => g.add(k.at(k.M(k.box(0.14, 1.5, 1.28), 'trim', { glow: 0.2 }), x, -0.1, 0)))
  g.add(k.at(k.M(k.box(0.3, 0.3, 0.1), 'gold'), 0, -0.1, 0.65))
  ;(p.gems ?? []).forEach((c, i) => g.add(k.at(k.M(k.oct(0.17), c, { glow: 0.6 }), -0.3 + i * 0.3, 0.6 - Math.abs(i - 1) * 0.05, 0.6, 0.3, 0.4, 0)))
  g.rotation.set(0.35, -0.5, 0)
  return g
}

// ---- shells ----
function shell(k, p) {
  const g = k.grp()
  if (p.kind === 'conch') {
    // A spiral cone with ridges and a flared pink lip.
    g.add(k.at(k.M(k.cone(0.85, 1.9, 9), 'main'), 0, 0, 0))
    for (let i = 0; i < 5; i++) g.add(k.at(k.M(k.tor(0.8 - i * 0.14, 0.09, 4, 12), i % 2 ? 'mainHi' : 'main', { glow: 0.15 }), 0, -0.75 + i * 0.36, 0, Math.PI / 2 - 0.25))
    g.add(k.at(k.M(new k.THREE.SphereGeometry(0.6, 8, 6, 0, TAU, 0, Math.PI / 2), 'pink'), 0.35, -0.8, 0.4, 0.9, 0, 0))
    g.rotation.set(0.1, 0, -0.5)
  } else {
    const m = k.M(k.lathe([[0.001, 0.2], [0.55, 0.35], [0.95, 0.1], [0.95, -0.05], [0.001, -0.1]], 12), 'main')
    m.rotation.x = Math.PI / 2 - 0.5
    g.add(m)
    for (let i = 0; i < 6; i++) g.add(k.at(k.M(k.box(0.05, 0.05, 0.9), 'mainHi'), Math.cos(i * 0.5 - 1.2) * 0.2, 0, 0, 0, i * 0.5 - 1.2, 0))
    g.add(k.at(k.M(k.cyl(1.2, 1.3, 0.25, 10), 'stoneLo'), 0, -0.7, 0), k.at(k.M(k.tor(1.3, 0.04, 3, 16), 'trim', { glow: 0.3 }), 0, -0.55, 0, Math.PI / 2))
  }
  return g
}

// ---- composites that need their own arrangement ----
function composite(k, p) {
  const g = k.grp()
  const kind = p.kind
  if (kind === 'bundle') {
    for (let i = 0; i < 7; i++) g.add(k.at(k.M(k.cyl(0.09, 0.09, 1.6 - (i % 3) * 0.15, 5), i % 2 ? 'wood' : 'woodLo'), -0.3 + (i % 4) * 0.2, -0.05, Math.floor(i / 4) * 0.2 - 0.1, 0, 0, (i - 3) * 0.04))
    g.add(DETAILS.ribbon(k), k.at(k.G(k.box(0.14, 0.14, 0.14), 'gold'), 0.1, 0.95, 0.1, 0.3, 0.5, 0), k.at(k.G(k.box(0.12, 0.12, 0.12), 'main'), -0.3, 1.1, 0), k.at(k.G(k.box(0.1, 0.1, 0.1), 'white'), 0.35, 1.2, -0.1))
    g.rotation.set(0.3, 0.3, -0.5)
  } else if (kind === 'balance') {
    g.add(k.at(k.M(k.cyl(0.07, 0.1, 1.9, 6), 'brass'), 0, -0.05, 0), k.at(k.M(k.cyl(0.55, 0.65, 0.18, 8), 'brass'), 0, -1, 0))
    const tilt = p.tilt ?? 0
    const beam = k.grp(k.M(k.box(2.0, 0.1, 0.1), 'brass'), k.at(k.M(k.sph(0.12, 6, 5), 'goldHi'), 0, 0, 0))
    beam.position.y = 0.85
    beam.rotation.z = tilt
    ;[[-1, p.leftLoad ?? 0.1], [1, p.rightLoad ?? 0.1]].forEach(([s, load]) => {
      const y = -0.7 + (s < 0 ? -tilt : tilt) * -1 * 0.9
      const pan = k.grp(k.at(k.M(new k.THREE.SphereGeometry(0.55, 10, 4, 0, TAU, Math.PI / 2, Math.PI / 2), 'gold'), 0, -0.55, 0), k.at(k.M(k.cyl(0.02, 0.02, 0.6, 3), 'brass'), -0.2, -0.2, 0, 0, 0, 0.5), k.at(k.M(k.cyl(0.02, 0.02, 0.6, 3), 'brass'), 0.2, -0.2, 0, 0, 0, -0.5))
      if (load) pan.add(k.at(k.M(k.cyl(0.3 * load * 4, 0.3 * load * 4, 0.14, 10), p.loadColor ?? 'goldHi'), 0, -0.45 + load, 0))
      pan.position.set(s * 0.95, y, 0)
      beam.add(pan)
      pan.position.y -= 0.85
    })
    g.add(beam)
    g.rotation.set(0.1, 0.35, 0)
  } else if (kind === 'nest') {
    g.add(k.at(k.M(k.lathe([[0.001, -0.6], [0.7, -0.5], [1, -0.1], [1.05, 0.2], [0.85, 0.2], [0.001, -0.1]], 10), 'woodLo'), 0, -0.2, 0))
    for (let i = 0; i < 8; i++) g.add(k.at(k.M(k.box(0.9, 0.06, 0.06), i % 2 ? 'wood' : 'brass'), Math.cos(i) * 0.1, -0.5 + i * 0.1, 0.6, 0.2, i * 0.8, 0.1))
    g.add(k.at(k.M(k.oct(0.4), 'main', { flat: true, glow: 0.5 }), 0, 0.25, 0, 0.3, 0.4, 0), k.at(k.G(k.box(0.14, 0.14, 0.05), 'white'), -0.12, 0.4, 0.3, 0, 0, Math.PI / 4))
    g.rotation.x = 0.4
  } else if (kind === 'jar') {
    g.add(k.M(k.cyl(0.7, 0.7, 1.5, 12), 'glass', { op: 0.38 }), k.at(k.M(k.cyl(0.68, 0.68, 0.7, 12), 'iron', { op: 0.7 }), 0, -0.4, 0))
    g.add(k.at(k.M(k.cyl(0.74, 0.74, 0.14, 12), 'woodLo'), 0, 0.8, 0), k.at(k.M(k.cyl(0.06, 0.06, 1.2, 4), 'brass'), 0, 1.2, 0), k.at(k.M(k.sph(0.2, 6, 5), 'brass'), 0, 1.85, 0))
    g.add(k.at(k.G(k.ext('bolt', 0.12, 0.02), 'gold'), 0.05, 0.1, 0.6), k.at(k.G(k.box(0.12, 0.12, 0.05), 'white'), -0.5, 1.8, 0.2))
    g.scale.setScalar(0.8)
    g.position.y = -0.3
  } else if (kind === 'chain') {
    ;[[-0.9, 0.5], [-0.3, 0.2], [0.55, -0.35]].forEach(([x, y], i) => g.add(k.at(k.M(k.tor(0.36, 0.1, 5, 10), 'iron'), x, y, 0, i % 2 ? 0 : 0, i % 2 ? Math.PI / 2 : 0, 0.5)))
    g.add(k.at(k.M(new k.THREE.TorusGeometry(0.36, 0.1, 5, 10, Math.PI * 1.5), 'main', { glow: 0.8 }), 0.2, 0.0, 0, 0, 0, 0.9), k.at(k.G(k.box(0.14, 0.14, 0.14), 'gold'), 0.3, 0.45, 0.2, 0.3, 0.5, 0))
  } else if (kind === 'table') {
    g.add(k.at(k.M(k.box(1.9, 0.14, 1.0), 'wood'), 0, 0.1, 0))
    ;[-0.8, 0.8].forEach((x) => g.add(k.at(k.M(k.box(0.12, 1.0, 0.12), 'woodLo'), x, -0.45, 0.3), k.at(k.M(k.box(0.12, 1.0, 0.12), 'woodLo'), x, -0.45, -0.3)))
    ;[[-0.55, 'main'], [0, 'gold'], [0.55, 'arcane']].forEach(([x, c], i) => g.add(k.at(k.M(k.lathe([[0.001, -0.3], [0.25, -0.25], [0.28, 0.1], [0.12, 0.3], [0.12, 0.45]], 8), c, { glow: 0.3 }), x, 0.45 + (i === 1 ? 0.1 : 0), 0)))
    g.rotation.set(0.35, -0.3, 0)
  } else if (kind === 'twist') {
    g.add(k.at(k.M(k.cone(0.7, 1.4, 6), 'parch'), 0, -0.2, 0, Math.PI), k.at(k.M(k.cone(0.12, 0.7, 4), 'parch'), 0.1, 0.85, 0, 0, 0, -0.5))
    ;[['fireC', -0.3, 0.1], ['waterC', 0.1, 0.35], ['earthC', 0.35, 0.05], ['airC', 0, -0.05]].forEach(([c, x, y]) => g.add(k.at(k.G(k.box(0.2, 0.2, 0.2), p[c] ?? 'white'), x, y + 0.5, 0.3, 0.3, 0.4, 0.2)))
    g.rotation.x = 0.2
  } else if (kind === 'padlock') {
    g.add(k.at(k.M(k.box(0.85, 0.75, 0.4), 'brass'), -0.6, -0.35, 0))
    g.add(k.at(k.M(new k.THREE.TorusGeometry(0.28, 0.07, 4, 10, Math.PI), 'iron'), -0.6, 0.15, 0))
    g.add(k.at(k.G(k.box(0.06, 1.4, 0.06), 'ink'), -0.6, -0.3, 0.22, 0, 0, 0.12))
    g.add(k.M(k.box(1.3, 0.28, 0.14), 'brass'), k.at(k.M(k.box(0.28, 0.6, 0.14), 'brass'), 0.55, 0.2, 0, 0, 0, 0))
    g.add(k.at(k.M(k.box(0.7, 0.14, 0.14), 'goldHi'), 0.45, 0.65, 0.05, 0, 0, 0.55))
    g.rotation.set(0.2, 0.2, 0)
  } else if (kind === 'mirror') {
    // A hand mirror hung upside down: the handle points up, the glass is below.
    g.add(k.at(k.M(k.tor(0.75, 0.13, 5, 18), 'iron'), 0, -0.45, 0), k.at(k.G(new k.THREE.CircleGeometry(0.72, 16), 'glass'), 0, -0.45, 0.02), k.at(k.M(k.cyl(0.1, 0.12, 1.1, 5), 'iron'), 0, 0.65, 0), k.at(k.M(k.sph(0.18, 6, 5), 'trim', { glow: 0.4 }), 0, 1.25, 0))
    g.add(k.at(k.G(k.box(0.5, 0.1, 0.05), 'white'), -0.2, -0.2, 0.05, 0, 0, 0.7), k.at(k.G(k.box(0.3, 0.08, 0.05), 'white'), -0.1, -0.45, 0.05, 0, 0, 0.7))
    g.rotation.set(0.1, 0.2, 0)
  } else if (kind === 'thimble') {
    g.add(k.M(k.lathe([[0.001, -0.95], [0.5, -0.9], [0.8, -0.45], [0.9, 0.1], [0.92, 0.5], [0.001, 0.5]], 12), 'iron'))
    g.add(k.at(k.M(k.tor(0.92, 0.07, 4, 14), 'trim', { glow: 0.3 }), 0, 0.5, 0, Math.PI / 2))
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) g.add(k.at(k.M(k.box(0.09, 0.09, 0.05), 'ink'), Math.sin(c + r * 0.5) * 0.82, -0.6 + r * 0.35, Math.cos(c + r * 0.5) * 0.82, 0, c + r * 0.5, 0))
    g.add(k.at(k.G(new k.THREE.SphereGeometry(0.88, 12, 5, 0, TAU, 0, Math.PI / 2), 'water'), 0, 0.5, 0), k.at(k.G(k.box(0.5, 0.08, 0.08), 'white'), -0.2, 1.0, 0.45), k.at(k.G(k.box(0.3, 0.08, 0.08), 'white'), 0.3, 0.85, 0.4))
    g.rotation.x = 0.35
  } else if (kind === 'bellows') {
    g.add(k.at(k.M(k.box(1.5, 0.12, 1.0), 'woodLo'), -0.1, 0.75, 0, 0, 0, -0.18), k.at(k.M(k.box(1.5, 0.12, 1.0), 'woodLo'), -0.1, -0.75, 0, 0, 0, 0.18))
    for (let i = 0; i < 4; i++) g.add(k.at(k.M(k.box(1.1 - i * 0.12, 0.28, 0.9), i % 2 ? 'leather' : 'wood'), -0.1 + i * 0.1, 0.45 - i * 0.3, 0))
    g.add(k.at(k.M(k.cone(0.2, 1.0, 6), 'iron'), 1.0, 0, 0, 0, 0, -Math.PI / 2), k.at(k.M(k.cyl(0.07, 0.07, 0.9, 5), 'iron'), -0.9, 0.9, 0, 0, 0, 0.9))
    ;[[1.5, 0.1], [1.7, -0.1], [1.45, -0.25]].forEach(([x, y], i) => g.add(k.at(k.G(k.box(0.16, 0.16, 0.16), i % 2 ? 'gold' : 'main'), x, y, 0.1, 0.3, 0.4, 0)))
    g.scale.setScalar(0.8)
    g.rotation.set(0.25, -0.4, 0)
  }
  return g
}

// ---- star charts: a brass-framed navy plate with a constellation sign ----
function plate(k, p) {
  const g = k.grp()
  const shape = p.shape ?? 'rect'
  const frame = p.accent ?? 'gold'
  const faceColor = k.THREE ? undefined : undefined
  void faceColor
  const solid = (r, n, depth, color, extra = {}) => {
    const m = k.M(k.cyl(r, r, depth, n), color, extra)
    m.rotation.x = Math.PI / 2
    if (n === 4) m.rotation.y = Math.PI / 4
    return m
  }
  if (shape === 'rect' || shape === 'wide' || shape === 'tall') {
    const [w, h] = shape === 'wide' ? [2.0, 1.4] : shape === 'tall' ? [1.35, 1.95] : [1.7, 1.7]
    g.add(k.M(k.box(w, h, 0.24), frame, { glow: 0.2 }), k.at(k.M(k.box(w - 0.3, h - 0.3, 0.28), 'navy'), 0, 0, 0))
  } else {
    const n = { hex: 6, round: 28, tri: 3, oct: 8, diamond: 4 }[shape] ?? 6
    const r = shape === 'diamond' ? 1.5 : 1.0
    g.add(solid(r, n, 0.24, frame, { glow: 0.2 }), solid(r - 0.2, n, 0.28, 'navy'))
    if (shape === 'tri') g.children.forEach((c) => (c.rotation.y = Math.PI))
  }
  g.add(k.at(k.decal(p.sign, 1.3, 'white', p.accent ?? 'gold'), 0, shape === 'tri' ? -0.1 : 0, 0.16))
  g.add(k.at(k.decal(p.sign, 1.3, 'white', p.accent ?? 'gold'), 0, 0, -0.16, 0, Math.PI))
  g.add(k.at(k.G(k.box(0.1, 0.1, 0.05), 'trim'), shape === 'wide' ? 0.9 : 0.7, shape === 'tall' ? 0.9 : 0.6, 0.17))
  g.rotation.set(0.2, 0.4, 0)
  return g
}

// ---- cubes (bone dice-like relics, time capsules' dice) ----
function cube(k, p) {
  const g = k.grp()
  g.add(k.M(k.box(1.3, 1.3, 1.3), p.color ?? 'parch'))
  g.add(k.at(k.decal('star4', 1.0, 'ink', 'ink'), 0, 0, 0.66), k.at(k.G(k.box(0.3, 0.3, 0.05), 'iron'), 0.45, 0.45, 0.68))
  g.rotation.set(0.5, 0.6, 0.2)
  return g
}

export const FAMILIES = { gem, flask, scroll, tool, coin, tome, pouch, crown, ring, hourglass, clock, rock, totem, cut, orb, chest, shell, composite, plate, cube }
export { DETAILS }

/** Builds a model Group from a spec and a kit. Details in spec.d are added on top. */
export function buildModel(spec, k) {
  const make = FAMILIES[spec.gen]
  const g = make(k, spec.p ?? {})
  ;(spec.d ?? []).forEach((name) => DETAILS[name] && g.add(DETAILS[name](k)))
  return g
}
