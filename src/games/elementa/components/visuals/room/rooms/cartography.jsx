import { Beam, Candle, Desk, Floor, Notice, Planks, Pulse, ScrollRack, Window } from '../props.jsx'
import { Sway } from '../props.jsx'

// Cartography (Atlas): a map table with a window onto the Road. Rolled charts,
// a compass, ink that dries and a lantern that sways.
function Back() {
  return (
    <>
      <Planks a="#2a2a30" b="#2e2e36" line="#1c1c22" hi="#3c3c46" />
      <Beam a="#1c2a36" hi="#3a5a74" />
      <Window x={22} y={20} w={70} h={56} sky={['#7ad1ff', '#a8e0ff', '#d8f0ff', '#f2f8ff']} frame="#3a5a74" sill="#4a6a84" id="cart" />
      <path d="M22,70 L40,52 L56,64 L72,44 L92,70 Z" fill="#4a6a84" />
      <rect x="22" y="70" width="70" height="2" fill="#5fb057" />
      <rect x="40" y="62" width="2" height="8" fill="#e8dcc0" />
      <ScrollRack x={112} y={30} n={6} />
      <Notice x={150} y={24} w={40} h={44} c="#e8dcc0" ink="#7a5a30" lines={8} />
      <Notice x={198} y={30} w={28} h={34} c="#d8c8a0" ink="#7a5a30" lines={5} />
      <Floor a="#26262e" b="#202026" line="#34343e" joint="#101016" />
      <Desk x={120} y={104} w={100} />
      <rect x="128" y="100" width="84" height="4" fill="#e8dcc0" />
      <rect x="132" y="101" width="22" height="1" fill="#3a8fe0" />
      <rect x="160" y="101" width="14" height="1" fill="#a8323a" />
      <rect x="232" y="112" width="10" height="10" fill="#2a2a40" />
      <rect x="234" y="110" width="2" height="4" fill="#8fd0ff" />
      <Candle x={200} y={94} />
      <circle cx="250" cy="92" r="8" fill="#c9a46b" />
      <circle cx="250" cy="92" r="6" fill="#e8dcc0" />
      <rect x="249" y="87" width="2" height="5" fill="#a8323a" />
      <rect x="249" y="92" width="2" height="5" fill="#2a2a40" />
    </>
  )
}
function Ambient() {
  return (
    <>
      <Pulse dur={5} lo={0.4}>
        <rect x="182" y="102" width="6" height="1" fill="#3a8fe0" />
      </Pulse>
      <Sway dur={6}>
        <rect x="262" y="8" width="1" height="14" fill="#6a6f78" />
        <rect x="259" y="22" width="7" height="8" fill="#ffd166" />
      </Sway>
      <Pulse dur={3} lo={0.5}>
        <rect x="258" y="26" width="7" height="2" fill="#fff4d6" />
      </Pulse>
    </>
  )
}
const room = {
  id: 'cartography',
  Back,
  Ambient,
  lights: [
    { x: 58, y: 48, r: 70, c: '#7ad1ff', o: 0.3 },
    { x: 262, y: 28, r: 50, c: '#ffd166', flicker: true, o: 0.3 },
    { x: 200, y: 98, r: 30, c: '#ffd166', flicker: true, o: 0.22 },
  ],
  motes: { kind: 'dust', count: 12, area: [20, 30, 140, 100] },
  keeper: { x: 160, y: 72, size: 28 },
}
export default function CartographyRoom({ children }) {
  return children(room)
}
