import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { useVisualEnv } from '../VisualEnv.jsx'
import KeeperRig from '../rigs/KeeperRig.jsx'
import { seeded } from './props.jsx'
import { ROOM_LOADERS } from './rooms.js'
import './rooms.css'

const W = 320
const H = 180

const lazyRooms = new Map()
function lazyRoom(id) {
  if (!lazyRooms.has(id)) lazyRooms.set(id, lazy(ROOM_LOADERS[id]))
  return lazyRooms.get(id)
}

// Floating specks: dust, embers, feathers, vapor, shadow, stars. One CSS loop each, all stepped.
const MOTE_KINDS = {
  dust: { color: '#e8dcc0', dx: [-4, 10], dy: [-18, -6], peak: 0.5, dur: [10, 18] },
  ember: { color: '#ff9a3a', dx: [-8, 8], dy: [-40, -18], peak: 0.9, dur: [2.5, 5] },
  feather: { color: '#eef3ff', dx: [-12, 12], dy: [18, 40], peak: 0.8, dur: [9, 16], w: 2 },
  vapor: { color: '#cfe8f2', dx: [-6, 6], dy: [-26, -10], peak: 0.35, dur: [6, 11] },
  shadow: { color: '#07060e', dx: [-10, 10], dy: [-8, 8], peak: 0.55, dur: [7, 14], w: 3 },
  star: { color: '#fff4d6', dx: [0, 0], dy: [0, 0], peak: 1, dur: [3, 6] },
  spark: { color: '#ffd166', dx: [-6, 6], dy: [-24, -10], peak: 0.9, dur: [1.6, 3] },
}

function Motes({ cfg, seed = 3 }) {
  const items = useMemo(() => {
    const kind = MOTE_KINDS[cfg.kind] ?? MOTE_KINDS.dust
    const rnd = seeded(seed + (cfg.count ?? 14))
    const [x0, y0, x1, y1] = cfg.area ?? [0, 20, 320, 140]
    const between = ([a, b]) => a + rnd() * (b - a)
    return Array.from({ length: cfg.count ?? 14 }, () => ({
      x: Math.round(x0 + rnd() * (x1 - x0)),
      y: Math.round(y0 + rnd() * (y1 - y0)),
      dx: Math.round(between(kind.dx)),
      dy: Math.round(between(kind.dy)),
      dur: between(kind.dur).toFixed(1),
      delay: (-rnd() * 14).toFixed(1),
      w: kind.w ?? 1,
      color: cfg.color ?? kind.color,
      peak: kind.peak,
    }))
  }, [cfg, seed])
  return (
    <svg className="r-layer" viewBox={`0 0 ${W} ${H}`} width={W} height={H} shapeRendering="crispEdges" aria-hidden="true">
      {items.map((m, i) => (
        <rect
          key={i}
          className="r-mote"
          x={m.x}
          y={m.y}
          width={m.w}
          height={m.w === 2 ? 1 : m.w}
          fill={m.color}
          style={{ '--dx': `${m.dx}px`, '--dy': `${m.dy}px`, '--n': Math.max(2, Math.abs(m.dy)), '--dur': `${m.dur}s`, '--delay': `${m.delay}s`, '--peak': m.peak }}
        />
      ))}
    </svg>
  )
}

function Lights({ lights, calm }) {
  return lights.map((l, i) => (
    <span
      key={i}
      className="r-light"
      data-flicker={l.flicker && !calm ? '' : undefined}
      style={{
        left: l.x - l.r,
        top: l.y - l.r,
        width: l.r * 2,
        height: l.r * 2,
        background: `radial-gradient(circle, ${l.c} 0%, transparent 70%)`,
        opacity: l.o ?? 0.6,
        '--d': `${i * 0.7}s`,
      }}
    />
  ))
}

/** The realm's palette shift over the same room (Elementa none; the rest wash, grid, bands or dissolve). */
function Tint({ realm, calm }) {
  if (!realm || realm === 'elementa') return null
  return (
    <div className="r-tint" data-realm={realm} aria-hidden="true">
      {realm === 'empyrean' && <div className="r-tint__grid" />}
      {realm === 'meridian' && !calm && <div className="r-tint__bands" />}
      {realm === 'pleroma' && !calm && <div className="r-tint__dissolve" />}
    </div>
  )
}

