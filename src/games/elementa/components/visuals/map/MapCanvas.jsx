import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import strings from '../../../../../i18n/strings.js'
import { useGameSettings } from '../../../utils/gameSettingsContext.jsx'
import { useVisualEnv } from '../VisualEnv.jsx'
import { findImageOverride } from '../../../data/visualRegistry.js'
import { shopTypeById } from '../../../data/shops.js'
import BossAvatar from '../../BossAvatar.jsx'
import { bossById, PRIMORDIAL } from '../../../data/bossModifiers.js'
import { localizeBossModifier } from '../../../data/i18n.js'
import { shopNameIn } from '../../../data/realm3.js'
import { ShopSign, Traveler, Flag } from './mapIcons.jsx'
import {
  MAP_REALMS,
  REALM_STYLE,
  SELLS_LABEL,
  focusOrder,
  knownBossAt,
  layoutRoad,
  neighborInDirection,
  nextChoices,
  nodeState,
  pointOnTrail,
  reachableFrom,
  realmOfRound,
  sellsOf,
  sightOf,
  trailBetween,
} from './mapModel.js'
import './map.css'

// The Road as a map (VISUALS.md V6). One component draws every variant of it:
//   compact  the shop's map table and the run preview: a fixed window onto the next rows, no gestures
//   panel    the Run Info page: the whole Road in a box, drag and zoom with Ctrl or the buttons
//   full     the full-screen map: wheel, drag, pinch and keys all work
// The data model and every rule stay in engine/map.js; this file only reads a map and draws it.
// The drawing lives in content coordinates (pixels at zoom 1); zoom and pan are one transform on
// one group, applied straight to the DOM while a gesture runs so a drag never re-renders the stops.

const L = (en, es) => ({ en, es })
const MIN_SCALE = 0.55
const MAX_SCALE = 2.6
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const STATE_WORD = {
  here: L('you are here', 'estás aquí'),
  picked: L('picked', 'elegida'),
  choice: L('you can go here', 'puedes ir aquí'),
  walked: L('visited', 'visitada'),
  reachable: L('ahead on the Road', 'adelante en el Camino'),
  fog: L('out of reach', 'fuera de alcance'),
  unknown: L('not seen yet', 'aún sin ver'),
}

/** Looks for a hand-drawn sign for a shop (the swap rule) once, and says where it is. */
function useSignOverride(type) {
  const [src, setSrc] = useState(null)
  useEffect(() => {
    let live = true
    findImageOverride(`map.node.${type}`).then((s) => live && setSrc(s))
    return () => {
      live = false
    }
  }, [type])
  return src
}

/** One stop: a wax seal in the shop's color with its sign on it. Memoized, so panning never redraws it. */
const Stop = memo(function Stop({ node, x, y, r, hitR, status, label, color, legendary, onPick, onHover, onLeave, tabIndex, quality }) {
  const src = useSignOverride(node.type)
  const pickable = status === 'choice' || status === 'picked'
  const fogged = status === 'fog' || status === 'unknown'
  const walked = status === 'walked'
  const icon = Math.round(r * 1.25)
  return (
    <g
      className="map-stop"
      data-status={status}
      data-id={node.id}
      transform={`translate(${x} ${y})`}
      role="button"
      tabIndex={tabIndex}
      aria-label={label}
      aria-disabled={!pickable}
      aria-pressed={pickable ? status === 'picked' : undefined}
      onClick={() => pickable && onPick?.(node.id)}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && pickable) {
          e.preventDefault()
          onPick?.(node.id)
        }
      }}
      onPointerEnter={() => onHover(node.id)}
      onPointerLeave={onLeave}
      onFocus={() => {
        onHover(node.id)
          }}
      onBlur={onLeave}
      style={{ cursor: pickable ? 'pointer' : 'default' }}
    >
      {/* the hit target: at least 44 px on screen, however far the map is zoomed out */}
      <circle className="map-hit" r={hitR} fill="transparent" />
      {legendary && !fogged && <circle className="map-glow" r={r + 7} fill="#ffd166" opacity="0.22" />}
      {status === 'choice' && quality !== 'low' && <circle className="map-pulse" r={r + 4} fill="none" stroke={color} strokeWidth="2" />}
      <circle className="map-seal" r={r + 2} fill="#120c1a" opacity={fogged ? 0.28 : 1} />
      <circle r={r} fill={fogged ? 'rgba(150,140,170,0.28)' : 'var(--map-seal, #f2e6c8)'} stroke={fogged ? 'rgba(80,70,100,0.45)' : color} strokeWidth={status === 'here' || status === 'picked' ? 4 : 3} opacity={walked ? 0.78 : 1} />
      {!fogged && <circle r={r - 4} fill="none" stroke="rgba(18,12,26,0.18)" strokeWidth="1" />}
      <g transform={`translate(${-icon / 2} ${-icon / 2})`} opacity={fogged ? 0.28 : walked ? 0.7 : 1} style={fogged ? { filter: 'grayscale(1)' } : undefined}>
        {status === 'unknown' ? (
          <text x={icon / 2} y={icon * 0.78} textAnchor="middle" className="pixel-score" fontSize={Math.round(r * 0.7)} fill="#6a6480">
            ?
          </text>
        ) : (
          <ShopSign type={legendary && !['bazaar', 'astral'].includes(node.type) ? 'crown' : node.type} color={color} size={icon} src={src} />
        )}
      </g>
      {walked && (
        <path d={`M ${-r * 0.5} ${r * 0.05} l ${r * 0.28} ${r * 0.3} l ${r * 0.55} ${-r * 0.7}`} fill="none" stroke="#3a7a2a" strokeWidth="3" strokeLinecap="square" opacity="0.85" />
      )}
      <circle className="map-ring" r={r + 8} fill="none" stroke="var(--gold-hi, #ffe9a0)" strokeWidth="3" />
    </g>
  )
})

