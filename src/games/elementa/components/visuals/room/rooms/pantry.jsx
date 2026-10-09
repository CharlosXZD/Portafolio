import { Barrel, Crate, Floor, Herbs, Jar, Planks, Pulse, Sack, Shelf, Sway, WatchingEyes } from '../props.jsx'

// The Pantry (Mote): a dim larder of jars and sacks. A small watching Void
// sits in the dark corner; it brightens as Mote's meter fills (the stage's
// `void` var, 0 to 1, set by the shop).
function Back({ meter = 0 }) {
  return (
    <>
      <Planks a="#1a1624" b="#1e1a2a" line="#100c18" hi="#2a2438" />
      <Shelf x={16} y={40} w={104} board="#3a2e4a" hi="#5a4a7a" bracket="#241c32" />
      <Jar x={22} y={26} fill="#8a7aa8" />
      <Jar x={38} y={26} fill="#6fd38a" />
      <Jar x={54} y={26} fill="#ffd166" />
      <Jar x={70} y={26} fill="#d95a8a" />
      <Jar x={86} y={26} fill="#3d8fe5" />
      <Shelf x={16} y={80} w={104} board="#3a2e4a" hi="#5a4a7a" bracket="#241c32" />
      <Jar x={22} y={66} fill="#b88cff" h={14} />
      <Jar x={42} y={66} fill="#ff9a3a" h={14} />
      <Jar x={62} y={66} fill="#8a7aa8" h={14} />
      <Floor a="#161220" b="#120e1a" line="#221c30" joint="#08060e" />
      <Sack x={130} y={108} />
      <Sack x={150} y={112} c="#8a7a5c" />
      <Barrel x={200} y={96} w={26} h={30} a="#3a2e4a" hi="#5a4a7a" hoop="#1a1424" />
      <Crate x={240} y={108} w={26} h={20} a="#3a2e4a" hi="#5a4a7a" band="#1a1424" />
      <circle cx="286" cy="76" r="14" fill="#08060e" />
      <circle cx="286" cy="76" r="14" fill="none" stroke="#8a7aa8" strokeWidth="1" opacity={0.35 + 0.65 * meter} />
      <circle cx="286" cy="76" r={14 * meter} fill="#3a2a5a" opacity={0.5 * meter} />
    </>
  )
}
function Ambient({ meter = 0 }) {
  return (
    <>
      <Sway dur={6}><Herbs x={150} y={10} len={16} c="#6a8a5a" /></Sway>
      <Pulse dur={5} lo={0.2 + 0.5 * meter}>
        <rect x="281" y="73" width="3" height="3" fill="#d9b8ff" />
        <rect x="288" y="73" width="3" height="3" fill="#d9b8ff" />
      </Pulse>
      <WatchingEyes x={216} y={84} c="#d9b8ff" dur={11} delay={-2} />
      <Pulse dur={4} lo={0.4}>
        <rect x="46" y="28" width="4" height="3" fill="#ffd166" />
      </Pulse>
    </>
  )
}
const room = {
  id: 'pantry',
  Back,
  Ambient,
  lights: (_tone, meter = 0) => [
    { x: 70, y: 56, r: 60, c: '#8a7aa8', o: 0.22 },
    { x: 286, y: 76, r: 36 + 20 * meter, c: '#d9b8ff', o: 0.15 + 0.4 * meter },
  ],
  motes: { kind: 'dust', count: 8, area: [20, 30, 260, 110], color: '#b8a8d8' },
  keeper: { x: 160, y: 80, size: 28 },
}
export default function PantryRoom({ children }) {
  return children(room)
}
