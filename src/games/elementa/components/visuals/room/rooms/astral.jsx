import { Bob, Floor, Pulse, Twinkles } from '../props.jsx'

// The Astral Exchange (the Conclave): a starfield seen through a glass dome.
// Wares orbit above the trading floor and ticker lights run along the rim.
const STARS = [
  [20, 14, 3], [44, 30, 5, 1], [70, 10, 4], [96, 40, 6], [122, 18, 3.5, 1], [150, 8, 5], [176, 34, 4],
  [200, 14, 6, 1], [230, 38, 3], [256, 16, 5], [282, 30, 4, 1], [300, 10, 6], [36, 60, 5], [84, 72, 4],
  [250, 62, 6], [292, 74, 3.5, 1], [130, 66, 5],
]
function Back() {
  return (
    <>
      <rect width="320" height="124" fill="#0a0820" />
      <rect y="40" width="320" height="50" fill="#140e32" />
      <rect y="70" width="320" height="30" fill="#221650" />
      <ellipse cx="260" cy="70" rx="26" ry="26" fill="#5a3a9a" />
      <ellipse cx="260" cy="70" rx="26" ry="5" fill="#1a1040" opacity="0.5" />
      {[40, 100, 160, 220, 280].map((x) => (
        <rect key={x} x={x} y="0" width="2" height="124" fill="#3a2a6a" opacity="0.6" />
      ))}
      <rect y="0" width="320" height="3" fill="#6a4ab0" />
      <rect y="121" width="320" height="3" fill="#6a4ab0" />
      <Floor a="#1a1236" b="#150e2c" line="#3a2a6a" joint="#0a0618" />
      <ellipse cx="160" cy="140" rx="70" ry="10" fill="#2a1a5a" />
      <ellipse cx="160" cy="138" rx="50" ry="6" fill="#4a2a8a" />
    </>
  )
}
function Ware({ x, y, c }) {
  return (
    <>
      <rect x={x} y={y} width="6" height="6" fill={c} />
      <rect x={x} y={y} width="6" height="1" fill="#ffffff" opacity="0.5" />
    </>
  )
}
function Ambient() {
  return (
    <>
      <Twinkles stars={STARS} />
      <Bob dur={7} amp={3}><Ware x={110} y={86} c="#d9b8ff" /></Bob>
      <Bob dur={9} amp={3} delay={-2}><Ware x={190} y={78} c="#ffd166" /></Bob>
      <Bob dur={6} amp={3} delay={-4}><Ware x={150} y={96} c="#9fd8ff" /></Bob>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <Pulse key={i} dur={2.4} delay={i * 0.3} lo={0.15}>
          <rect x={30 + i * 36} y="115" width="4" height="2" fill={i % 2 ? '#ffd166' : '#d9b8ff'} />
        </Pulse>
      ))}
    </>
  )
}
const room = {
  id: 'astral',
  Back,
  Ambient,
  lights: [
    { x: 260, y: 70, r: 80, c: '#8a5cff', o: 0.25 },
    { x: 160, y: 120, r: 70, c: '#d9b8ff', o: 0.2 },
  ],
  motes: { kind: 'star', count: 10, area: [20, 20, 300, 110] },
  keeper: { x: 146, y: 108, size: 28 },
}
export default function AstralRoom({ children }) {
  return children(room)
}
