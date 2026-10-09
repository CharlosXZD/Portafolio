import { Beam, Bottle, Bubbles, Cauldron, Floor, Herbs, Jar, Owl, Planks, Pulse, Shelf, Steam, Sway, Table, Window } from '../props.jsx'

// The Alchemist (Vessa): a green-lit workroom. A cauldron that bubbles, shelves
// of bottles, a stuffed owl, hanging herbs and flasks that shift color.
function Back() {
  return (
    <>
      <Planks a="#1e2a2a" b="#22302f" line="#142020" hi="#2e403e" />
      <Beam a="#2a1c14" hi="#4a3424" />
      <Window x={236} y={22} w={44} h={50} sky={['#0c1a1c', '#12302e', '#1d4a40', '#2e7a62']} frame="#4a3424" sill="#5a4030" id="alch" />
      <Shelf x={20} y={44} w={92} />
      <Bottle x={26} y={30} fill="#3d8fe5" />
      <Bottle x={38} y={30} fill="#d95a8a" h={16} />
      <Jar x={52} y={32} fill="#6fd38a" />
      <Bottle x={68} y={30} fill="#ffd166" />
      <Jar x={82} y={32} fill="#b88cff" />
      <Shelf x={20} y={78} w={92} />
      <Jar x={26} y={64} fill="#ff9a3a" h={14} />
      <Bottle x={44} y={64} fill="#6fd38a" h={14} />
      <Jar x={60} y={66} fill="#5fb0d6" />
      <Owl x={92} y={64} />
      <Floor a="#1b2420" b="#171f1c" line="#26332d" joint="#0c1210" />
      <Table x={196} y={106} w={52} h={26} top="#5a4030" leg="#3a281c" />
      <Bottle x={206} y={92} fill="#d95a8a" />
      <Jar x={226} y={94} fill="#3d8fe5" />
      <Cauldron x={130} y={112} w={44} h={30} fill="#6fd38a" />
      <rect x="118" y="142" width="68" height="4" fill="#0c1210" />
      <rect x="126" y="140" width="52" height="3" fill="#4a3424" />
    </>
  )
}
function Ambient() {
  return (
    <>
      <Bubbles x={140} y={112} n={4} c="#c6ffd4" rise={14} />
      <Steam x={148} y={106} n={3} c="#bff5d4" rise={22} />
      <Sway dur={5}>
        <Herbs x={124} y={14} len={18} />
        <Herbs x={150} y={14} len={14} c="#8fcf6a" />
      </Sway>
      <Pulse dur={4} lo={0.4}>
        <rect x="208" y="96" width="4" height="3" fill="#ff9ac0" />
      </Pulse>
      <Pulse dur={6} lo={0.3} delay={1.5}>
        <rect x="228" y="97" width="4" height="3" fill="#8fd0ff" />
      </Pulse>
      <Pulse dur={3.4} lo={0.5}>
        <rect x="28" y="68" width="4" height="3" fill="#ffd166" />
      </Pulse>
    </>
  )
}
const room = {
  id: 'alchemist',
  Back,
  Ambient,
  lights: [
    { x: 150, y: 100, r: 70, c: '#4fd1a5', flicker: true, o: 0.45 },
    { x: 258, y: 46, r: 50, c: '#6fd3b8', o: 0.2 },
  ],
  motes: { kind: 'vapor', count: 10, area: [110, 60, 200, 110], color: '#bff5d4' },
  keeper: { x: 214, y: 76, size: 28 },
}
export default function AlchemistRoom({ children }) {
  return children(room)
}
