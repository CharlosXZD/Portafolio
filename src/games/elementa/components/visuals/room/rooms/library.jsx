import { Beam, Books, Candle, Floor, Globe, Ladder, Planks, Pillar, Rug, Shelf, Table, Window } from '../props.jsx'
import { Flame, Pulse, Sway, Twinkles } from '../props.jsx'

// The Library: the room behind the Gallery (VISUALS.md V4.7). Tall shelves of books, a rolling ladder,
// a window onto the night, a reading table with a candle and a globe; the display cabinets stand in it.
const SKY = ['#07060e', '#0c0a18', '#131026', '#1b1636', '#261c48', '#352358', '#4a2c66']
const STARS = [[250, 30, 0.5, true], [270, 44, 1.6], [286, 34, 2.4]]
const SPINES = [['#8f6bff', '#a8323a', '#3f9f5f'], ['#3d6fe5', '#c9a46b', '#a8323a'], ['#3f9f5f', '#8f6bff', '#e5533d']]

function Back() {
  return (
    <>
      <rect width="320" height="128" fill="#241a2e" />
      <Planks a="#241a2e" b="#2a2036" line="#16101e" hi="#352a44" />
      <Beam a="#2a1810" hi="#4a3020" />
      <Pillar x={8} y={10} h={114} a="#3a2a4a" hi="#5a4a6a" lo="#241a32" />
      {[24, 62, 100].map((x, i) => (
        <g key={x}>
          <Shelf x={x} y={52} w={34} board="#4a3020" hi="#8a5a34" bracket="#2a1810" />
          <Books x={x + 2} y={52} colors={SPINES[i]} w={30} />
          <Shelf x={x} y={88} w={34} board="#4a3020" hi="#8a5a34" bracket="#2a1810" />
          <Books x={x + 2} y={88} colors={SPINES[(i + 1) % 3]} w={30} />
        </g>
      ))}
      <Ladder x={142} y={34} h={90} />
      <Window x={248} y={26} w={50} h={52} sky={SKY} />
      <Floor a="#2a1c1c" b="#241616" line="#3a2828" joint="#120a0a" />
      <Rug x={176} y={146} w={120} h={14} a="#3a2a6a" b="#c8b6ff" />
      <Table x={228} y={110} w={56} h={34} />
      <Globe x={246} y={98} r={9} />
      <Candle x={270} y={102} />
    </>
  )
}

function Ambient() {
  return (
    <>
      <Twinkles stars={STARS} />
      <Sway dur={6}>
        <Candle x={270} y={102} h={8} />
      </Sway>
      <Flame x={271} y={94} w={2} h={4} />
      <Pulse dur={5} lo={0.7}>
        <rect x="262" y="96" width="16" height="2" fill="#ffd166" opacity="0.18" />
      </Pulse>
    </>
  )
}

const room = {
  id: 'library',
  Back,
  Ambient,
  lights: [
    { x: 272, y: 96, r: 70, c: '#ffd98a', flicker: true, o: 0.45 },
    { x: 60, y: 60, r: 60, c: '#c8b6ff', o: 0.15 },
  ],
  motes: { kind: 'dust', count: 14, area: [20, 20, 300, 120] },
}

export default function LibraryRoom({ children }) {
  return children(room)
}
