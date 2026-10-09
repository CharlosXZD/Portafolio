// The prop library for the shop rooms (VISUALS.md V3.1). Every prop is a
// small function that returns SVG rects on whole art pixels (the stage is
// 320 by 180), so each room is a short list of props plus a palette instead
// of a new component. Static props go in a room's Back layer, props that
// move go in its Ambient layer (rooms.css animates them with stepped
// transform and opacity only). Colors come from the room, the keeper's
// palette or the tokens in elementa.css; nothing here knows about a shop.
const INK = '#120c1a'
const R = (x, y, w, h, f, o) => <rect x={x} y={y} width={w} height={h} fill={f} opacity={o} />

// A tiny seeded generator, so a room's cracks and stars are the same every visit.
export function seeded(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** Vertical planks across a wall. */
export function Planks({ x = 0, y = 0, w = 320, h = 124, a = '#2e1c26', b = '#33202a', line = '#24151d', hi = '#3d2832', step = 16 }) {
  const n = Math.ceil(w / step)
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          {R(x + i * step, y, step, h, i % 2 ? a : b)}
          {R(x + i * step + step - 1, y, 1, h, line)}
          {R(x + i * step, y, 1, h, hi)}
          {R(x + i * step + 6, y + 10 + ((i * 37) % (h - 20)), 2, 1, INK, 0.6)}
        </g>
      ))}
    </>
  )
}

/** Stone blocks: rows of slightly different grey-violet bricks. */
export function Stones({ x = 0, y = 0, w = 320, h = 124, a = '#3a3550', b = '#443e5c', mortar = '#1d1829', bw = 20, bh = 10 }) {
  const rnd = seeded(5)
  const rows = Math.ceil(h / bh)
  const cols = Math.ceil(w / bw) + 1
  const out = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ox = (r % 2) * (bw / 2)
      const f = rnd() > 0.5 ? a : b
      out.push(<rect key={`${r}-${c}`} x={x + c * bw - ox} y={y + r * bh} width={bw - 1} height={bh - 1} fill={f} />)
    }
  }
  return (
    <>
      {R(x, y, w, h, mortar)}
      {out}
    </>
  )
}

/** Floor boards (wood) or flagstones, with a darker front edge. */
export function Floor({ y = 124, h = 56, a = '#3b2215', b = '#34200f', line = '#4a2c1a', joint = '#1f120c', rows = 9 }) {
  const rh = Math.ceil(h / rows)
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <g key={i}>
          {R(0, y + i * rh, 320, rh, i % 2 ? b : a)}
          {R(0, y + i * rh, 320, 1, line)}
          {R((i * 53) % 320, y + i * rh, 1, rh, joint)}
          {R((i * 97 + 140) % 320, y + i * rh, 1, rh, joint)}
        </g>
      ))}
    </>
  )
}

/** A wooden beam across the top. */
export function Beam({ y = 0, h = 10, a = '#3b2215', hi = '#5a3620', post = '#2a170e' }) {
  return (
    <>
      {R(0, y, 320, h, a)}
      {R(0, y, 320, 2, hi)}
      {R(0, y + h - 2, 320, 2, INK, 0.5)}
      {[28, 108, 196, 288].map((px) => (
        <g key={px}>{R(px, y + 2, 6, h - 2, post)}</g>
      ))}
    </>
  )
}

