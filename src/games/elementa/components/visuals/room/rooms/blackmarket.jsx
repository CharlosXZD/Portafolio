import { Barrel, Crate, Floor, Hooded, Notice, Pulse, ScrollRack, Sign, Stones, WatchingEyes } from '../props.jsx'
import { Sway } from '../props.jsx'

// The Black Market (Nix): a back alley under eclipse light. Hooded crates,
// a flickering sign, shadows that move and pact scrolls pinned to the wall.
function Back() {
  return (
    <>
      <Stones a="#17142a" b="#1d1a34" mortar="#0b0916" />
      <circle cx="238" cy="38" r="22" fill="#2a1c4a" />
      <circle cx="238" cy="38" r="17" fill="#07060e" />
      <circle cx="238" cy="38" r="22" fill="none" stroke="#8a5cff" strokeWidth="1" opacity="0.7" />
      <Floor a="#110f20" b="#0e0c1a" line="#1d1a34" joint="#06050c" />
      <Notice x={24} y={34} w={24} h={30} c="#7a6a8c" ink="#2a1c3a" />
      <Notice x={54} y={40} w={20} h={26} c="#6a5a7c" ink="#2a1c3a" lines={4} />
      <ScrollRack x={92} y={60} n={4} />
      <Crate x={30} y={104} w={30} h={24} a="#2a2038" hi="#3a2e4c" band="#150f20" />
      <Crate x={64} y={112} w={24} h={20} a="#2a2038" hi="#3a2e4c" band="#150f20" />
      <Barrel x={262} y={100} w={24} h={30} a="#2a2038" hi="#4a3a5c" hoop="#150f20" />
      <Hooded x={120} y={100} c="#0c0a16" eye="#ff5a8a" />
      <Hooded x={286} y={88} c="#0c0a16" eye="#8a5cff" />
      <Sign x={172} y={22} w={46} c="#150f20" letters="#8a5cff" />
    </>
  )
}
function Ambient() {
  return (
    <>
      <Pulse dur={2.6} lo={0.15}>
        <rect x="174" y="24" width="42" height="2" fill="#8a5cff" opacity="0.8" />
      </Pulse>
      <WatchingEyes x={104} y={118} dur={9} />
      <WatchingEyes x={216} y={126} dur={13} delay={-4} c="#8a5cff" />
      <Sway dur={7}>
        <rect x="168" y="18" width="1" height="6" fill="#3a2e4c" />
        <rect x="218" y="18" width="1" height="6" fill="#3a2e4c" />
      </Sway>
    </>
  )
}
const room = {
  id: 'blackmarket',
  Back,
  Ambient,
  lights: [
    { x: 238, y: 40, r: 70, c: '#8a5cff', o: 0.3 },
    { x: 190, y: 28, r: 40, c: '#8a5cff', flicker: true, o: 0.3 },
  ],
  motes: { kind: 'shadow', count: 8, area: [20, 70, 300, 140] },
  keeper: { x: 214, y: 92, size: 28 },
}
export default function BlackMarketRoom({ children }) {
  return children(room)
}
