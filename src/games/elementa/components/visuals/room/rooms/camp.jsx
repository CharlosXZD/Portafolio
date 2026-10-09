import { Flame, Floor, Kettle, Logs, Pulse, Sparks, Steam, Tent, Twinkles } from '../props.jsx'
import { Sway } from '../props.jsx'

// The Camp (Tobb): a campfire in the dark, tea on a stone, a tent, and the
// Road far off under the stars.
const STARS = [[24, 10, 4], [70, 24, 6, 1], [120, 8, 5], [180, 20, 3.5], [230, 12, 5, 1], [288, 26, 4], [150, 40, 6]]
function Back() {
  return (
    <>
      <rect width="320" height="124" fill="#0c0a1c" />
      <rect y="40" width="320" height="40" fill="#161230" />
      <rect y="70" width="320" height="30" fill="#241a3a" />
      <path d="M0,96 L50,78 L100,92 L160,72 L230,90 L290,76 L320,88 L320,124 L0,124 Z" fill="#120e22" />
      <path d="M200,124 L226,96 L232,96 L260,124 Z" fill="#3a2a2a" opacity="0.7" />
      <Floor a="#1c1626" b="#18121f" line="#2a2236" joint="#0a0810" />
      <Tent x={20} y={86} w={70} h={44} />
      <Logs x={150} y={118} />
      <rect x="196" y="118" width="14" height="8" fill="#4a4456" />
      <Kettle x={198} y={108} />
      <rect x="240" y="116" width="10" height="10" fill="#4a4456" />
    </>
  )
}
function Ambient() {
  return (
    <>
      <Twinkles stars={STARS} />
      <Flame x={150} y={104} w={10} h={14} />
      <Flame x={160} y={100} w={12} h={18} delay={0.3} />
      <Flame x={172} y={104} w={10} h={14} delay={0.6} />
      <Sparks x={162} y={96} n={8} />
      <Steam x={204} y={104} n={2} c="#e8f0f2" />
      <Sway dur={7}><rect x="64" y="86" width="3" height="3" fill="#ffd166" /></Sway>
      <Pulse dur={6} lo={0.4}><rect x="226" y="98" width="2" height="2" fill="#ffd166" /></Pulse>
    </>
  )
}
const room = {
  id: 'camp',
  Back,
  Ambient,
  lights: [
    { x: 164, y: 110, r: 90, c: '#ff9a3a', flicker: true, o: 0.5 },
    { x: 164, y: 112, r: 40, c: '#ffd166', flicker: true, o: 0.3 },
  ],
  motes: { kind: 'ember', count: 10, area: [140, 80, 190, 112] },
  keeper: { x: 110, y: 96, size: 28 },
}
export default function CampRoom({ children }) {
  return children(room)
}
