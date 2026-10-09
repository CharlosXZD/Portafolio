import { Bob, Desk, Floor, Notice, Pulse, Stones, Telescope, Twinkles } from '../props.jsx'

// The Observatory (Seren): a telescope under an open dome, star charts on the
// wall and a constellation that draws itself.
const STARS = [[40, 16, 4], [90, 28, 6, 1], [140, 12, 5], [200, 24, 3.5], [250, 10, 5, 1], [290, 30, 4], [60, 52, 6], [230, 56, 5, 1], [120, 48, 4]]
function Constellation() {
  const pts = [[180, 30], [196, 42], [214, 36], [226, 52], [244, 46]]
  return (
    <g className="r-draw">
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#9fb8ff" strokeWidth="1" opacity="0.8" />
      {pts.map(([x, y]) => (
        <rect key={`${x}${y}`} x={x - 1} y={y - 1} width="3" height="3" fill="#ffffff" />
      ))}
    </g>
  )
}
function Back() {
  return (
    <>
      <rect width="320" height="124" fill="#0b1230" />
      <rect y="30" width="320" height="50" fill="#121c44" />
      <path d="M0,0 L320,0 L320,18 Q160,70 0,18 Z" fill="#1c2658" />
      <rect y="0" width="320" height="4" fill="#3a4a8a" />
      <Stones y={92} h={32} a="#232c58" b="#2a3466" mortar="#10163a" />
      <Floor a="#1a2248" b="#161c3a" line="#2a3466" joint="#0a0e22" />
      <Notice x={22} y={64} w={32} h={38} c="#c8d0f0" ink="#3a4a8a" lines={7} />
      <Notice x={60} y={70} w={24} h={30} c="#b8c4e8" ink="#3a4a8a" lines={4} />
      <Telescope x={196} y={82} />
      <Desk x={110} y={108} w={60} />
      <rect x="120" y="104" width="22" height="3" fill="#e8dcc0" />
    </>
  )
}
function Ambient() {
  return (
    <>
      <Twinkles stars={STARS} />
      <Constellation />
      <Pulse dur={4} lo={0.4}>
        <rect x="150" y="102" width="4" height="2" fill="#ffd166" />
      </Pulse>
      <Bob dur={8} amp={1}>
        <rect x="100" y="72" width="3" height="3" fill="#9fb8ff" />
      </Bob>
    </>
  )
}
const room = {
  id: 'observatory',
  Back,
  Ambient,
  lights: [
    { x: 210, y: 40, r: 90, c: '#9fb8ff', o: 0.25 },
    { x: 150, y: 100, r: 30, c: '#ffd166', flicker: true, o: 0.18 },
  ],
  motes: { kind: 'star', count: 12, area: [10, 10, 300, 90] },
  keeper: { x: 120, y: 80, size: 28 },
}
export default function ObservatoryRoom({ children }) {
  return children(room)
}