/** A window onto a sky (bands from top to bottom) with a frame and sill. */
export function Window({ x, y, w, h, sky = ['#120d24', '#34203f', '#733545', '#c46a45'], frame = '#5a3620', sill = '#744528', cross = true, id = 'win' }) {
  const bh = Math.ceil(h / sky.length)
  return (
    <>
      <defs>
        <clipPath id={`${id}-${x}`}>
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-${x})`}>
        {sky.map((c, i) => (
          <g key={c + i}>{R(x, y + i * bh, w, bh + 1, c)}</g>
        ))}
      </g>
      {R(x - 3, y - 3, w + 6, 3, frame)}
      {R(x - 3, y + h, w + 6, 3, frame)}
      {R(x - 3, y - 3, 3, h + 6, frame)}
      {R(x + w, y - 3, 3, h + 6, frame)}
      {cross && R(x + w / 2 - 1, y, 2, h, frame)}
      {cross && R(x, y + h / 2 - 1, w, 2, frame)}
      {R(x - 5, y + h + 3, w + 10, 4, sill)}
      {R(x - 5, y + h + 3, w + 10, 1, '#c9874a', 0.7)}
    </>
  )
}

/** A wall shelf with two brackets and a shadow. */
export function Shelf({ x, y, w, board = '#744528', hi = '#c9874a', bracket = '#5a3620' }) {
  return (
    <>
      {R(x, y, w, 3, board)}
      {R(x, y, w, 1, hi)}
      {R(x, y + 3, w, 2, INK, 0.4)}
      {R(x + 6, y + 3, 2, 6, bracket)}
      {R(x + w - 8, y + 3, 2, 6, bracket)}
    </>
  )
}

/** A glass jar: lid, body, contents, a highlight. */
export function Jar({ x, y, fill = '#6fd38a', glass = '#dff3ff', lid = '#a8744a', h = 12, w = 10, level = 0.7 }) {
  const lv = Math.round(h * level)
  return (
    <>
      {R(x, y, w, h, glass, 0.3)}
      {R(x + 1, y + h - lv, w - 2, lv, fill)}
      {R(x + 1, y + h - lv, w - 2, 1, '#ffffff', 0.5)}
      {R(x + 1, y - 3, w - 2, 3, lid)}
      {R(x, y + 1, 1, h - 2, '#ffffff', 0.5)}
    </>
  )
}

/** A bottle with a neck and cork. */
export function Bottle({ x, y, fill = '#3d8fe5', h = 14, w = 8, cork = '#a8744a' }) {
  return (
    <>
      {R(x + 2, y - 6, w - 4, 6, '#dff3ff', 0.35)}
      {R(x + 2, y - 8, w - 4, 2, cork)}
      {R(x, y, w, h, '#dff3ff', 0.3)}
      {R(x + 1, y + Math.round(h * 0.35), w - 2, Math.round(h * 0.65) - 1, fill)}
      {R(x, y + 1, 1, h - 2, '#ffffff', 0.5)}
    </>
  )
}

/** A short stack of books. */
export function Books({ x, y, colors = ['#8f6bff', '#3f9f5f', '#a8323a'], w = 14 }) {
  return (
    <>
      {colors.map((c, i) => (
        <g key={c + i}>
          {R(x + (i % 2), y - (i + 1) * 4, w - (i % 2) * 2, 4, c)}
          {R(x + (i % 2), y - (i + 1) * 4, w - (i % 2) * 2, 1, '#ffffff', 0.25)}
        </g>
      ))}
    </>
  )
}

/** A wooden crate (with slats). */
export function Crate({ x, y, w = 24, h = 20, a = '#744528', hi = '#c9874a', band = '#5a3620' }) {
  return (
    <>
      {R(x, y, w, h, a)}
      {R(x, y, w, 2, hi)}
      {R(x + 3, y, 2, h, band)}
      {R(x + w - 5, y, 2, h, band)}
      {R(x, y + Math.round(h / 2), w, 2, band)}
      {R(x, y + h - 2, w, 2, INK, 0.5)}
    </>
  )
}

/** A barrel. */
export function Barrel({ x, y, w = 20, h = 28, a = '#5a3620', hi = '#9a5f34', hoop = '#2a170e' }) {
  return (
    <>
      {R(x, y, w, h, a)}
      {R(x, y, w, 2, hi)}
      {R(x + 3, y, 2, h, '#744528')}
      {R(x, y + 6, w, 2, hoop)}
      {R(x, y + h - 8, w, 2, hoop)}
      {R(x, y + h - 2, w, 2, INK, 0.5)}
    </>
  )
}

/** A sack tied at the neck. */
export function Sack({ x, y, c = '#a8946c' }) {
  return (
    <>
      {R(x + 2, y + 4, 16, 16, c)}
      {R(x, y + 8, 20, 12, c)}
      {R(x + 6, y, 8, 5, c)}
      {R(x + 7, y + 4, 6, 1, '#5a3620')}
      {R(x, y + 18, 20, 2, INK, 0.35)}
    </>
  )
}

/** A table: top, two legs. */
export function Table({ x, y, w = 40, h = 24, top = '#744528', leg = '#5a3620' }) {
  return (
    <>
      {R(x, y, w, 4, top)}
      {R(x, y, w, 1, '#c9874a')}
      {R(x + 3, y + 4, 3, h - 4, leg)}
      {R(x + w - 6, y + 4, 3, h - 4, leg)}
      {R(x, y + 4, w, 1, INK, 0.4)}
    </>
  )
}

/** A hanging lantern body (its glow is a room light). */
export function Lantern({ x, y, rope = 14 }) {
  return (
    <>
      {R(x + 3, y - rope, 2, rope, '#5a3620')}
      {R(x, y, 8, 2, '#2a170e')}
      {R(x - 1, y + 2, 10, 11, '#2a170e')}
      {R(x + 1, y + 3, 6, 9, '#ffd98a')}
      {R(x + 2, y + 4, 2, 6, '#fff4d6')}
      {R(x, y + 13, 8, 2, '#2a170e')}
    </>
  )
}

/** A candle with its holder; the flame is an Ambient prop. */
export function Candle({ x, y, h = 8, c = '#f2e6c8' }) {
  return (
    <>
      {R(x, y - h, 4, h, c)}
      {R(x, y - h, 1, h, '#fff8e6')}
      {R(x - 1, y, 6, 2, '#744528')}
      {R(x + 1, y - h - 2, 2, 2, INK)}
    </>
  )
}

/** A stone or wooden pillar with a cap and base. */
export function Pillar({ x, y = 0, w = 14, h = 124, a = '#4a4466', hi = '#6a6488', lo = '#2c2840' }) {
  return (
    <>
      {R(x, y, w, h, a)}
      {R(x, y, 2, h, hi)}
      {R(x + w - 3, y, 3, h, lo)}
      {R(x - 3, y, w + 6, 6, hi)}
      {R(x - 3, y + h - 6, w + 6, 6, hi)}
      {R(x - 3, y + h - 2, w + 6, 2, lo)}
    </>
  )
}

/** A banner hanging from the top. */
export function Banner({ x, y = 8, w = 16, h = 36, c = '#a8323a', trim = '#ffd166', glyph }) {
  return (
    <>
      {R(x - 2, y - 2, w + 4, 3, '#5a3620')}
      {R(x, y + 1, w, h, c)}
      {R(x, y + h - 2, w / 2 - 1, 5, c)}
      {R(x + w / 2 + 1, y + h - 2, w / 2 - 1, 5, c)}
      {R(x + 1, y + 3, w - 2, 1, trim)}
      {glyph && R(x + Math.round(w / 2) - 2, y + 10, 4, 4, trim)}
    </>
  )
}

/** A glass case on a stand with an object under it. */
export function Case({ x, y, w = 28, h = 26, item = '#ffd166', glass = '#dff3ff', base = '#4a4466' }) {
  return (
    <>
      {R(x, y + h - 6, w, 6, base)}
      {R(x, y, w, h - 6, glass, 0.18)}
      {R(x, y, w, 1, '#ffffff', 0.5)}
      {R(x, y, 1, h - 6, '#ffffff', 0.4)}
      {R(x + w - 1, y, 1, h - 6, '#ffffff', 0.2)}
      {R(x + w / 2 - 4, y + h - 14, 8, 8, item)}
      {R(x + w / 2 - 4, y + h - 14, 8, 1, '#ffffff', 0.6)}
    </>
  )
}

/** A rolled map or scroll leaning in a rack. */
export function ScrollRack({ x, y, n = 5 }) {
  return (
    <>
      {R(x, y + 12, n * 8 + 4, 3, '#5a3620')}
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          {R(x + 3 + i * 8, y, 5, 14, i % 2 ? '#d8c8a0' : '#e8dcc0')}
          {R(x + 3 + i * 8, y, 5, 2, i % 2 ? '#c8321f' : '#744528')}
        </g>
      ))}
    </>
  )
}

/** A small potted plant. */
export function Plant({ x, y, pot = '#a8523a', leaf = '#5fb057' }) {
  return (
    <>
      {R(x, y + 6, 10, 8, pot)}
      {R(x, y + 6, 10, 1, '#d27a52')}
      {R(x + 4, y - 4, 2, 10, '#4a8a45')}
      {R(x, y - 6, 5, 4, leaf)}
      {R(x + 5, y - 8, 5, 4, leaf)}
      {R(x + 1, y, 4, 3, leaf)}
    </>
  )
}

/** A parchment sheet pinned to the wall, with scribble lines. */
export function Notice({ x, y, w = 28, h = 36, c = '#e8dcc0', ink = '#8a7050', lines = 6 }) {
  return (
    <>
      {R(x, y, w, h, c)}
      {R(x, y, w, 2, '#fff4d6')}
      {R(x, y + h - 2, w, 2, '#b8a888')}
      {Array.from({ length: lines }, (_, i) => (
        <g key={i}>{R(x + 3, y + 6 + i * 5, w - 8 - ((i * 5) % 8), 2, ink)}</g>
      ))}
      {R(x + w / 2 - 1, y - 4, 2, 4, '#9a5f34')}
    </>
  )
}

/** A counter along the bottom right: top, front, panels. */
export function Counter({ x = 236, y = 112, w = 84, top = '#9a5f34', hi = '#e0a468', front = '#5a3620', panel = '#744528' }) {
  return (
    <>
      {R(x, y, w, 6, top)}
      {R(x, y, w, 1, hi)}
      {R(x, y + 5, w, 1, '#744528')}
      {R(x + 2, y + 6, w - 2, 44, front)}
      {R(x + 2, y + 6, w - 2, 2, INK, 0.35)}
      {R(x + 10, y + 14, w - 20, 26, panel)}
      {R(x + 10, y + 14, w - 20, 1, top)}
      {R(x + 14, y + 22, w - 28, 2, front, 0.7)}
    </>
  )
}

/** A forge mouth: a stone arch with a glowing opening (the glow itself is a light). */
export function ForgeMouth({ x, y, w = 60, h = 44 }) {
  return (
    <>
      {R(x - 6, y - 6, w + 12, h + 6, '#3a3550')}
      {R(x - 6, y - 6, w + 12, 2, '#5a5478')}
      {R(x, y, w, h, '#1a0c08')}
      {R(x + 4, y + 8, w - 8, h - 8, '#7a2a14')}
      {R(x + 8, y + 14, w - 16, h - 14, '#c94f2b')}
      {R(x + 14, y + 22, w - 28, h - 22, '#ff7a1a')}
      {R(x + 20, y + 30, w - 40, h - 30, '#ffd166')}
      {R(x - 6, y + h - 4, w + 12, 6, '#2c2840')}
    </>
  )
}

/** An anvil on a stump. */
export function Anvil({ x, y }) {
  return (
    <>
      {R(x + 6, y + 14, 20, 16, '#5a3620')}
      {R(x + 6, y + 14, 20, 2, '#744528')}
      {R(x, y, 34, 6, '#6a6f78')}
      {R(x, y, 34, 1, '#aab0b8')}
      {R(x + 10, y + 6, 14, 8, '#4b4f58')}
      {R(x + 30, y + 1, 8, 3, '#6a6f78')}
    </>
  )
}

/** A cauldron on three legs over a base. */
export function Cauldron({ x, y, w = 36, h = 26, body = '#2c2840', rim = '#5a5478', fill = '#6fd38a' }) {
  return (
    <>
      {R(x + 3, y + h, 4, 6, '#1a1428')}
      {R(x + w - 7, y + h, 4, 6, '#1a1428')}
      {R(x + 2, y + 6, w - 4, h - 6, body)}
      {R(x, y + 8, w, h - 12, body)}
      {R(x + 2, y + 6, 2, h - 8, '#4a4466', 0.7)}
      {R(x - 1, y + 4, w + 2, 4, rim)}
      {R(x + 2, y + 2, w - 4, 3, fill)}
      {R(x + 2, y + 2, w - 4, 1, '#ffffff', 0.5)}
    </>
  )
}

/** A telescope on a tripod, aimed up and to the right. */
export function Telescope({ x, y }) {
  return (
    <>
      {R(x, y + 20, 2, 18, '#5a3620')}
      {R(x + 10, y + 20, 2, 18, '#5a3620')}
      {R(x + 20, y + 20, 2, 18, '#5a3620')}
      {R(x - 2, y + 18, 26, 3, '#744528')}
      <g transform={`rotate(-35 ${x + 11} ${y + 16})`}>
        {R(x + 4, y + 8, 40, 8, '#c9a46b')}
        {R(x + 4, y + 8, 40, 1, '#ffe8a3')}
        {R(x + 40, y + 6, 8, 12, '#8a6a3d')}
        {R(x - 2, y + 9, 8, 6, '#2c2840')}
      </g>
    </>
  )
}

/** A globe on a stand. */
export function Globe({ x, y, r = 10, sea = '#3d8fe5', land = '#5fb057' }) {
  return (
    <>
      {R(x + r - 2, y + r * 2, 4, 8, '#744528')}
      {R(x + r - 7, y + r * 2 + 8, 14, 3, '#5a3620')}
      {R(x + 3, y, r * 2 - 6, r * 2, sea)}
      {R(x, y + 3, r * 2, r * 2 - 6, sea)}
      {R(x + 4, y + 4, 6, 4, land)}
      {R(x + r + 1, y + r, 6, 5, land)}
      {R(x + 3, y + 2, 4, 2, '#ffffff', 0.5)}
      {R(x - 1, y + r - 1, r * 2 + 2, 2, '#c9a46b')}
    </>
  )
}

/** A round wall clock face (hands are Ambient). */
export function ClockFace({ x, y, r = 14, face = '#e8dcc0', rim = '#744528' }) {
  const d = r * 2
  return (
    <>
      {R(x + 3, y, d - 6, d, rim)}
      {R(x, y + 3, d, d - 6, rim)}
      {R(x + 4, y + 2, d - 8, d - 4, face)}
      {R(x + 2, y + 4, d - 4, d - 8, face)}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>{R(x + r - 1 + Math.round(Math.sin((i * Math.PI) / 2) * (r - 4)), y + r - 1 - Math.round(Math.cos((i * Math.PI) / 2) * (r - 4)), 2, 2, INK)}</g>
      ))}
      {R(x + r - 1, y + r - 1, 2, 2, INK)}
    </>
  )
}

/** A cog drawn as a ring of teeth (a still copy; GearSpin is the moving one). */
export function Cog({ x, y, r = 10, teeth = 8, c = '#c9a46b', hole = '#1a1428' }) {
  const out = []
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2
    out.push(<rect key={i} x={x + Math.round(Math.cos(a) * r) - 2} y={y + Math.round(Math.sin(a) * r) - 2} width="4" height="4" fill={c} />)
  }
  return (
    <>
      {R(x - r + 2, y - r + 2, (r - 2) * 2, (r - 2) * 2, c)}
      {out}
      {R(x - 3, y - 3, 6, 6, hole)}
      {R(x - r + 3, y - r + 3, 3, 3, '#ffffff', 0.35)}
    </>
  )
}

/** A hanging bunch of herbs. */
export function Herbs({ x, y, c = '#5fb057', len = 14 }) {
  return (
    <>
      {R(x + 3, y - 6, 2, 6, '#5a3620')}
      {R(x, y, 8, 3, '#a8744a')}
      {[0, 2, 4, 6].map((o, i) => (
        <g key={o}>{R(x + o - 1, y + 3, 2, len - i * 2, i % 2 ? c : '#4a8a45')}</g>
      ))}
    </>
  )
}

/** A tent: a triangle of cloth with a dark door. */
export function Tent({ x, y, w = 60, h = 40, c = '#a8523a', dark = '#2a1218' }) {
  const rows = []
  for (let i = 0; i < h; i++) {
    const half = Math.round((i / h) * (w / 2))
    rows.push(<rect key={i} x={x + w / 2 - half} y={y + i} width={half * 2} height="1" fill={i % 6 < 3 ? c : '#8a3a28'} />)
  }
  return (
    <>
      {rows}
      {R(x + w / 2 - 6, y + h - 16, 12, 16, dark)}
      {R(x + w / 2 - 1, y - 4, 2, 6, '#5a3620')}
    </>
  )
}

/** A stack of logs. */
export function Logs({ x, y }) {
  return (
    <>
      {R(x, y + 6, 26, 6, '#5a3620')}
      {R(x, y + 6, 26, 1, '#9a5f34')}
      {R(x + 2, y, 22, 6, '#744528')}
      {R(x + 2, y, 22, 1, '#c9874a')}
      {R(x + 23, y + 7, 3, 4, '#c9a46b')}
    </>
  )
}

/** A kettle on a stone. */
export function Kettle({ x, y }) {
  return (
    <>
      {R(x + 2, y + 12, 18, 6, '#6a6f78')}
      {R(x + 4, y + 2, 14, 10, '#2c2840')}
      {R(x + 4, y + 2, 14, 1, '#6a6488')}
      {R(x + 18, y + 4, 6, 2, '#2c2840')}
      {R(x + 6, y - 1, 10, 2, '#2c2840')}
    </>
  )
}

/** A hooded crate silhouette for the Black Market: a lump with two glowing eyes. */
export function Hooded({ x, y, c = '#1a1428', eye = '#ff5a8a' }) {
  return (
    <>
      {R(x + 4, y, 12, 6, c)}
      {R(x, y + 6, 20, 22, c)}
      {R(x + 2, y + 2, 16, 8, '#0a0710')}
      {R(x + 5, y + 5, 2, 2, eye)}
      {R(x + 13, y + 5, 2, 2, eye)}
    </>
  )
}

/** An open ledger / desk with an ink pot and a quill. */
export function Desk({ x, y, w = 56 }) {
  return (
    <>
      {R(x, y, w, 5, '#744528')}
      {R(x, y, w, 1, '#c9874a')}
      {R(x + 4, y + 5, 3, 22, '#5a3620')}
      {R(x + w - 7, y + 5, 3, 22, '#5a3620')}
      {R(x + 8, y - 4, 18, 4, '#e8dcc0')}
      {R(x + 17, y - 4, 1, 4, '#8a7050')}
      {R(x + w - 14, y - 6, 6, 6, '#1d1829')}
      {R(x + w - 12, y - 14, 1, 9, '#e8e0f0')}
      {R(x + w - 14, y - 16, 3, 3, '#e8e0f0')}
    </>
  )
}

/** A floating-in-air altar for the Shrine: a stone dais with a bowl. */
export function Altar({ x, y, w = 44 }) {
  return (
    <>
      {R(x, y + 14, w, 6, '#cfd8e8')}
      {R(x + 4, y + 8, w - 8, 6, '#e6ecf8')}
      {R(x + 8, y, w - 16, 8, '#cfd8e8')}
      {R(x + 12, y - 4, w - 24, 4, '#9fb0d0')}
      {R(x + 12, y - 4, w - 24, 1, '#ffffff', 0.8)}
      {R(x, y + 19, w, 1, '#9fb0d0')}
    </>
  )
}

/** An armillary ring set (the Firmament orrery): rings drawn as pixel ellipses. */
export function Orrery({ x, y, r = 22, c = '#c9a46b', core = '#ffd166' }) {
  const pts = []
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2
    pts.push(<rect key={`a${i}`} x={x + Math.round(Math.cos(a) * r)} y={y + Math.round(Math.sin(a) * r * 0.35)} width="2" height="2" fill={c} />)
    pts.push(<rect key={`b${i}`} x={x + Math.round(Math.cos(a) * r * 0.45)} y={y + Math.round(Math.sin(a) * r)} width="2" height="2" fill={c} />)
  }
  return (
    <>
      {pts}
      {R(x - 4, y - 4, 8, 8, core)}
      {R(x - 3, y - 3, 3, 3, '#ffffff', 0.7)}
    </>
  )
}

/** A hanging lamp / sign board: a plank on two chains with a few pixel "letters". */
export function Sign({ x, y, w = 40, c = '#3b2215', letters = '#ffd166', n = 5 }) {
  return (
    <>
      {R(x + 4, y - 8, 1, 8, '#6a6f78')}
      {R(x + w - 5, y - 8, 1, 8, '#6a6f78')}
      {R(x, y, w, 12, c)}
      {R(x, y, w, 1, '#5a3620')}
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>{R(x + 5 + i * Math.floor((w - 10) / n), y + 4, 3, 4, letters)}</g>
      ))}
    </>
  )
}

/** A stuffed owl on a perch. */
export function Owl({ x, y, c = '#8a6a3d', eye = '#ffd166' }) {
  return (
    <>
      {R(x - 2, y + 14, 16, 2, '#5a3620')}
      {R(x + 2, y, 8, 3, c)}
      {R(x, y + 3, 12, 11, c)}
      {R(x + 1, y + 11, 10, 3, '#c9a46b')}
      {R(x + 2, y + 5, 3, 3, eye)}
      {R(x + 7, y + 5, 3, 3, eye)}
      {R(x + 3, y + 6, 1, 1, INK)}
      {R(x + 8, y + 6, 1, 1, INK)}
      {R(x + 5, y + 8, 2, 2, '#ffb347')}
    </>
  )
}

/** A rolling library ladder on a rail. */
export function Ladder({ x, y, h = 70 }) {
  return (
    <>
      {R(x, y, 3, h, '#744528')}
      {R(x + 10, y, 3, h, '#744528')}
      {Array.from({ length: Math.floor(h / 9) }, (_, i) => (
        <g key={i}>{R(x + 3, y + 4 + i * 9, 7, 2, '#9a5f34')}</g>
      ))}
      {R(x - 2, y - 2, 17, 2, '#5a3620')}
    </>
  )
}

/** A rolled hammock-like sleeping creature, dark with a pair of closed eyes. */
export function Creature({ x, y, c = '#e8944a', belly = '#f6e0b8' }) {
  return (
    <>
      {R(x + 2, y + 4, 22, 8, INK)}
      {R(x, y + 6, 26, 6, INK)}
      {R(x + 3, y + 5, 20, 7, c)}
      {R(x + 1, y + 7, 24, 5, c)}
      {R(x + 1, y + 10, 8, 2, belly)}
      {R(x + 1, y + 3, 4, 4, c)}
      {R(x + 3, y + 8, 2, 1, INK)}
    </>
  )
}

/** A rug under the feet. */
export function Rug({ x, y, w = 80, h = 10, a = '#8a2a3a', b = '#ffd166' }) {
  return (
    <>
      {R(x, y, w, h, a)}
      {R(x + 3, y + 2, w - 6, h - 4, '#5a1a28')}
      {R(x + 3, y + 2, w - 6, 1, b, 0.8)}
      {R(x + 3, y + h - 3, w - 6, 1, b, 0.8)}
      {R(x, y + h, w, 1, INK, 0.4)}
    </>
  )
}

// ---------------------------------------------------------------------------
// Ambient props: these move (rooms.css). Each carries one class.
// ---------------------------------------------------------------------------

/** A two-frame flame: a stack of three rects that flicker upward by a pixel. */
export function Flame({ x, y, w = 6, h = 10, outer = '#ff7a1a', mid = '#ffd166', inner = '#fff4d6', delay = 0 }) {
  return (
    <g className="r-flame" style={{ '--d': `${delay}s` }}>
      {R(x, y + 2, w, h - 2, outer)}
      {R(x + 1, y, w - 2, h - 1, outer)}
      {R(x + 1, y + 3, w - 2, h - 4, mid)}
      {R(x + 2, y + h - 5, Math.max(1, w - 4), 4, inner)}
    </g>
  )
}

/** A few puffs of steam or smoke rising in steps. */
export function Steam({ x, y, n = 3, c = '#e8f0f2', spread = 10, rise = 14, slow = 1 }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <rect
          key={i}
          className="r-steam"
          x={x + ((i * 7) % spread)}
          y={y}
          width={2 + (i % 2)}
          height={2 + (i % 2)}
          fill={c}
          style={{ '--rise': `${rise}px`, '--dur': `${(3.2 + i * 0.7) * slow}s`, '--delay': `${-i * 1.1}s`, '--sway': `${i % 2 ? 2 : -2}px` }}
        />
      ))}
    </g>
  )
}

/** Sparks flung up and out of a point. */
export function Sparks({ x, y, n = 6, c = '#ffd166', c2 = '#ff7a1a', up = 18, side = 12 }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <rect
          key={i}
          className="r-spark"
          x={x}
          y={y}
          width="1"
          height="1"
          fill={i % 2 ? c : c2}
          style={{ '--dx': `${(i % 2 ? 1 : -1) * (3 + ((i * 5) % side))}px`, '--dy': `${-(6 + ((i * 7) % up))}px`, '--dur': `${1.1 + (i % 3) * 0.4}s`, '--delay': `${-i * 0.37}s` }}
        />
      ))}
    </g>
  )
}

/** A pendulum: a rod and a bob swinging in steps. */
export function Pendulum({ x, y, len = 40, bob = 8, rod = '#c9a46b', c = '#ffd166', dur = 3.2 }) {
  return (
    <g className="r-pendulum" style={{ '--dur': `${dur}s`, transformOrigin: `${x}px ${y}px` }}>
      {R(x, y, 1, len, rod)}
      {R(x - Math.floor(bob / 2), y + len, bob, bob, c)}
      {R(x - Math.floor(bob / 2), y + len, bob, 1, '#ffffff', 0.5)}
    </g>
  )
}

/** A gear that turns in whole steps. */
export function GearSpin({ x, y, r = 10, teeth = 8, c = '#c9a46b', dur = 16, reverse = false }) {
  return (
    <g className="r-spin" style={{ '--dur': `${dur}s`, '--n': teeth, '--dir': reverse ? 'reverse' : 'normal', transformOrigin: `${x}px ${y}px` }}>
      <Cog x={x} y={y} r={r} teeth={teeth} c={c} />
    </g>
  )
}

/** A clock hand that ticks once a second round the face. */
export function ClockHand({ x, y, len = 10, c = '#120c1a', dur = 12, steps = 12 }) {
  return (
    <g className="r-tick" style={{ '--dur': `${dur}s`, '--n': steps, transformOrigin: `${x}px ${y}px` }}>
      {R(x, y - len, 1, len, c)}
    </g>
  )
}

/** Sand grains falling through an hourglass neck. */
export function SandFall({ x, y, h = 10, c = '#ffd166' }) {
  return <rect className="r-sand" x={x} y={y} width="1" height={h} fill={c} />
}

/** Stars that twinkle out of step with each other. */
export function Twinkles({ stars }) {
  return (
    <>
      {stars.map(([sx, sy, d, big], i) => (
        <g key={i} className="r-twinkle" style={{ '--d': `${d}s` }}>
          {R(sx, sy, 1, 1, '#fff4d6')}
          {big && R(sx - 1, sy, 3, 1, '#fff4d6', 0.5)}
          {big && R(sx, sy - 1, 1, 3, '#fff4d6', 0.5)}
        </g>
      ))}
    </>
  )
}

/** Bubbles rising in a jar or cauldron. */
export function Bubbles({ x, y, n = 3, c = '#c6ffd4', rise = 12 }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} className="r-bubble" x={x + ((i * 5) % 12)} y={y} width={i % 2 ? 1 : 2} height={i % 2 ? 1 : 2} fill={c} style={{ '--rise': `${rise}px`, '--dur': `${2 + i * 0.6}s`, '--delay': `${-i * 0.8}s` }} />
      ))}
    </g>
  )
}

/** Something that bobs a pixel up and down (a floating ware, a feather). */
export function Bob({ children, dur = 4, delay = 0, amp = 1 }) {
  return (
    <g className="r-bob" style={{ '--dur': `${dur}s`, '--delay': `${delay}s`, '--amp': `${amp}px` }}>
      {children}
    </g>
  )
}

/** A thing that sways side to side by a pixel (a hanging lantern, herbs). */
export function Sway({ children, dur = 6, delay = 0 }) {
  return (
    <g className="r-sway" style={{ '--dur': `${dur}s`, '--delay': `${delay}s` }}>
      {children}
    </g>
  )
}

/** A thing that pulses in opacity (a rune, a glyph, a ticker light). */
export function Pulse({ children, dur = 3, delay = 0, lo = 0.35 }) {
  return (
    <g className="r-pulse" style={{ '--dur': `${dur}s`, '--delay': `${delay}s`, '--lo': lo }}>
      {children}
    </g>
  )
}

/** Eyes that appear in the dark, blink and vanish (the Black Market, the Pantry). */
export function WatchingEyes({ x, y, c = '#ff5a8a', dur = 9, delay = 0 }) {
  return (
    <g className="r-eyes" style={{ '--dur': `${dur}s`, '--delay': `${delay}s` }}>
      {R(x, y, 2, 2, c)}
      {R(x + 5, y, 2, 2, c)}
    </g>
  )
}
