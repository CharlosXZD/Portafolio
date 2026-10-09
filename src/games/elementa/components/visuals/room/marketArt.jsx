import { useMemo } from 'react'

// The painted layers of the Market room (art pixels: the stage is 320x180).
// Everything is plain <rect>s on whole numbers, so it stays crisp at any
// whole-number scale. Colors come from the tokens in elementa.css and the
// shop sky in components/PixelBackdrop.jsx.

export const ROOM_W = 320
export const ROOM_H = 180
const SKY = ['#120d24', '#1f1535', '#34203f', '#4f2944', '#733545', '#9c4a43', '#c46a45']
const INK = '#120c1a'

function seeded(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

// A silhouette ridge for the window: one rect per column.
function ridge(x0, x1, base, amp, seed, fill) {
  const rnd = seeded(seed)
  const phase = rnd() * 6
  const out = []
  for (let x = x0; x < x1; x++) {
    const h = Math.round(base + Math.sin((x + phase) / 5.5) * amp + Math.sin((x * 1.7 + phase) / 3) * (amp / 3))
    out.push(<rect key={x} x={x} y={h} width="1" height={90 - h} fill={fill} />)
  }
  return out
}

/** Wall, beam, window with a living dusk sky, the upper decor shelf and the floor. */
export function BackLayer() {
  const planks = useMemo(() => {
    const out = []
    for (let i = 0; i < 20; i++) {
      out.push(<rect key={`p${i}`} x={i * 16} y="10" width="16" height="118" fill={i % 2 ? '#2e1c26' : '#33202a'} />)
      out.push(<rect key={`g${i}`} x={i * 16 + 15} y="10" width="1" height="118" fill="#24151d" />)
      out.push(<rect key={`h${i}`} x={i * 16} y="10" width="1" height="118" fill="#3d2832" />)
      out.push(<rect key={`n${i}`} x={i * 16 + 7} y={20 + ((i * 37) % 90)} width="2" height="1" fill="#1a0f14" />)
    }
    return out
  }, [])
  const floor = useMemo(() => {
    const out = []
    for (let i = 0; i < 9; i++) {
      out.push(<rect key={`f${i}`} x="0" y={128 + i * 6} width="320" height="6" fill={i % 2 ? '#34200f' : '#3b2215'} />)
      out.push(<rect key={`fl${i}`} x="0" y={128 + i * 6} width="320" height="1" fill="#4a2c1a" />)
    }
    for (let i = 0; i < 14; i++) out.push(<rect key={`fj${i}`} x={(i * 53) % 320} y={128 + (i % 9) * 6} width="1" height="6" fill="#1f120c" />)
    return out
  }, [])
  const ridges = useMemo(() => [ridge(27, 85, 62, 4, 3, '#2a1730'), ridge(27, 85, 70, 3, 9, '#170d1c')], [])
  const stars = useMemo(() => {
    const rnd = seeded(7)
    return Array.from({ length: 11 }, (_, i) => ({ x: 29 + Math.floor(rnd() * 54), y: 26 + Math.floor(rnd() * 28), d: (i * 0.7).toFixed(1), big: i % 4 === 0 }))
  }, [])

  return (
    <svg className="v-layer" viewBox={`0 0 ${ROOM_W} ${ROOM_H}`} width={ROOM_W} height={ROOM_H} shapeRendering="crispEdges" aria-hidden="true">
      <defs>
        <pattern id="v-dither" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" fill="#000" opacity="0.28" />
          <rect x="1" y="1" width="1" height="1" fill="#000" opacity="0.28" />
        </pattern>
        <clipPath id="v-win">
          <rect x="27" y="25" width="58" height="54" />
        </clipPath>
      </defs>
      {/* Back wall and the beam across the top. */}
      <rect width="320" height="128" fill="#2e1c26" />
      {planks}
      <rect y="0" width="320" height="10" fill="#3b2215" />
      <rect y="8" width="320" height="2" fill={INK} opacity="0.55" />
      <rect y="0" width="320" height="2" fill="#5a3620" />
      {[28, 108, 196, 288].map((x) => (
        <rect key={x} x={x} y="2" width="6" height="8" fill="#2a170e" />
      ))}
      {/* Window: sky bands with dithered seams, stars, a moon and two ridges. */}
      <g clipPath="url(#v-win)">
        {SKY.map((c, i) => (
          <rect key={c} x="27" y={25 + i * 8} width="58" height={i === SKY.length - 1 ? 12 : 8} fill={c} />
        ))}
        {SKY.slice(1).map((c, i) => (
          <rect key={`d${c}`} x="27" y={25 + (i + 1) * 8 - 2} width="58" height="4" fill={c} opacity="0.55" />
        ))}
        {stars.map((s, i) => (
          <g key={i} className="v-twinkle" style={{ '--d': `${s.d}s` }}>
            <rect x={s.x} y={s.y} width="1" height="1" fill="#fff4d6" />
            {s.big && (
              <>
                <rect x={s.x - 1} y={s.y} width="3" height="1" fill="#fff4d6" opacity="0.5" />
                <rect x={s.x} y={s.y - 1} width="1" height="3" fill="#fff4d6" opacity="0.5" />
              </>
            )}
          </g>
        ))}
        <g>
          <rect x="70" y="31" width="5" height="5" fill="#fff0c4" />
          <rect x="69" y="32" width="1" height="3" fill="#fff0c4" />
          <rect x="75" y="32" width="1" height="3" fill="#fff0c4" />
          <rect x="72" y="31" width="4" height="4" fill="#4f2944" opacity="0.0" />
        </g>
        {ridges}
        <rect x="27" y="25" width="58" height="54" fill="url(#v-dither)" opacity="0.5" />
      </g>
      {/* Window frame, muntins and sill. */}
      <g fill="#5a3620">
        <rect x="24" y="22" width="64" height="3" />
        <rect x="24" y="79" width="64" height="3" />
        <rect x="24" y="22" width="3" height="60" />
        <rect x="85" y="22" width="3" height="60" />
        <rect x="55" y="25" width="2" height="54" />
        <rect x="27" y="51" width="58" height="2" />
      </g>
      <rect x="24" y="22" width="64" height="1" fill="#9a5f34" />
      <rect x="22" y="82" width="68" height="4" fill="#744528" />
      <rect x="22" y="82" width="68" height="1" fill="#c9874a" />
      <rect x="22" y="86" width="68" height="2" fill={INK} opacity="0.45" />
      {/* Sill: a little potted plant and a candle stub. */}
      <rect x="30" y="76" width="8" height="6" fill="#a8523a" />
      <rect x="30" y="76" width="8" height="1" fill="#d27a52" />
      <rect x="33" y="69" width="2" height="7" fill="#4a8a45" />
      <rect x="30" y="68" width="4" height="3" fill="#5fb057" />
      <rect x="35" y="66" width="4" height="3" fill="#5fb057" />
      <rect x="31" y="72" width="3" height="2" fill="#5fb057" />
      {/* Upper decor shelf. */}
      <rect x="104" y="64" width="122" height="3" fill="#744528" />
      <rect x="104" y="64" width="122" height="1" fill="#c9874a" />
      <rect x="104" y="67" width="122" height="2" fill={INK} opacity="0.4" />
      <rect x="110" y="67" width="2" height="6" fill="#5a3620" />
      <rect x="218" y="67" width="2" height="6" fill="#5a3620" />
      {/* Books. */}
      <rect x="108" y="54" width="14" height="4" fill="#8f6bff" />
      <rect x="108" y="54" width="14" height="1" fill="#c8b6ff" />
      <rect x="110" y="58" width="13" height="3" fill="#3f9f5f" />
      <rect x="108" y="61" width="15" height="3" fill="#a8323a" />
      {/* A jar with a glowing green potion and a rising bubble. */}
      <rect x="128" y="52" width="12" height="12" fill="#7ad1ff" opacity="0.35" />
      <rect x="129" y="56" width="10" height="8" fill="#6fd38a" />
      <rect x="129" y="56" width="10" height="1" fill="#c6ffd4" />
      <rect x="130" y="49" width="8" height="3" fill="#a8744a" />
      <rect x="128" y="52" width="1" height="12" fill="#dff3ff" opacity="0.6" />
      <rect className="v-bubble" x="133" y="61" width="2" height="2" fill="#c6ffd4" />
      <rect className="v-bubble v-bubble--b" x="135" y="62" width="1" height="1" fill="#c6ffd4" />
      {/* A jar of fireflies. */}
      <rect x="146" y="52" width="12" height="12" fill="#dff3ff" opacity="0.22" />
      <rect x="147" y="49" width="10" height="3" fill="#a8744a" />
      <rect className="v-twinkle" style={{ '--d': '0.2s' }} x="149" y="55" width="1" height="1" fill="#ffe27a" />
      <rect className="v-twinkle" style={{ '--d': '1.1s' }} x="154" y="58" width="1" height="1" fill="#c6ff7a" />
      <rect className="v-twinkle" style={{ '--d': '2s' }} x="151" y="61" width="1" height="1" fill="#ffe27a" />
      {/* An hourglass. */}
      <rect x="170" y="50" width="12" height="2" fill="#744528" />
      <rect x="170" y="62" width="12" height="2" fill="#744528" />
      <rect x="172" y="52" width="8" height="2" fill="#dff3ff" opacity="0.3" />
      <rect x="174" y="54" width="4" height="2" fill="#dff3ff" opacity="0.3" />
      <rect x="175" y="56" width="2" height="2" fill="#dff3ff" opacity="0.3" />
      <rect x="174" y="58" width="4" height="2" fill="#dff3ff" opacity="0.3" />
      <rect x="172" y="60" width="8" height="2" fill="#dff3ff" opacity="0.3" />
      <rect x="173" y="60" width="6" height="2" fill="#ffd166" />
      <rect x="175" y="53" width="2" height="2" fill="#ffd166" />
      <rect className="v-sand" x="175" y="56" width="1" height="4" fill="#ffd166" />
      {/* A candle. */}
      <rect x="198" y="56" width="6" height="8" fill="#f2e6c8" />
      <rect x="198" y="56" width="1" height="8" fill="#fff8e6" />
      <rect x="198" y="63" width="6" height="1" fill="#c9b898" />
      <rect x="200" y="54" width="2" height="2" fill={INK} />
      {/* A potted mushroom. */}
      <rect x="210" y="58" width="9" height="6" fill="#a8523a" />
      <rect x="212" y="52" width="2" height="6" fill="#efe6d8" />
      <rect x="209" y="48" width="9" height="5" fill="#e5533d" />
      <rect x="211" y="49" width="2" height="2" fill="#fff4d6" />
      <rect x="215" y="50" width="2" height="1" fill="#fff4d6" />
      {/* Right wall: price list, map, and Tobb's backpack on a hook. */}
      <rect x="236" y="24" width="30" height="40" fill="#e8dcc0" />
      <rect x="236" y="24" width="30" height="2" fill="#fff4d6" />
      <rect x="236" y="62" width="30" height="2" fill="#b8a888" />
      {[32, 37, 42, 47, 52, 57].map((y, i) => (
        <g key={y}>
          <rect x="239" y={y} width={14 + ((i * 5) % 8)} height="2" fill="#8a7050" />
          <rect x="258" y={y} width="5" height="2" fill="#c46a24" />
        </g>
      ))}
      <rect x="250" y="20" width="2" height="4" fill="#9a5f34" />
      <rect x="276" y="26" width="28" height="22" fill="#d8c8a0" />
      <rect x="276" y="26" width="28" height="1" fill="#f2e6c8" />
      <rect x="276" y="47" width="28" height="1" fill="#a8946c" />
      {[[280, 40], [284, 36], [289, 38], [293, 33], [298, 31]].map(([x, y]) => (
        <rect key={`${x}`} x={x} y={y} width="2" height="2" fill="#c8321f" />
      ))}
      <rect x="283" y="31" width="6" height="4" fill="#5fb057" opacity="0.8" />
      <rect x="293" y="40" width="7" height="5" fill="#3d8fe5" opacity="0.7" />
      <rect x="309" y="26" width="3" height="3" fill="#c9874a" />
      <rect x="302" y="29" width="16" height="22" fill="#744528" />
      <rect x="302" y="29" width="16" height="2" fill="#9a5f34" />
      <rect x="304" y="34" width="12" height="7" fill="#5a3620" />
      <rect x="308" y="37" width="4" height="3" fill="#ffd166" />
      <rect x="300" y="38" width="2" height="12" fill="#3b2215" />
      <rect x="318" y="38" width="2" height="12" fill="#3b2215" />
      {/* Baseboard and floor. */}
      <rect y="122" width="320" height="6" fill="#1f120c" />
      <rect y="122" width="320" height="1" fill="#3b2215" />
      {floor}
      {/* Crate and barrel in the left corner. */}
      <rect x="4" y="132" width="26" height="22" fill="#744528" />
      <rect x="4" y="132" width="26" height="2" fill="#c9874a" />
      <rect x="4" y="152" width="26" height="2" fill={INK} opacity="0.5" />
      <rect x="8" y="132" width="2" height="22" fill="#5a3620" />
      <rect x="24" y="132" width="2" height="22" fill="#5a3620" />
      <rect x="4" y="141" width="26" height="2" fill="#5a3620" />
      <rect x="34" y="118" width="22" height="34" fill="#5a3620" />
      <rect x="34" y="118" width="22" height="2" fill="#9a5f34" />
      <rect x="34" y="126" width="22" height="2" fill="#2a170e" />
      <rect x="34" y="140" width="22" height="2" fill="#2a170e" />
      <rect x="38" y="118" width="2" height="34" fill="#744528" />
      <rect x="34" y="150" width="22" height="2" fill={INK} opacity="0.5" />
    </svg>
  )
}

/** Warm light shafts from the window, and the bright patch on the floor. */
export function LightLayer() {
  return (
    <svg className="v-layer v-shafts" viewBox={`0 0 ${ROOM_W} ${ROOM_H}`} width={ROOM_W} height={ROOM_H} shapeRendering="crispEdges" aria-hidden="true">
      <g className="v-shaft">
        <polygon points="27,82 55,82 120,150 92,150" fill="#ffe9a0" opacity="0.1" />
        <polygon points="58,82 85,82 149,150 121,150" fill="#ffe9a0" opacity="0.1" />
        <polygon points="40,82 55,82 106,138 91,138" fill="#fff4d6" opacity="0.05" />
      </g>
      <g className="v-patch">
        <rect x="96" y="148" width="54" height="2" fill="#ffe9a0" opacity="0.12" />
        <rect x="92" y="150" width="62" height="4" fill="#ffe9a0" opacity="0.13" />
        <rect x="96" y="154" width="54" height="2" fill="#ffe9a0" opacity="0.1" />
      </g>
    </svg>
  )
}

/** Two hanging lanterns: they sway a pixel and their glow flickers. */
export function Lanterns() {
  return (
    <svg className="v-layer" viewBox={`0 0 ${ROOM_W} ${ROOM_H}`} width={ROOM_W} height={ROOM_H} shapeRendering="crispEdges" aria-hidden="true">
      <defs>
        <radialGradient id="v-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#ff9a4a" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ff9a4a" stopOpacity="0" />
        </radialGradient>
      </defs>
      {[128, 232].map((x, i) => (
        <g key={x}>
          <circle className="v-flicker" style={{ '--d': `${i * 0.9}s` }} cx={x + 4} cy="40" r="46" fill="url(#v-glow)" />
          <g className="v-sway" style={{ '--d': `${i * 1.6}s` }}>
            <rect x={x + 3} y="10" width="2" height="18" fill="#5a3620" />
            <rect x={x} y="28" width="8" height="2" fill="#2a170e" />
            <rect x={x - 1} y="30" width="10" height="11" fill="#2a170e" />
            <rect x={x + 1} y="31" width="6" height="9" fill="#ffd98a" />
            <rect x={x + 2} y="32" width="2" height="6" fill="#fff4d6" />
            <rect x={x} y="41" width="8" height="2" fill="#2a170e" />
            <rect x={x + 3} y="26" width="2" height="2" fill="#2a170e" />
          </g>
        </g>
      ))}
    </svg>
  )
}

/** The display shelf: board, brackets, a recessed back and contact shadows. */
export function ShelfLayer({ slotLefts }) {
  return (
    <svg className="v-layer" viewBox={`0 0 ${ROOM_W} ${ROOM_H}`} width={ROOM_W} height={ROOM_H} shapeRendering="crispEdges" aria-hidden="true">
      <rect x="92" y="74" width="148" height="30" fill={INK} opacity="0.3" />
      <rect x="92" y="74" width="148" height="2" fill={INK} opacity="0.35" />
      <rect x="90" y="104" width="152" height="5" fill="#744528" />
      <rect x="90" y="104" width="152" height="1" fill="#c9874a" />
      <rect x="90" y="108" width="152" height="1" fill="#5a3620" />
      <rect x="90" y="109" width="152" height="2" fill={INK} opacity="0.5" />
      <rect x="96" y="109" width="3" height="9" fill="#5a3620" />
      <rect x="232" y="109" width="3" height="9" fill="#5a3620" />
      {slotLefts.map((x) => (
        <g key={x}>
          <rect x={x + 3} y="103" width="18" height="1" fill={INK} opacity="0.55" />
          <rect x={x + 6} y="102" width="12" height="1" fill={INK} opacity="0.35" />
        </g>
      ))}
    </svg>
  )
}

/** The counter in front of the keeper, with a brass bell and a bowl of coins. */
export function CounterLayer() {
  return (
    <svg className="v-layer" viewBox={`0 0 ${ROOM_W} ${ROOM_H}`} width={ROOM_W} height={ROOM_H} shapeRendering="crispEdges" aria-hidden="true">
      <rect x="236" y="112" width="84" height="6" fill="#9a5f34" />
      <rect x="236" y="112" width="84" height="1" fill="#e0a468" />
      <rect x="236" y="117" width="84" height="1" fill="#744528" />
      <rect x="238" y="118" width="82" height="42" fill="#5a3620" />
      <rect x="238" y="118" width="82" height="2" fill={INK} opacity="0.35" />
      {[246, 268, 290, 312].map((x) => (
        <rect key={x} x={x} y="120" width="2" height="40" fill="#3b2215" />
      ))}
      <rect x="246" y="126" width="64" height="26" fill="#744528" />
      <rect x="246" y="126" width="64" height="1" fill="#9a5f34" />
      <rect x="250" y="134" width="56" height="2" fill="#5a3620" opacity="0.7" />
      <rect x="246" y="152" width="64" height="2" fill={INK} opacity="0.4" />
      {/* Bowl of coins. */}
      <rect x="304" y="106" width="10" height="6" fill="#744528" />
      <rect x="305" y="104" width="8" height="2" fill="#ffd166" />
      <rect x="307" y="103" width="3" height="1" fill="#fff3c4" />
    </svg>
  )
}

/** Sparse dust that drifts through the room and glows in the light. */
export function Motes() {
  const motes = useMemo(() => {
    const rnd = seeded(21)
    return Array.from({ length: 16 }, (_, i) => {
      const inBeam = i < 9
      const x = inBeam ? 40 + Math.floor(rnd() * 100) : Math.floor(rnd() * 300)
      const y = inBeam ? 84 + Math.floor(rnd() * 60) : 20 + Math.floor(rnd() * 100)
      return {
        x,
        y,
        dx: Math.floor(rnd() * 14) - 4,
        dy: -(6 + Math.floor(rnd() * 12)),
        dur: (9 + rnd() * 9).toFixed(1),
        delay: (-rnd() * 14).toFixed(1),
        bright: inBeam,
      }
    })
  }, [])
  return (
    <svg className="v-layer v-motes" viewBox={`0 0 ${ROOM_W} ${ROOM_H}`} width={ROOM_W} height={ROOM_H} shapeRendering="crispEdges" aria-hidden="true">
      {motes.map((m, i) => (
        <rect
          key={i}
          className="v-mote"
          x={m.x}
          y={m.y}
          width="1"
          height="1"
          fill={m.bright ? '#fff4d6' : '#e8dcc0'}
          style={{ '--dx': `${m.dx}px`, '--dy': `${m.dy}px`, '--n': Math.abs(m.dy), '--dur': `${m.dur}s`, '--delay': `${m.delay}s`, '--peak': m.bright ? 0.85 : 0.4 }}
        />
      ))}
    </svg>
  )
}

/** The sleeping fox in the patch of sun: breathes, flicks an ear, curls its tail. */
export function SleepingFox() {
  return (
    <svg className="v-layer v-fox" viewBox={`0 0 ${ROOM_W} ${ROOM_H}`} width={ROOM_W} height={ROOM_H} shapeRendering="crispEdges" aria-hidden="true">
      <g transform="translate(104 140)">
        <rect x="2" y="12" width="26" height="2" fill={INK} opacity="0.4" />
        {/* tail curled round the front */}
        <g className="v-fox__tail">
          <rect x="26" y="5" width="4" height="7" fill={INK} />
          <rect x="27" y="6" width="2" height="5" fill="#f6e0b8" />
          <rect x="22" y="9" width="6" height="3" fill={INK} />
          <rect x="23" y="10" width="4" height="1" fill="#e8944a" />
        </g>
        {/* the body, breathing */}
        <g className="v-fox__body">
          <rect x="5" y="3" width="20" height="9" fill={INK} />
          <rect x="3" y="5" width="24" height="7" fill={INK} />
          <rect x="6" y="4" width="18" height="7" fill="#e8944a" />
          <rect x="4" y="6" width="22" height="5" fill="#e8944a" />
          <rect x="6" y="4" width="18" height="1" fill="#f2a863" />
          <rect x="4" y="10" width="22" height="1" fill="#b8683a" />
          {/* head tucked on the paws */}
          <rect x="1" y="6" width="11" height="7" fill={INK} />
          <rect x="2" y="7" width="9" height="5" fill="#e8944a" />
          <rect x="2" y="10" width="9" height="2" fill="#f6e0b8" />
          <rect x="4" y="8" width="2" height="1" fill={INK} />
          <rect x="8" y="8" width="2" height="1" fill={INK} />
          <rect x="1" y="11" width="2" height="2" fill="#120c1a" />
        </g>
        <g className="v-fox__ear">
          <rect x="2" y="3" width="3" height="4" fill={INK} />
          <rect x="3" y="4" width="1" height="2" fill="#e58a9a" />
          <rect x="9" y="3" width="3" height="4" fill={INK} />
          <rect x="10" y="4" width="1" height="2" fill="#e58a9a" />
        </g>
        <g className="v-fox__z">
          <rect x="-2" y="-2" width="3" height="1" fill="#dff3ff" />
          <rect x="0" y="-1" width="1" height="1" fill="#dff3ff" />
          <rect x="-2" y="0" width="3" height="1" fill="#dff3ff" />
        </g>
      </g>
    </svg>
  )
}
