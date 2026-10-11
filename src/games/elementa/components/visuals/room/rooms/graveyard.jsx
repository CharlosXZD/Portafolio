import { Floor, Pulse, Twinkles } from '../props.jsx'

// The Graveyard at dusk: the room behind the game over gravestone (VISUALS.md V4.7). A violet
// sky with a low moon, an iron fence, a bare tree, stones in the grass and ground mist.
const STARS = [[30, 14, 0.4], [70, 24, 1.8, true], [120, 10, 2.5], [210, 18, 1.1], [270, 12, 2.2, true], [296, 30, 0.9]]

function Stone({ x, y, w = 14, h = 20, c = '#4a4466' }) {
  return (
    <>
      <rect x={x} y={y} width={w} height={h} fill={c} />
      <rect x={x + 2} y={y - 3} width={w - 4} height="3" fill={c} />
      <rect x={x} y={y} width="2" height={h} fill="#6a6488" />
      <rect x={x + 3} y={y + 5} width={w - 6} height="2" fill="#2c2840" />
    </>
  )
}

function Back() {
  return (
    <>
      <rect width="320" height="124" fill="#1b1636" />
      <rect y="56" width="320" height="30" fill="#352358" />
      <rect y="86" width="320" height="38" fill="#733545" opacity="0.55" />
      <circle cx="240" cy="92" r="20" fill="#c46a45" opacity="0.8" />
      <path d="M0,112 L60,100 L120,108 L190,98 L260,106 L320,100 L320,124 L0,124 Z" fill="#120c20" />
      {[8, 28, 48, 68].map((x) => (
        <g key={x}>
          <rect x={x} y="92" width="3" height="26" fill="#0c0814" />
          <rect x={x - 1} y="90" width="5" height="3" fill="#0c0814" />
        </g>
      ))}
      <rect x="6" y="100" width="66" height="2" fill="#0c0814" />
      <rect x="6" y="110" width="66" height="2" fill="#0c0814" />
      <path d="M262,124 L264,70 L268,40 L272,70 L274,124 Z" fill="#0c0814" />
      <path d="M268,60 L240,38 L244,36 L270,52 Z M268,56 L296,34 L300,36 L270,52 Z M268,76 L292,64 L294,68 L270,82 Z" fill="#0c0814" />
      <Floor y={124} h={56} a="#1a2a22" b="#142018" line="#223a2e" joint="#0a120e" rows={8} />
      <Stone x={24} y={118} />
      <Stone x={96} y={126} w={12} h={16} c="#5a5478" />
      <Stone x={190} y={122} w={16} h={22} />
      <Stone x={226} y={132} w={12} h={14} c="#5a5478" />
      <Stone x={50} y={138} w={12} h={14} />
    </>
  )
}

function Ambient() {
  return (
    <>
      <Twinkles stars={STARS} />
      <Pulse dur={9} lo={0.3}>
        <rect x="0" y="118" width="320" height="10" fill="#cfe8f2" opacity="0.14" />
      </Pulse>
    </>
  )
}

const room = {
  id: 'graveyard',
  Back,
  Ambient,
  lights: [{ x: 240, y: 92, r: 90, c: '#ff9a6a', o: 0.3 }],
  motes: { kind: 'vapor', count: 12, area: [0, 110, 320, 150], color: '#cfe8f2' },
}

export default function GraveyardRoom({ children }) {
  return children(room)
}
