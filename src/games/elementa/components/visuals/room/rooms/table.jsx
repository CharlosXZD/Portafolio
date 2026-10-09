import { Floor, Pulse, Twinkles } from '../props.jsx'

// The table's backdrop: a felt-green hall, quiet so the dice read first. Realm
// tints do the rest (Elementa warm, Firmament cold violet, and so on).
const STARS = [[30, 14, 6], [90, 22, 5, 1], [160, 10, 7], [230, 18, 5], [290, 12, 6, 1]]
function Back() {
  return (
    <>
      <rect width="320" height="180" fill="#10160f" />
      <rect y="40" width="320" height="50" fill="#16200f" />
      <rect y="90" width="320" height="90" fill="#1a2a16" />
      <Floor y={100} h={80} a="#1a2a16" b="#152212" line="#24381e" joint="#0a120a" rows={8} />
      <ellipse cx="160" cy="110" rx="150" ry="40" fill="#1f3a1a" />
      <ellipse cx="160" cy="108" rx="130" ry="32" fill="#244a1e" />
      <ellipse cx="160" cy="108" rx="130" ry="32" fill="none" stroke="#3a6a2a" strokeWidth="1" />
    </>
  )
}
function Ambient() {
  return (
    <>
      <Twinkles stars={STARS} />
      <Pulse dur={7} lo={0.5}>
        <ellipse cx="160" cy="108" rx="60" ry="14" fill="#6fd38a" opacity="0.12" />
      </Pulse>
    </>
  )
}
const room = {
  id: 'table',
  Back,
  Ambient,
  lights: [{ x: 160, y: 100, r: 110, c: '#ffd166', o: 0.15 }],
  motes: { kind: 'dust', count: 8, area: [20, 20, 300, 140] },
}
export default function TableRoom({ children }) {
  return children(room)
}