function RoomArt({ room, calm, realm, keeper, tone, meter }) {
  const { Back, Ambient, Front, motes } = room
  const lights = typeof room.lights === 'function' ? room.lights(tone, meter) : room.lights
  return (
    <>
      <svg className="r-layer" viewBox={`0 0 ${W} ${H}`} width={W} height={H} shapeRendering="crispEdges" aria-hidden="true">
        <Back realm={realm} tone={tone} meter={meter} />
      </svg>
      <Lights lights={lights ?? []} calm={calm} />
      {!calm && Ambient && (
        <svg className="r-layer" viewBox={`0 0 ${W} ${H}`} width={W} height={H} shapeRendering="crispEdges" aria-hidden="true">
          <Ambient realm={realm} tone={tone} meter={meter} />
        </svg>
      )}
      {keeper && (
        <div className="r-keeper" style={{ left: room.keeper?.x ?? 270, top: room.keeper?.y ?? 84 }}>
          <KeeperRig id={keeper.id} size={room.keeper?.size ?? 28} {...keeper.props} blinkOnly={calm} />
        </div>
      )}
      {Front && (
        <svg className="r-layer" viewBox={`0 0 ${W} ${H}`} width={W} height={H} shapeRendering="crispEdges" aria-hidden="true">
          <Front realm={realm} tone={tone} />
        </svg>
      )}
      {!calm && motes && <Motes cfg={motes} />}
      <Tint realm={realm} calm={calm} />
    </>
  )
}

/**
 * One room or backdrop, drawn from its module (rooms/*.jsx) in the shared
 * 320 by 180 art box. `framed` fits it in a box at a whole-number scale (the
 * Visual Lab); otherwise it covers the window behind the game (the shops),
 * dimmed so prices and buttons stay readable. `keeper` ({ id, props }) puts a
 * rig in the room (the Lab shows it; the shop keeps its own portrait).
 * Reduced motion switches every loop off; the low-end tier draws only the
 * static layers.
 */
export default function RoomStage({ roomId, realm = 'elementa', tone, meter = 0, framed = false, dim = 1, keeper = null, onCount }) {
  const { reduced, quality } = useVisualEnv()
  const calm = quality === 'low'
  const rootRef = useRef(null)
  const [box, setBox] = useState({ w: 1280, h: 720 })
  const Room = ROOM_LOADERS[roomId] ? lazyRoom(roomId) : null

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const measure = () => setBox({ w: framed ? el.clientWidth : window.innerWidth, h: framed ? 0 : window.innerHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [framed])

  // Whole-number scale when there is room, a fitted fraction on phones.
  let scale
  let left = 0
  let top = 0
  if (framed) {
    scale = box.w >= W * 2 ? Math.floor(box.w / W) : Math.max(0.5, box.w / W)
    left = Math.max(0, (box.w - W * scale) / 2)
  }
  else {
    scale = box.w >= 700 ? Math.ceil(Math.max(box.w / W, box.h / H)) : box.h / H
    left = (box.w - W * scale) / 2
    top = (box.h - H * scale) / 2
  }

  // Tell the Lab how many animations the room is running (after it has mounted).
  useEffect(() => {
    if (!onCount) return
    const id = setTimeout(() => onCount(rootRef.current ? document.getAnimations().filter((a) => rootRef.current.contains(a.effect?.target)).length : 0), 600)
    return () => clearTimeout(id)
  }, [onCount, roomId, realm, reduced, calm])

  if (!Room) return null
  return (
    <div
      ref={rootRef}
      className="r-root"
      data-framed={framed ? '' : undefined}
      data-reduced={reduced ? '' : undefined}
      data-calm={calm ? '' : undefined}
      style={framed ? { height: H * scale } : undefined}
      aria-hidden={framed ? undefined : 'true'}
    >
      <div className="r-stage" style={{ transform: `translate(${left}px, ${top}px) scale(${scale})` }}>
        <Suspense fallback={null}>
          <RoomLoaded Room={Room} calm={calm} realm={realm} keeper={keeper} tone={tone} meter={meter} />
        </Suspense>
        {dim > 0 && <div className="r-dim" style={{ '--dim-core': 0.5 * dim, '--dim-mid': 0.32 * dim, '--dim-top': framed ? 0 : 0.3 * dim, opacity: 1 }} />}
      </div>
    </div>
  )
}

// A room module exports its art as the default export of a lazy chunk; this wrapper reads it.
function RoomLoaded({ Room, calm, realm, keeper, tone, meter }) {
  return <Room>{(room) => <RoomArt room={room} calm={calm} realm={realm} keeper={keeper} tone={tone} meter={meter} />}</Room>
}
