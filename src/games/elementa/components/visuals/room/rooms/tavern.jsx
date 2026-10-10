import { Barrel, Beam, Candle, Crate, Creature, Floor, ForgeMouth, Lantern, Notice, Planks, Plant, Rug, Sack, Table, Window } from '../props.jsx'
import { Flame, Pulse, Sparks, Sway, Twinkles } from '../props.jsx'

// The Tavern: the room behind the main menu, the file select and the title screen (VISUALS.md V4.4).
// Warm planks, a hearth, two windows onto the night, lanterns, barrels, a table with a candle and
// a cat asleep on the rug. The menu's sign and board hang in it.
const SKY = ['#07060e', '#0c0a18', '#131026', '#1b1636', '#261c48', '#352358', '#4a2c66']
const STARS = [[30, 30, 0.3, true], [50, 40, 1.4], [70, 34, 2.1], [250, 34, 0.8, true], [270, 46, 1.9], [290, 38, 2.6]]

function Back() {
  return (
    <>
      <rect width="320" height="128" fill="#2e1c26" />
      <Planks />
      <Beam />
      <Window x={136} y={26} w={50} h={50} sky={SKY} />
      <Window x={252} y={26} w={50} h={50} sky={SKY} />
      <ForgeMouth x={16} y={62} w={80} h={56} />
      <rect x="4" y="30" width="104" height="30" fill="#3a2c34" />
      <rect x="4" y="30" width="104" height="2" fill="#5a4a54" />
      <Notice x={42} y={36} w={28} h={20} c="#d8c8a0" ink="#6a4a30" lines={3} />
      <Floor />
      <Rug x={96} y={146} w={128} h={14} a="#5a1a22" b="#ffd166" />
      <Barrel x={118} y={112} w={26} h={36} />
      <Crate x={150} y={130} w={22} h={20} />
      <Sack x={178} y={134} />
      <Table x={248} y={116} w={52} h={30} />
      <Candle x={268} y={106} />
      <Plant x={236} y={104} />
      <Lantern x={92} y={12} rope={2} />
      <Lantern x={228} y={12} rope={2} />
    </>
  )
}

function Ambient() {
  return (
    <>
      <Twinkles stars={STARS} />
      <Flame x={28} y={106} w={12} h={14} />
      <Flame x={48} y={102} w={14} h={18} delay={0.3} />
      <Flame x={68} y={106} w={12} h={14} delay={0.6} />
      <Sparks x={52} y={94} n={7} />
      <Sway dur={6}>
        <Candle x={268} y={106} h={8} />
      </Sway>
      <Pulse dur={4} lo={0.5}>
        <rect x="268" y="102" width="2" height="3" fill="#ffd166" />
      </Pulse>
      <Creature x={168} y={147} />
    </>
  )
}

const room = {
  id: 'tavern',
  Back,
  Ambient,
  lights: [
    { x: 56, y: 104, r: 84, c: '#ff9a3a', flicker: true, o: 0.5 },
    { x: 96, y: 24, r: 44, c: '#ffd98a', flicker: true, o: 0.45 },
    { x: 232, y: 24, r: 44, c: '#ffd98a', flicker: true, o: 0.45 },
  ],
  motes: { kind: 'ember', count: 8, area: [20, 76, 92, 118] },
}

export default function TavernRoom({ children }) {
  return children(room)
}