/** The patterns that make each realm's paper what it is. Drawn once, shared by every band. */
function PaperDefs({ quality }) {
  const stars = useMemo(() => {
    let s = 7
    const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
    return Array.from({ length: 26 }, () => ({ x: Math.round(rnd() * 120), y: Math.round(rnd() * 120), big: rnd() < 0.18 }))
  }, [])
  return (
    <defs>
      <pattern id="map-p-grain" width="12" height="12" patternUnits="userSpaceOnUse">
        <rect x="2" y="3" width="1" height="1" fill="rgba(90,60,30,0.16)" />
        <rect x="8" y="9" width="1" height="1" fill="rgba(90,60,30,0.14)" />
        <rect x="10" y="1" width="1" height="1" fill="rgba(255,255,255,0.2)" />
        <rect x="5" y="7" width="1" height="1" fill="rgba(255,255,255,0.16)" />
      </pattern>
      <pattern id="map-p-stars" width="120" height="120" patternUnits="userSpaceOnUse">
        {stars.map((st, i) => (
          <rect key={i} x={st.x} y={st.y} width={st.big ? 3 : 2} height={st.big ? 3 : 2} fill={st.big ? '#ffffff' : '#9fa4ff'} opacity={st.big ? 0.9 : 0.55} />
        ))}
        <path d="M 20 40 L 44 62 L 70 50 L 96 78" fill="none" stroke="#7a7ee8" strokeWidth="1" opacity="0.35" />
      </pattern>
      <pattern id="map-p-grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(159,216,255,0.16)" strokeWidth="1" />
        <rect x="0" y="0" width="3" height="3" fill="rgba(159,216,255,0.4)" />
      </pattern>
      <pattern id="map-p-split" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
        <rect width="20" height="40" fill="rgba(255,233,160,0.06)" />
        <rect x="20" width="20" height="40" fill="rgba(0,0,0,0.12)" />
      </pattern>
      {quality !== 'low' && (
        <>
          <radialGradient id="map-p-blob">
            <stop offset="0" stopColor="#ff8aa8" stopOpacity="0.28" />
            <stop offset="1" stopColor="#ff8aa8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="map-fog" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#8a86a0" stopOpacity="0" />
            <stop offset="0.18" stopColor="#8a86a0" stopOpacity="0.5" />
            <stop offset="1" stopColor="#8a86a0" stopOpacity="0.72" />
          </linearGradient>
        </>
      )}
    </defs>
  )
}

