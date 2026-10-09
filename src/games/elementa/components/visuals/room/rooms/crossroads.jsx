import { Bob, Pulse, Twinkles } from '../props.jsx'

// The Crossroads: a door standing in the sky. Stars, a path of stones and
// a gate whose light breathes.
const STARS = [[24, 12, 4], [60, 36, 6, 1], [108, 10, 5], [200, 18, 3.5], [250, 8, 5, 1], [290, 30, 4], [40, 70, 6], [270, 64, 5, 1]]
function Back() {
  return (
    <>
      <rect width="320" height="180" fill="#0c0a22" />
      <rect y="50" width="320" height="50" fill="#161236" />
      <rect y="100" width="320" height="40" fill="#221a4a" />
      <ellipse cx="160" cy="150" rx="150" ry="16" fill="#2c2358" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={146 - i * 6 + (i % 2) * 8} y={170 - i * 8} width={28 + i * 12} height="4" fill="#4a3f7a" />
      ))}
      <rect x="122" y="40" width="76" height="90" fill="#2a2150" />
      <rect x="128" y="46" width="64" height="84" fill="#120c28" />
      <rect x="134" y="52" width="52" height="78" fill="#d9b8ff" opacity="0.5" />
      <rect x="122" y="36" width="76" height="6" fill="#4a3f7a" />
      <rect x="116" y="130" width="88" height="6" fill="#4a3f7a" />
    </>
  )
}
function Ambient() {
  return (
    <>
      <Twinkles stars={STARS} />
      <Pulse dur={4} lo={0.35}>
        <rect x="142" y="60" width="36" height="62" fill="#ffffff" opacity="0.3" />
      </Pulse>
      <Bob dur={6} amp={2}><rect x="60" y="100" width="6" height="6" fill="#9fd8ff" /></Bob>
      <Bob dur={8} amp={2} delay={-3}><rect x="256" y="96" width="6" height="6" fill="#ffd166" /></Bob>
    </>
  )
}
const room = {
  id: 'crossroads',
  Back,
  Ambient,
  lights: [{ x: 160, y: 90, r: 100, c: '#d9b8ff', o: 0.4 }],
  motes: { kind: 'star', count: 12, area: [10, 10, 310, 120] },
}
export default function CrossroadsRoom({ children }) {
  return children(room)
}
