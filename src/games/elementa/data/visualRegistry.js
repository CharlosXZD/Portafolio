// The visual registry (VISUALS.md section 2). Every new visual asset of the
// overhaul is looked up BY ID through this file, never imported directly.
//
// An id resolves to a `kind`:
//   code      drawn by code (SVG, canvas, CSS), the shipping placeholder
//   three     a low-resolution 3D render cached into a sprite atlas
//   remotion  a Remotion composition played by the CinematicPlayer
//   image     a file in public/elementa/visuals/ (hand-drawn art)
//
// THE SWAP RULE: drop a file named after the id into
// `public/elementa/visuals/` (for example `spike.relic.ember_heart.png`)
// and the code-made version is replaced everywhere that id is used, with
// no code changes. Accepted extensions are `.png`, `.webp` and `.svg`, in
// that order. Images are drawn at their native pixel size and scaled up by
// a whole number (see ASSETS.md). The files are looked up with a cheap
// request on first use and remembered for the session.

import { ELEMENTS } from './elements.js'

const L = (en, es) => ({ en, es })

export const IMAGE_BASE = '/elementa/visuals/'
export const IMAGE_EXTENSIONS = ['png', 'webp', 'svg']

/**
 * Registry entries. `load` is a dynamic import so nothing heavy lands in the
 * first-load bundle; it resolves to a module whose default export is the
 * component for that kind. `props` are passed to it untouched.
 */
export const VISUALS = {
  // --- V1 spikes: low-resolution 3D items (cached atlases) ---
  'spike.relic.ember_heart': {
    kind: 'three',
    label: L('Ember Heart (relic)', 'Corazón de Brasa (reliquia)'),
    load: () => import('../components/visuals/three/Item3D.jsx'),
    props: { shape: 'gem', elementId: 'fire', rarity: 'uncommon' },
    fallbackSprite: { name: 'heart', color: ELEMENTS.fire.color, accent: '#ffe27a' },
  },
  'spike.consumable.tide_flask': {
    kind: 'three',
    label: L('Tide Flask (consumable)', 'Frasco de Marea (consumible)'),
    load: () => import('../components/visuals/three/Item3D.jsx'),
    props: { shape: 'potion', elementId: 'water', rarity: 'rare' },
    fallbackSprite: { name: 'flask', color: ELEMENTS.water.color, accent: '#9fd4ff' },
  },
  'spike.die.fire_d20': {
    kind: 'three',
    label: L('Fire d20 (die)', 'd20 de Fuego (dado)'),
    load: () => import('../components/visuals/three/Item3D.jsx'),
    props: { shape: 'die', elementId: 'fire' },
    fallbackSprite: { name: 'die', color: ELEMENTS.fire.color, accent: '#ffd166' },
  },
  // Two shelf fillers that stay code-made sprites, so the room mixes both.
  'spike.relic.lucky_coin': {
    kind: 'code',
    label: L('Lucky Coin (relic)', 'Moneda de la Suerte (reliquia)'),
    load: () => import('../components/visuals/CodeSprite.jsx'),
    props: { name: 'coin', color: '#ffd166', accent: '#fff3c4' },
  },
  'spike.consumable.old_map': {
    kind: 'code',
    label: L('Old Map (consumable)', 'Mapa Viejo (consumible)'),
    load: () => import('../components/visuals/CodeSprite.jsx'),
    props: { name: 'scroll', color: '#e8dcc0', accent: '#c46a24' },
  },
  // --- V1 spikes: layered SVG characters ---
  'rig.keeper.brasa': {
    kind: 'code',
    label: L('Brasa (layered rig)', 'Brasa (rig en capas)'),
    load: () => import('../components/visuals/rigs/KeeperRig.jsx'),
    props: { id: 'brasa' },
  },
  'rig.keeper.tobb': {
    kind: 'code',
    label: L('Tobb (layered rig)', 'Tobb (rig en capas)'),
    load: () => import('../components/visuals/rigs/KeeperRig.jsx'),
    props: { id: 'tobb' },
  },
  // --- V1 spikes: cinematic and the shop room ---
  'cinematic.title_card': {
    kind: 'remotion',
    label: L('Title card (6 s Remotion)', 'Carta de título (6 s, Remotion)'),
    load: () => import('../components/visuals/cinematic/CinematicPlayer.jsx'),
    props: { composition: 'title_card' },
  },
  'room.market': {
    kind: 'code',
    label: L('Market room (lived-in slice)', 'Sala del Mercado (porción habitada)'),
    load: () => import('../components/visuals/room/MarketRoom.jsx'),
    props: {},
  },
}

export const VISUAL_IDS = Object.keys(VISUALS)

export function visualEntry(id) {
  return VISUALS[id] ?? null
}

// --- The swap rule: look for a hand-drawn file named after the id. ---

const probes = new Map()

async function probe(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    // A dev server or the production rewrite answers a missing file with the
    // app's index.html, so only a real image content type counts as a hit.
    return res.ok && (res.headers.get('content-type') ?? '').startsWith('image/')
  } catch {
    return false
  }
}

/** Resolves to the URL of a hand-drawn image for this id, or null. Cached. */
export function findImageOverride(id) {
  if (!probes.has(id)) {
    probes.set(
      id,
      (async () => {
        for (const ext of IMAGE_EXTENSIONS) {
          const url = `${IMAGE_BASE}${id}.${ext}`
          if (await probe(url)) return url
        }
        return null
      })(),
    )
  }
  return probes.get(id)
}

/** Forget what was found, used by the Visual Lab's "look again" button. */
export function clearImageOverrides() {
  probes.clear()
}