/** A realm's band of paper behind its rows, with its pattern and a rule on each edge. */
function RealmBand({ realm, y0, y1, width, quality }) {
  const st = REALM_STYLE[realm]
  const id = `map-g-${realm}`
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={st.paper} />
          <stop offset="1" stopColor={st.paper2} />
        </linearGradient>
      </defs>
      <rect x="0" y={y0} width={width} height={y1 - y0} fill={`url(#${id})`} />
      {quality !== 'low' && st.pattern === 'grain' && <rect x="0" y={y0} width={width} height={y1 - y0} fill="url(#map-p-grain)" />}
      {quality !== 'low' && st.pattern === 'stars' && <rect x="0" y={y0} width={width} height={y1 - y0} fill="url(#map-p-stars)" />}
      {quality !== 'low' && st.pattern === 'grid' && <rect x="0" y={y0} width={width} height={y1 - y0} fill="url(#map-p-grid)" />}
      {quality !== 'low' && st.pattern === 'split' && <rect x="0" y={y0} width={width} height={y1 - y0} fill="url(#map-p-split)" />}
      {quality !== 'low' && st.pattern === 'blur' && (
        <>
          {Array.from({ length: Math.max(2, Math.round((y1 - y0) / 140)) }, (_, i) => (
            <circle key={i} cx={(i * 97) % width} cy={y0 + 40 + i * 110} r="86" fill="url(#map-p-blob)" />
          ))}
        </>
      )}
      <rect x="0" y={y0} width="3" height={y1 - y0} fill={st.edge} opacity="0.55" />
      <rect x={width - 3} y={y0} width="3" height={y1 - y0} fill={st.edge} opacity="0.55" />
    </g>
  )
}

/** A gate between two realms: two pillars, an arch, a glow and the realm's name on a ribbon. */
function Gate({ realm, y, width, lang, quality }) {
  const st = REALM_STYLE[realm]
  const name = (MAP_REALMS[realm].gate ?? MAP_REALMS[realm].name)[lang]
  const cx = width / 2
  const half = Math.min(width / 2 - 18, 118)
  return (
    <g className="map-gate" transform={`translate(0 ${y})`}>
      {quality !== 'low' && <ellipse cx={cx} cy="0" rx={half + 16} ry="22" fill={st.gate} opacity="0.2" />}
      <rect x={cx - half} y="-24" width="9" height="30" fill="#120c1a" />
      <rect x={cx - half + 2} y="-22" width="5" height="26" fill={st.gate} opacity="0.85" />
      <rect x={cx + half - 9} y="-24" width="9" height="30" fill="#120c1a" />
      <rect x={cx + half - 7} y="-22" width="5" height="26" fill={st.gate} opacity="0.85" />
      <path d={`M ${cx - half + 4} -22 Q ${cx} -48 ${cx + half - 4} -22`} fill="none" stroke="#120c1a" strokeWidth="7" />
      <path d={`M ${cx - half + 4} -22 Q ${cx} -48 ${cx + half - 4} -22`} fill="none" stroke={st.gate} strokeWidth="3" />
      <line x1="16" y1="0" x2={cx - half - 6} y2="0" stroke={st.edge} strokeWidth="2" strokeDasharray="2 6" />
      <line x1={cx + half + 6} y1="0" x2={width - 16} y2="0" stroke={st.edge} strokeWidth="2" strokeDasharray="2 6" />
      <g transform={`translate(${cx} 6)`}>
        <rect x={-(name.length * 4 + 14)} y="-9" width={name.length * 8 + 28} height="18" fill="#120c1a" />
        <rect x={-(name.length * 4 + 12)} y="-7" width={name.length * 8 + 24} height="14" fill={st.gate} opacity="0.92" />
        <text textAnchor="middle" y="4" className="pixel-score" fontSize="8" fill="#120c1a">
          {name.toUpperCase()}
        </text>
      </g>
    </g>
  )
}

/** The banner of a boss that waits before a row: a pennant on a pole with its portrait. */
function BossBanner({ known, x, y, lang, size }) {
  const boss = known ? (known === 'primordial' ? PRIMORDIAL : bossById(known)) : null
  const name = boss ? localizeBossModifier(boss, lang).name : '?'
  const w = Math.round(size * 0.66)
  const top = -Math.round(size * 0.5)
  return (
    <g transform={`translate(${x} ${y})`} className="map-banner">
      <title>{boss ? name : lang === 'es' ? 'Un jefe espera antes de esta tienda' : 'A boss waits before this shop'}</title>
      <rect x="-1" y={top - 4} width="3" height={Math.round(size * 1.15)} fill="#120c1a" />
      <path d={`M 2 ${top} h ${w} l -${Math.round(w * 0.2)} ${Math.round(size * 0.36)} l ${Math.round(w * 0.2)} ${Math.round(size * 0.36)} h -${w} z`} fill="#7a1c28" stroke="#120c1a" strokeWidth="2" />
      <g transform={`translate(${Math.round(w * 0.14)} ${top + 3})`}>
        <BossAvatar id={known || 'unknown'} size={Math.round(w * 0.72)} unknown={!known} />
      </g>
    </g>
  )
}

