import { memo } from 'react'

/**
 * Placeholder keeper portraits (GDD §28), 14x14 like Pip: one shared face
 * and body, with a different headpiece and palette per keeper, until
 * Carlos draws the real ones. Keys: k outline, h headpiece, c accent,
 * a face, b shade, w eye white, e pupil, d detail.
 */
const HEADS = {
  // Wide-brim peddler hat with a feather.
  tobb: ['.......cc.....', '....kkkckk....', '...khhhhhhk...', '.kkhhhhhhhhkk.', 'khhhhhhhhhhhhk'],
  // Goggles pushed up on the forehead.
  vessa: ['..............', '.....kkkk.....', '...kkhhhhkk...', '..kcckhhkcck..', '..kcckkkkcck..'],
  // A cracked stone block.
  curator: ['..............', '...kkkkkkkk...', '..khhhhhhhhk..', '..khhhkhhhhk..', '.khhhhhkhhhhk.'],
  // Flame hair and a bandana.
  brasa: ['....c..c..c...', '...cc.cc.cc...', '...khchhchhk..', '..khhhhhhhhk..', '..kddddddddk..'],
  // A tall, crooked hood.
  nix: ['......k.......', '.....khk......', '....khhhk.....', '...khhhhhk....', '..khhhhhhhk...'],
  // A halo.
  aeris: ['....cccccc....', '...c......c...', '....cccccc....', '.....kkkk.....', '...kkhhhhkk...'],
  // The Firmament's keepers (EXPANSION.md H6): a rolled map tucked in a cap,
  // a clock-face monocle crown, and Mote, a speck of the Void with tiny horns.
  atlas: ['..........cc..', '....kkkkkcck..', '...khhhhhhhk..', '..khhhhhhhhhk.', '..kddddddddk..'],
  horologist: ['.....kccck....', '....kcdddck...', '....kcdcdck...', '...kkhhhhhkk..', '..khhhhhhhhk..'],
  mote: ['..............', '...k......k...', '...hk....kh...', '....khhhhk....', '...khhhhhhk...'],
  // Seren (J2): a cap with a star on it.
  seren: ['.......c......', '......ccc.....', '....kkkckk....', '...khhhhhhk...', '..khhhhhhhhk..'],
  // Vesper (K5): a crescent-moon hairpin over a dark bob.
  // The Arbiter (P5): a smooth pale veil, an open empty hand's worth of calm. A placeholder for a realm 3 god.
  arbiter: ['..............', '....cccccc....', '...kccccccck..', '..kccccccccck.', '..kccccccccck.'],
  vesper: ['.........cc...', '....kkkkkc....', '...khhhhhhk...', '..khhhhhhhhk..', '..khhhhhhhhk..'],
}

const MOUTHS = {
  tobb: '..kaddddddaak.',
  vessa: '..kaaadaaaaak.',
  curator: '..kaddddddaak.',
  brasa: '..kaaaddaaaak.',
  nix: '..kaaaaaaaaak.',
  aeris: '..kaaaddaaaak.',
  atlas: '..kaaddddaaak.',
  horologist: '..kaaaaaaaaak.',
  mote: '..kaaadaaaaak.',
  seren: '..kaaaddaaaak.',
  vesper: '..kaaaadaaaak.',
  arbiter: '..kaaaaaaaaak.',
}

const BODY = (mouth) => [
  '.kkaaaaaaaakk.',
  '..kaweaaweaak.',
  '..kaaaaaaaaak.',
  mouth,
  '..kbaaaaaabk..',
  '...kbbbbbbk...',
  '..kcccccccck..',
  '.kcccccccccck.',
  '.kkkkkkkkkkkk.',
]

const PALETTES = {
  tobb: { k: '#120c1a', h: '#8a5a34', c: '#e5533d', a: '#8fcf6a', b: '#5a9a45', w: '#ffffff', e: '#120c1a', d: '#5a3a22' },
  vessa: { k: '#120c1a', h: '#2f7a6a', c: '#ffd166', a: '#bff0e6', b: '#7fc9ba', w: '#ffffff', e: '#1d4f5a', d: '#2f7a6a' },
  curator: { k: '#120c1a', h: '#6b6f78', c: '#c8b6ff', a: '#a4a9b2', b: '#7c818c', w: '#ffe9a0', e: '#120c1a', d: '#4b4f58' },
  brasa: { k: '#120c1a', h: '#5a2a1a', c: '#ff7a1a', a: '#f2a36b', b: '#c9774a', w: '#ffffff', e: '#3a1a0a', d: '#b8321f' },
  nix: { k: '#0a0710', h: '#241a33', c: '#6a4fd6', a: '#3a3048', b: '#2a2338', w: '#ff5a8a', e: '#ff5a8a', d: '#120c1a' },
  aeris: { k: '#120c1a', h: '#cfe3ff', c: '#ffe9a0', a: '#eef3ff', b: '#bccbe8', w: '#9fd8ff', e: '#3d6fe5', d: '#9fb0d0' },
  atlas: { k: '#120c1a', h: '#2f5a8a', c: '#f2e6c8', a: '#e8c9a0', b: '#c49a74', w: '#ffffff', e: '#1d3a5a', d: '#7ad1ff' },
  horologist: { k: '#120c1a', h: '#5a4a2a', c: '#c9a46b', a: '#d8d0c0', b: '#a89f8c', w: '#fff4d6', e: '#3a2a12', d: '#fff4d6' },
  seren: { k: '#120c1a', h: '#3a3f8a', c: '#ffe9a0', a: '#e6d4c8', b: '#bfa8a0', w: '#ffffff', e: '#1d2260', d: '#9fb8ff' },
  vesper: { k: '#120c1a', h: '#1d2a4a', c: '#e8e0ff', a: '#d8c8e8', b: '#a898c0', w: '#ffffff', e: '#5a4ab8', d: '#9fb8ff' },
  arbiter: { k: '#1a1a24', h: '#e6e2f0', c: '#d8d2e8', a: '#f4f0fa', b: '#c8c2d8', w: '#ffffff', e: '#8a8aa8', d: '#c8c2d8' },
  mote: { k: '#05030a', h: '#2a2338', c: '#8a7aa8', a: '#1a1424', b: '#120c1a', w: '#ff4fd8', e: '#ffffff', d: '#8a7aa8' },
}

// The Aether Bazaar's crowd: the keepers of Elementa.
const CONCLAVE = ['tobb', 'vessa', 'curator', 'brasa', 'nix', 'aeris']

function rowsFor(id) {
  return [...HEADS[id], ...BODY(MOUTHS[id])]
}

function Sprite({ id, size }) {
  const palette = PALETTES[id]
  const rects = []
  rowsFor(id).forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const fill = palette[row[x]]
      if (fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={fill} />)
    }
  })
  return (
    <svg viewBox="0 0 14 14" width={size} height={size} shapeRendering="crispEdges" aria-hidden="true">
      {rects}
    </svg>
  )
}

/** The Aether Bazaar's host is every keeper, side by side. */
function KeeperSprite({ id, size = 64 }) {
  if (id === 'conclave') {
    const small = Math.round(size * 0.55)
    return (
      <span className="inline-flex items-end" style={{ gap: 2 }}>
        {CONCLAVE.map((k) => (
          <Sprite key={k} id={k} size={small} />
        ))}
      </span>
    )
  }
  if (!PALETTES[id]) return null
  return <Sprite id={id} size={size} />
}

export default memo(KeeperSprite)
