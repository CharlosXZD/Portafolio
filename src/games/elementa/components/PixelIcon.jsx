/**
 * Tiny hand-authored pixel icons, drawn as an SVG grid of rects with
 * crispEdges so they stay razor-sharp at any integer scale. Each icon is a
 * list of rows; every character maps to a palette entry ('.' = empty).
 * These are UI placeholders (hearts, shards, element marks); when the real
 * hand-drawn sprites exist, swap a name here for an <img> (see ASSETS.md
 * for the target sizes).
 */
const INK = '#120c1a'

const ICONS = {
  heart: {
    rows: ['.kk.kk.', 'krrkrrk', 'kwrrrrk', 'krrrrdk', '.krrdk.', '..kdk..', '...k...'],
    palette: { k: INK, r: '#ff4d5e', w: '#ffc2c8', d: '#b02838' },
  },
  heartEmpty: {
    rows: ['.kk.kk.', 'keekeek', 'keeeeek', 'keeeeek', '.keeek.', '..kek..', '...k...'],
    palette: { k: INK, e: '#3a3048' },
  },
  shard: {
    rows: ['.kkkkk.', 'kwgggdk', 'kggggdk', '.kggdk.', '..kgk..', '...k...'],
    palette: { k: INK, w: '#fff3c4', g: '#ffc94d', d: '#d9892b' },
  },
  pause: {
    rows: ['kkk.kkk', 'kwk.kwk', 'kwk.kwk', 'kwk.kwk', 'kwk.kwk', 'kkk.kkk'],
    palette: { k: INK, w: '#efe6d8' },
  },
  reroll: {
    rows: ['..ccc..', '.c...c.', 'c.....c', 'c...ccc', 'c....c.', '.c.....', '..ccc..'],
    palette: { c: 'currentColor' },
  },
  // Element marks: single-color silhouettes, tinted by the `color` prop.
  fire: {
    rows: ['...c...', '..cc...', '..cch..', '.cchhc.', '.chhhc.', '.cchcc.', '..ccc..'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  water: {
    rows: ['...c...', '...c...', '..ccc..', '.chccc.', '.chccc.', '.ccccc.', '..ccc..'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  earth: {
    rows: ['.......', '...c...', '..chc..', '..cccc.', '.chcccc', 'cccccch', 'ccccccc'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  air: {
    rows: ['.cccc..', 'c....c.', '...cc.c', '..c..c.', '..c....', '...ccc.', '.......'],
    palette: { c: 'var(--icon-color)' },
  },
  // Fusion and arcane dice marks (placeholders until the real sprites).
  lightning: {
    rows: ['....cc.', '...cc..', '..cccc.', '....cc.', '...cc..', '..cc...', '.c.....'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  ice: {
    rows: ['...c...', '.c.c.c.', '..ccc..', 'ccchccc', '..ccc..', '.c.c.c.', '...c...'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  steel: {
    rows: ['......c', '.....c.', '....c..', '.c.c...', '..c....', '.c.c...', 'c......'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  mud: {
    rows: ['.......', '.......', '..ccc..', '.chccc.', 'ccccccc', '.ccccc.', '.......'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  steam: {
    rows: ['.c...c.', '..c...c', '.c...c.', '.......', '.ccccc.', 'ccchccc', '.ccccc.'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  crystal: {
    rows: ['..ccc..', '.chccc.', 'ccccccc', '.ccccc.', '..ccc..', '...c...', '.......'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  storm: {
    rows: ['.cccc..', 'cchhccc', 'ccccccc', '...cc..', '..cc...', '...c...', '..c....'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  obsidian: {
    rows: ['....c..', '...cc..', '..chc..', '..chcc.', '.cchcc.', '.ccccc.', '..ccc..'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  magma: {
    rows: ['..h.h..', '...h...', '..ccc..', '..ccc..', '.ccccc.', 'ccccccc', 'ccccccc'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  monsoon: {
    rows: ['.cccc..', 'ccccccc', '.......', '.h.h.h.', 'h.h.h..', '.h.h.h.', '.......'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  aether: {
    rows: ['...c...', '...h...', '.c.h.c.', 'chhhhhc', '.c.h.c.', '...h...', '...c...'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  midas: {
    rows: ['..ccc..', '.chccc.', 'chcccc.', 'ccccccc', 'cccccc.', '.ccccc.', '..ccc..'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  sapling: {
    rows: ['.cc....', 'cchc.cc', '.ccchc.', '...c...', '...c...', '..ccc..', '.......'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  mirror: {
    rows: ['..ccc..', '.chhcc.', '.chccc.', '.ccccc.', '..ccc..', '...c...', '...c...'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  conduit: {
    rows: ['cc.....', 'c.c....', '.cc....', '..hhh..', '....cc.', '....c.c', '.....cc'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  kairos: {
    rows: ['ccccccc', '.chhhc.', '..chc..', '...c...', '..c.c..', '.chhhc.', 'ccccccc'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  // The Celestial dice (EXPANSION.md I1).
  comet: {
    rows: ['....hh.', '...hcc.', '.ch.cc.', 'c.hcc..', '..cc...', '.cc....', 'c......'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  pulsar: {
    rows: ['...c...', '...c...', '.c.h.c.', 'ccchccc', '.c.h.c.', '...c...', '...c...'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  satellite: {
    rows: ['.c...c.', 'cc...cc', '.cchcc.', '..chc..', '.cchcc.', 'cc...cc', '.c...c.'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  timelike_curve: {
    rows: ['.ccccc.', 'c.....c', 'c.hhh.c', 'c.h...c', 'c.hhh.c', 'c.....c', '.ccccc.'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  shooting_star: {
    rows: ['.....hh', '....hcc', '...hcc.', '.chcc..', '.cc.c..', 'cc.....', 'c......'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  neutron_star: {
    rows: ['..c.c..', '.cchcc.', 'cchhhcc', '.hhhhh.', 'cchhhcc', '.cchcc.', '..c.c..'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  non_euclid: {
    rows: ['c.....c', '.c...c.', '..c.c..', 'cchhhcc', '..c.c..', '.c...c.', 'c.....c'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  event_horizon: {
    rows: ['..ccc..', '.c...c.', 'c.hhh.c', 'c.hHh.c', 'c.hhh.c', '.c...c.', '..ccc..'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)', H: '#000000' },
  },
  black_hole_die: {
    rows: ['.ccccc.', 'cc...cc', 'c.....c', 'c..h..c', 'c.....c', 'cc...cc', '.ccccc.'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  time_ghost: {
    rows: ['..ccc..', '.ccccc.', 'cchchcc', 'ccccccc', 'ccccccc', 'cc.c.cc', 'c.....c'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  entanglement: {
    rows: ['cc...cc', 'c.h.h.c', '.chhhc.', '..hhh..', '.chhhc.', 'c.h.h.c', 'cc...cc'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  quasar: {
    rows: ['c..c..c', '.c.h.c.', '..chc..', 'chhhhhc', '..chc..', '.c.h.c.', 'c..c..c'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  zenith: {
    rows: ['...h...', '..chc..', '.chhhc.', 'ccchccc', '..chc..', '..chc..', '..ccc..'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  beacon: {
    rows: ['h..c..h', '..ccc..', '.chhhc.', '.chhhc.', '.ccccc.', '..ccc..', 'h.....h'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  prism: {
    rows: ['...c...', '..chc..', '..chc..', '.chhcc.', '.ccccc.', 'ccccccc', '.......'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  bullion: {
    rows: ['.......', '..ccc..', '.chhcc.', 'chhcccc', 'ccccccc', '.......', '.......'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  masquerade: {
    rows: ['.......', 'ccc.ccc', 'chcccch', 'c.ccc.c', '.ccccc.', '..c.c..', '.......'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  chameleon: {
    rows: ['..ccc..', '.chccc.', 'cccccc.', '..cc.c.', '.c.c.cc', 'c..c..c', '.cc....'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  // The gods (B4) and the Primordial die (B1).
  gaea: {
    rows: ['.c...c.', 'cc.c.cc', 'chccchc', '.ccccc.', '..chc..', '.ccccc.', 'ccccccc'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  ognen: {
    rows: ['c..c..c', 'cc.c.cc', '.chchc.', 'cchhhcc', '.chhhc.', '.ccccc.', '..ccc..'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  varuna: {
    rows: ['c.c.c.c', '.c.c.c.', '...c...', '..chc..', '.chhcc.', '.ccccc.', '..ccc..'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  zephyr: {
    rows: ['c.ccc.c', '.c...c.', 'cchhhcc', '.......', 'ccccc..', '....cc.', 'cccc...'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  primordial_die: {
    rows: ['c..c..c', '.chhhc.', '.hcccc.', 'chcccch', '.cccch.', '.chhhc.', 'c..c..c'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  // The Firmament (EXPANSION.md H3 to H5): Chrono, the Mythic dice, Entropy.
  chrono: {
    rows: ['..ccc..', '.c.h.c.', 'c..h..c', 'c..hhhc', 'c.....c', '.c...c.', '..ccc..'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  light: {
    rows: ['c..c..c', '.c.c.c.', '..hhh..', 'cchhhcc', '..hhh..', '.c.c.c.', 'c..c..c'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  darkness: {
    rows: ['..ccc..', '.cc....', 'cc.....', 'cc...h.', 'cc.....', '.cc....', '..ccc..'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  time: {
    rows: ['ccccccc', '.hhhhh.', '..hhh..', '...c...', '..c.c..', '.c...c.', 'ccccccc'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  space: {
    rows: ['c.....c', '.c...c.', '..ccc..', '..chc..', '..ccc..', '.c...c.', 'c.....c'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  chaos: {
    rows: ['c..c..c', '.c.c.c.', '..chc..', 'cchhhcc', '..chc..', '.c.c.c.', 'c..c..c'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  void: {
    rows: ['..ccc..', '.c...c.', 'c.....c', 'c..h..c', 'c.....c', '.c...c.', '..ccc..'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  entropy: {
    rows: ['c.c.c.c', '.chhhc.', 'chcccch', '.hc.ch.', 'chcccch', '.chhhc.', 'c.c.c.c'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  // The Firmament's base elements, their fusions and the Dead Star (K1, K4).
  glimmer: {
    rows: ['...c...', '...h...', '.c.h.c.', '..hhh..', '.c.h.c.', '...h...', '...c...'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  gloom: {
    rows: ['..ccc..', '.ccc...', 'ccc....', 'ccc..h.', 'ccc....', '.ccc...', '..ccc..'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  moment: {
    rows: ['.ccccc.', '..chc..', '...c...', '...c...', '..c.c..', '.c.h.c.', '.ccccc.'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  reach: {
    rows: ['.......', 'c.....c', '.c...c.', 'cchhhcc', '.c...c.', 'c.....c', '.......'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  flux: {
    rows: ['cc...cc', '.cc.cc.', '..chc..', '..hhh..', '..chc..', '.cc.cc.', 'cc...cc'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  nil: {
    rows: ['.......', '..ccc..', '.c...c.', '.c.h.c.', '.c...c.', '..ccc..', '.......'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  shadow: {
    rows: ['..ccc..', '.cchhh.', 'ccchhhh', 'ccchhhh', 'ccchhhh', '.cchhh.', '..ccc..'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  continuum: {
    rows: ['.ccccc.', 'c.....c', 'c.hhh.c', 'c.h.h.c', 'c.hhh.c', 'c.....c', '.ccccc.'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  oblivion: {
    rows: ['c.....c', '.c...c.', '..ccc..', '..c.c..', '..ccc..', '.c...c.', 'c.....c'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  alba: {
    rows: ['.......', '.h.h.h.', '..hhh..', 'hhhhhhh', '.......', 'ccccccc', '.......'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  anomaly: {
    rows: ['..cc...', '.c..c..', '....c..', '...c...', '..c....', '.......', '..h....'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  singularity: {
    rows: ['c..c..c', '.c.c.c.', '..ccc..', 'cccHccc', '..ccc..', '.c.c.c.', 'c..c..c'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)', H: '#000000' },
  },
  abyss: {
    rows: ['ccccccc', 'c.....c', '.c...c.', '.c.h.c.', '..c.c..', '..c.c..', '...c...'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  dead_star: {
    rows: ['.c...c.', '..c.c..', 'c.ccc.c', '..chc..', 'c.ccc.c', '..c.c..', '.c...c.'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
  spark: {
    rows: ['...c...', '...c...', '.c.h.c.', 'cchhhcc', '.c.h.c.', '...c...', '...c...'],
    palette: { c: 'var(--icon-color)', h: 'var(--icon-hi)' },
  },
}


export default function PixelIcon({ name, size = 14, color, hi = '#ffffff', className = '', title }) {
  const icon = ICONS[name]
  if (!icon) return null
  const w = icon.rows[0].length
  const h = icon.rows.length
  const rects = []
  icon.rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const fill = icon.palette[row[x]]
      if (fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={fill} />)
    }
  })
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={size}
      height={(size * h) / w}
      shapeRendering="crispEdges"
      className={`inline-block shrink-0 ${className}`}
      style={{ '--icon-color': color ?? 'currentColor', '--icon-hi': hi }}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {rects}
    </svg>
  )
}