/** The sign over the first stop of a row for its shop name, shown when a stop is hovered or focused. */
function Tooltip({ tip, view, box, lang, t, state, mapState }) {
  if (!tip) return null
  const { node, cx, cy } = tip
  const type = shopTypeById(node.type)
  const [px, py] = [cx * view.s + view.tx, cy * view.s + view.ty]
  const w = 214
  const left = clamp(px - w / 2, 6, Math.max(6, box.w - w - 6))
  const below = py < 120
  const sells = sellsOf(type).map((k) => SELLS_LABEL[k][lang])
  return (
    <div className="map-tip" role="tooltip" style={{ left, top: below ? py + 34 : py - 14, transform: below ? 'none' : 'translateY(-100%)', width: w, '--tip': type.color }}>
      <strong style={{ color: type.color }}>{shopNameIn(state, type, lang)}</strong>
      <span className="map-tip__blurb">{type.blurb[lang]}</span>
      {sells.length > 0 && (
        <span className="map-tip__sells">
          {t('elementa.map.sells')}: {sells.join(', ')}
        </span>
      )}
      <span className="map-tip__state">{STATE_WORD[mapState][lang]}</span>
    </div>
  )
}

/**
 * The map. `variant` picks what it can do (see the top of the file); `width`, `rowHeight` and
 * `nodeSize` are the pixel sizes of the compact window and the starting sizes of the others.
 */
export default function MapCanvas({
  state,
  fromRound,
  toRound,
  onPick,
  width = 220,
  rowHeight = 64,
  nodeSize = 40,
  variant = 'compact',
  height: fixedHeight = null,
  scrollToCurrent = false,
  onOpenFull = null,
  onClose = null,
  mapRef = null,
}) {
  const env = useVisualEnv()
  const settings = useGameSettings()
  const lang = env.lang
  // the words follow the visual environment's language (the Lab can differ from the site's)
  const t = useCallback((key) => strings[key]?.[lang] ?? key, [lang])
  const reduced = env.reduced || settings.gameSpeed === 'instant'
  const quality = env.quality
  const interactive = variant !== 'compact'
  const map = state.map

  // The box the map is shown in. Interactive maps fill their container, and the Road spreads out
  // to use its width (a wide screen gets wider rows; the seals keep their size).
  const [box, setBox] = useState({ w: width, h: fixedHeight ?? 480 })
  const geometry = useMemo(
    () =>
      interactive
        ? { width: clamp(Math.round(box.w || width), 300, variant === 'full' ? 820 : 560), rowHeight: Math.max(rowHeight, 92), nodeSize: Math.max(nodeSize, 50) }
        : { width, rowHeight, nodeSize },
    [interactive, variant, box.w, width, rowHeight, nodeSize],
  )
  const layout = useMemo(() => layoutRoad({ state, fromRound, toRound, ...geometry }), [state, fromRound, toRound, geometry])
  const choices = useMemo(() => new Set(onPick ? nextChoices(map).map((n) => n.id) : []), [map, onPick])
  const reachable = useMemo(() => reachableFrom(map), [map])
  const path = useMemo(() => new Set(map.path), [map.path])
  const sight = sightOf(state)
  const statusOf = useCallback(
    (node) => nodeState(map, node, { reachable, choices, sight: interactive ? sight : 99, path }),
    [map, reachable, choices, sight, interactive, path],
  )
  const r = layout.nodeSize / 2

  // ---- the view: scale and offset, kept in a ref and written straight to the DOM ----
  const rootRef = useRef(null)
  const gRef = useRef(null)
  const viewRef = useRef({ s: 1, tx: 0, ty: 0 })
  const [view, setView] = useState({ s: 1, tx: 0, ty: 0 })
  const [tip, setTip] = useState(null)
  const animRef = useRef(0)
  const commitTimer = useRef(0)

  const applyView = useCallback((v, commit = false) => {
    viewRef.current = v
    gRef.current?.setAttribute('transform', `translate(${v.tx} ${v.ty}) scale(${v.s})`)
    if (commit) {
      window.clearTimeout(commitTimer.current)
      setView(v)
    } else {
      window.clearTimeout(commitTimer.current)
      commitTimer.current = window.setTimeout(() => setView(viewRef.current), 90)
    }
  }, [])

  const bounds = useCallback(
    (v) => {
      // The map may be dragged until its edge reaches the middle of the box, never further.
      const s = v.s
      const cw = layout.width * s
      const ch = layout.height * s
      const tx = cw <= box.w ? (box.w - cw) / 2 : clamp(v.tx, box.w - cw, 0)
      const ty = ch <= box.h ? (box.h - ch) / 2 : clamp(v.ty, box.h - ch, 0)
      return { s, tx, ty }
    },
    [layout.width, layout.height, box.w, box.h],
  )

  const here = useMemo(() => map.layers.flat().find((n) => n.id === map.currentId), [map])
  const centerOn = useCallback(
    (node, animate = true, scale = null) => {
      if (!node) return
      const s = scale ?? viewRef.current.s
      const target = bounds({ s, tx: box.w / 2 - layout.x(node.col) * s, ty: box.h * 0.58 - layout.y(node.round) * s })
      cancelAnimationFrame(animRef.current)
      if (!animate || reduced) return applyView(target, true)
      const from = viewRef.current
      const t0 = performance.now()
      const step = (now) => {
        const k = clamp((now - t0) / 360, 0, 1)
        const e = 1 - Math.pow(1 - k, 4)
        applyView({ s: from.s + (target.s - from.s) * e, tx: from.tx + (target.tx - from.tx) * e, ty: from.ty + (target.ty - from.ty) * e }, k >= 1)
        if (k < 1) animRef.current = requestAnimationFrame(step)
      }
      animRef.current = requestAnimationFrame(step)
    },
    [bounds, box.w, box.h, layout, reduced, applyView],
  )

  const fit = useCallback(
    (animate = false) => {
      const s = clamp(box.w / layout.width, 0.7, 1.35)
      centerOn(here, animate, s)
    },
    [box.w, layout.width, here, centerOn],
  )

  // The box size (interactive variants fill their container).
  useLayoutEffect(() => {
    if (!interactive || !rootRef.current) return undefined
    const el = rootRef.current
    const measure = () => setBox({ w: el.clientWidth || width, h: el.clientHeight || fixedHeight || 480 })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [interactive, width, fixedHeight])

  // Start centered on you, and again when the stop changes or the box is first measured.
  const firstFit = useRef(false)
  useEffect(() => {
    if (!interactive) return
    if (!firstFit.current || scrollToCurrent) {
      firstFit.current = true
      fit(false)
    }
  }, [interactive, fit, scrollToCurrent])
  useEffect(() => {
    if (interactive && firstFit.current) centerOn(here, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map.currentId])

  // ---- gestures: wheel, drag, pinch ----
  useEffect(() => {
    if (!interactive || !rootRef.current) return undefined
    const el = rootRef.current
    const pointers = new Map()
    let pinch = null
    let moved = 0
    const zoomAt = (px, py, factor) => {
      const v = viewRef.current
      const s = clamp(v.s * factor, MIN_SCALE, MAX_SCALE)
      const k = s / v.s
      applyView(bounds({ s, tx: px - (px - v.tx) * k, ty: py - (py - v.ty) * k }))
    }
    const onWheel = (e) => {
      const rect = el.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      if (variant === 'full' || e.ctrlKey || e.metaKey) {
        e.preventDefault()
        zoomAt(px, py, Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0016)))
      } else {
        e.preventDefault()
        const v = viewRef.current
        applyView(bounds({ ...v, ty: v.ty - e.deltaY }))
      }
    }
    const onDown = (e) => {
      if (e.target.closest?.('.map-stop, .map-controls, .map-tip') && pointers.size === 0 && e.pointerType === 'mouse') return
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      moved = 0
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: viewRef.current.s }
      }
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        // some browsers refuse capture for synthetic pointers: dragging still works inside the box
      }
    }
    const onMove = (e) => {
      const p = pointers.get(e.pointerId)
      if (!p) return
      const dx = e.clientX - p.x
      const dy = e.clientY - p.y
      p.x = e.clientX
      p.y = e.clientY
      moved += Math.abs(dx) + Math.abs(dy)
      if (pointers.size === 2 && pinch) {
        const [a, b] = [...pointers.values()]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        const rect = el.getBoundingClientRect()
        const mx = (a.x + b.x) / 2 - rect.left
        const my = (a.y + b.y) / 2 - rect.top
        const target = clamp(pinch.s * (d / pinch.d), MIN_SCALE, MAX_SCALE)
        zoomAt(mx, my, target / viewRef.current.s)
      } else if (pointers.size === 1 && moved > 3) {
        const v = viewRef.current
        applyView(bounds({ ...v, tx: v.tx + dx, ty: v.ty + dy }))
        el.dataset.dragging = ''
      }
    }
    const onUp = (e) => {
      pointers.delete(e.pointerId)
      if (pointers.size < 2) pinch = null
      if (pointers.size === 0) {
        delete el.dataset.dragging
        setView(viewRef.current)
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
    }
  }, [interactive, variant, bounds, applyView])

  useEffect(() => () => window.clearTimeout(commitTimer.current), [])
  useEffect(() => () => cancelAnimationFrame(animRef.current), [])

  // Let a parent drive the view (the Lab's buttons, tests).
  useEffect(() => {
    if (!mapRef) return undefined
    mapRef.current = {
      zoom: (f) => {
        const v = viewRef.current
        const s = clamp(v.s * f, MIN_SCALE, MAX_SCALE)
        const px = box.w / 2
        const py = box.h / 2
        const k = s / v.s
        applyView(bounds({ s, tx: px - (px - v.tx) * k, ty: py - (py - v.ty) * k }), true)
      },
      center: () => centerOn(here, true),
      fit: () => fit(true),
      get view() {
        return viewRef.current
      },
    }
    return () => {
      mapRef.current = null
    }
  })

  // ---- keyboard ----
  const order = useMemo(() => focusOrder(layout, statusOf), [layout, statusOf])
  const onHover = useCallback(
    (id) => {
      const node = map.layers.flat().find((n) => n.id === id)
      if (!node) return
      setTip({ node, cx: layout.x(node.col), cy: layout.y(node.round) })
    },
    [map.layers, layout],
  )
  const onLeave = useCallback(() => setTip(null), [])
  const focusStop = useCallback(
    (node) => {
      const el = rootRef.current?.querySelector(`[data-id="${node.id}"]`)
      el?.focus({ preventScroll: true })
      onHover(node.id)
      if (interactive) centerOn(node, true)
    },
    [centerOn, interactive, onHover],
  )
  const onKeyDown = (e) => {
    const dirs = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }
    const stopEl = e.target.closest?.('.map-stop')
    if (dirs[e.key] && stopEl) {
      const node = order.find((n) => n.id === stopEl.dataset.id)
      const next = node && neighborInDirection(layout, order, node, dirs[e.key])
      if (next) {
        e.preventDefault()
        focusStop(next)
        return
      }
    }
    if (!interactive) return
    const v = viewRef.current
    const stepPx = 70
    if (dirs[e.key]) {
      e.preventDefault()
      const d = { up: [0, stepPx], down: [0, -stepPx], left: [stepPx, 0], right: [-stepPx, 0] }[dirs[e.key]]
      applyView(bounds({ ...v, tx: v.tx + d[0], ty: v.ty + d[1] }), true)
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault()
      mapRef?.current?.zoom(1.25)
      if (!mapRef) zoomButton(1.25)
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault()
      if (!mapRef) zoomButton(0.8)
      else mapRef.current?.zoom(0.8)
    } else if (e.key === '0') {
      e.preventDefault()
      fit(true)
    } else if (e.key === 'c' || e.key === 'C' || e.key === 'Home') {
      e.preventDefault()
      centerOn(here, true)
    }
  }
  const zoomButton = (f) => {
    const v = viewRef.current
    const s = clamp(v.s * f, MIN_SCALE, MAX_SCALE)
    const px = box.w / 2
    const py = box.h / 2
    const k = s / v.s
    applyView(bounds({ s, tx: px - (px - v.tx) * k, ty: py - (py - v.ty) * k }), true)
  }

  // ---- the walker: a ghost of you that steps along the trail to the stop you pick ----
  const [walker, setWalker] = useState(null)
  const pendingRef = useRef(map.pendingId)
  useEffect(() => {
    const prev = pendingRef.current
    pendingRef.current = map.pendingId
    if (!map.pendingId || map.pendingId === prev || !here) return undefined
    const to = map.layers.flat().find((n) => n.id === map.pendingId)
    if (!to || to.round !== here.round + 1 || !layout.rows.includes(to.round) || !layout.rows.includes(here.round)) return undefined
    if (reduced) return undefined
    const pts = trailBetween(layout, here, to).pts
    let i = 0
    setWalker({ pts, t: 0 })
    const timer = window.setInterval(() => {
      i += 1
      if (i > 6) {
        window.clearInterval(timer)
        setWalker(null)
        return
      }
      setWalker({ pts, t: i / 6 })
    }, 85)
    return () => window.clearInterval(timer)
  }, [map.pendingId, here, layout, reduced, map.layers])

  // ---- what to draw ----
  const [firstRow, lastRow] = useMemo(() => {
    if (!interactive) return [fromRound, layout.toRound]
    // only the rows in view, with a margin of two rows
    const top = (-view.ty) / view.s - layout.rowHeight * 2
    const bottom = (box.h - view.ty) / view.s + layout.rowHeight * 2
    const inView = layout.rows.filter((round) => layout.y(round) >= top && layout.y(round) <= bottom)
    return inView.length ? [Math.min(...inView), Math.max(...inView)] : [layout.rows[layout.rows.length - 1] ?? fromRound, layout.rows[0] ?? fromRound]
  }, [interactive, view, box.h, layout, fromRound])
  const shown = layout.rows.filter((round) => round >= firstRow && round <= lastRow)

  // Realm bands: runs of rows on the same paper.
  const bands = useMemo(() => {
    const out = []
    for (const round of layout.rows) {
      const realm = realmOfRound(round, state)
      const y0 = layout.y(round) - layout.rowHeight / 2
      const y1 = layout.y(round) + layout.rowHeight / 2
      const last = out[out.length - 1]
      if (last && last.realm === realm) last.y1 = y1
      else out.push({ realm, y0, y1 })
    }
    // the top pad above the last row belongs to the realm after it
    if (layout.topPad && out.length) {
      out[0].y0 = 0
      out.unshift({ realm: 'unwritten', y0: 0, y1: layout.topPad })
      out[1].y0 = layout.topPad
    }
    // bands meet at the gates
    return out
  }, [layout, state])

  const hitR = Math.max(r, 22 / Math.max(view.s, 0.0001))
  const handlePick = useCallback((id) => onPick?.(id), [onPick])
  const currentStatusOfTip = tip ? statusOf(tip.node) : null

  // Edges.
  const edges = []
  for (const round of shown) {
    if (round === layout.toRound) continue
    for (const node of map.layers[round - 1]) {
      for (const id of node.next) {
        const to = map.layers[round]?.find((n) => n.id === id)
        if (!to || !layout.rows.includes(to.round)) continue
        const trail = trailBetween(layout, node, to)
        const walked = path.has(node.id) && path.has(to.id)
        const live = node.id === map.currentId
        const pickedTrail = live && map.pendingId === to.id
        const fromFog = !reachable.has(node.id) && !path.has(node.id)
        const beyond = interactive && to.round > sight && !walked
        edges.push(
          <g key={`${node.id}>${id}`} className="map-trail" style={{ color: REALM_STYLE[realmOfRound(node.round, state)].ink }} data-kind={walked ? 'walked' : pickedTrail ? 'picked' : live ? 'live' : fromFog || beyond ? 'fog' : 'ahead'}>
            <path d={trail.d} className="map-trail__under" />
            <path d={trail.d} className="map-trail__ink" />
          </g>,
        )
      }
    }
  }

  const sizeStyle = interactive ? { width: '100%', height: fixedHeight ?? '100%' } : { width: layout.width, height: layout.height }
  const svgW = interactive ? box.w : layout.width
  const svgH = interactive ? box.h : layout.height
  const personPos = here ? [layout.x(here.col), layout.y(here.round)] : null
  const walkPos = walker ? pointOnTrail(walker.pts, walker.t) : null

  return (
    <div
      ref={rootRef}
      className="map-root"
      data-variant={variant}
      data-motion={reduced ? 'off' : 'on'}
      data-quality={quality}
      style={sizeStyle}
      role="group"
      aria-label={t('elementa.map.road')}
      tabIndex={interactive ? 0 : -1}
      onKeyDown={onKeyDown}
    >
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="map-svg" shapeRendering="geometricPrecision">
        <PaperDefs quality={quality} />
        <g ref={gRef} transform={interactive ? `translate(${view.tx} ${view.ty}) scale(${view.s})` : undefined}>
          {bands.map((b) => (
            <RealmBand key={`${b.realm}-${b.y0}`} realm={b.realm} y0={b.y0} y1={b.y1} width={layout.width} quality={quality} />
          ))}
          {layout.gates.map((g) => (
            <Gate key={g.id} realm={g.realm} y={g.y} width={layout.width} lang={lang} quality={quality} />
          ))}
          {edges}
          {shown.map((round) => {
            const { boss, known } = knownBossAt(round, state)
            const st = REALM_STYLE[realmOfRound(round, state)]
            return (
              <g key={`label-${round}`}>
                {boss && <BossBanner known={known} x={10} y={layout.y(round) - 4} lang={lang} size={Math.round(layout.nodeSize * 0.9)} />}
                <text x={Math.round(layout.gutter / 2) + (boss ? 8 : 0)} y={layout.y(round) + layout.rowHeight * 0.38} textAnchor="middle" className="pixel-score" fontSize="8" fill={st.label} opacity="0.85">
                  R{round}
                </text>
              </g>
            )
          })}
          {shown.flatMap((round) =>
            map.layers[round - 1].map((node) => {
              const type = shopTypeById(node.type)
              const status = statusOf(node)
              const known = status !== 'unknown'
              const label = known ? `${shopNameIn(state, type, lang)}: ${type.blurb[lang]} (${STATE_WORD[status][lang]})` : `${STATE_WORD.unknown[lang]}`
              const isFocusable = status === 'choice' || status === 'picked' || status === 'here'
              return (
                <Stop
                  key={node.id}
                  node={node}
                  x={layout.x(node.col)}
                  y={layout.y(node.round)}
                  r={r}
                  hitR={hitR}
                  status={status}
                  label={label}
                  color={type.color}
                  legendary={Boolean(type.legendary)}
                  onPick={handlePick}
                  onHover={onHover}
                  onLeave={onLeave}
                  tabIndex={isFocusable ? 0 : -1}
                  quality={quality}
                />
              )
            }),
          )}
          {interactive && layout.rows.some((round) => round > sight) && quality !== 'low' && (
            <rect x="0" y="0" width={layout.width} height={Math.max(0, layout.y(sight) - layout.rowHeight / 2 + (layout.rows.includes(sight) ? 0 : 0))} fill="url(#map-fog)" pointerEvents="none" className="map-mist" />
          )}
          {personPos && (
            <g className="map-token" transform={`translate(${personPos[0]} ${personPos[1] - r - 6})`} pointerEvents="none">
              <g transform="translate(-14 -22)">
                <Traveler size={28} />
              </g>
              <text y="-26" textAnchor="middle" className="pixel-score" fontSize="7" fill="#120c1a" stroke="#ffe9a0" strokeWidth="3" paintOrder="stroke">
                {t('elementa.map.here')}
              </text>
            </g>
          )}
          {walkPos && (
            <g transform={`translate(${walkPos[0]} ${walkPos[1]})`} pointerEvents="none" opacity="0.85">
              <g transform="translate(-12 -22)">
                <Traveler size={24} lit />
              </g>
            </g>
          )}
          {map.pendingId &&
            (() => {
              const node = map.layers.flat().find((n) => n.id === map.pendingId)
              if (!node || !layout.rows.includes(node.round)) return null
              return (
                <g className="map-flag" transform={`translate(${layout.x(node.col) + r * 0.55} ${layout.y(node.round) - r - 12})`} pointerEvents="none">
                  <Flag size={20} />
                </g>
              )
            })()}
        </g>
      </svg>
      {interactive && (
        <div className="map-controls" role="toolbar" aria-label={t('elementa.map.controls')}>
          <button type="button" className="map-btn" onClick={() => (mapRef?.current ? mapRef.current.zoom(1.25) : zoomButton(1.25))} aria-label={t('elementa.map.zoomIn')} title={t('elementa.map.zoomIn')}>
            +
          </button>
          <button type="button" className="map-btn" onClick={() => (mapRef?.current ? mapRef.current.zoom(0.8) : zoomButton(0.8))} aria-label={t('elementa.map.zoomOut')} title={t('elementa.map.zoomOut')}>
            -
          </button>
          <button type="button" className="map-btn map-btn--wide" onClick={() => centerOn(here, true)} title={t('elementa.map.center')}>
            {t('elementa.map.center')}
          </button>
          <button type="button" className="map-btn map-btn--wide" onClick={() => fit(true)} title={t('elementa.map.fit')}>
            {t('elementa.map.fit')}
          </button>
          {onClose && (
            <button type="button" className="map-btn map-btn--wide map-btn--close" onClick={onClose}>
              {t('elementa.map.close')}
            </button>
          )}
        </div>
      )}
      {!interactive && onOpenFull && (
        <button type="button" className="map-open" onClick={onOpenFull} aria-label={t('elementa.map.open')} title={t('elementa.map.open')}>
          <span aria-hidden="true">+</span>
        </button>
      )}
      <Tooltip tip={tip} view={interactive ? view : { s: 1, tx: 0, ty: 0 }} box={{ w: svgW, h: svgH }} lang={lang} t={t} state={state} mapState={currentStatusOfTip ?? 'fog'} />
      <span className="sr-only" aria-live="polite">
        {map.pendingId && (() => {
          const node = map.layers.flat().find((n) => n.id === map.pendingId)
          return node ? `${shopNameIn(state, shopTypeById(node.type), lang)}: ${STATE_WORD.picked[lang]}` : ''
        })()}
      </span>
    </div>
  )
}
