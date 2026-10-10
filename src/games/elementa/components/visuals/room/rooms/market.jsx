import { Barrel, Beam, Books, Counter, Crate, Creature, Floor, Herbs, Jar, Lantern, Notice, Planks, Plant, Sack, Shelf, Window, Bottle, Candle } from '../props.jsx'
import { Bubbles, Flame, Sway, Twinkles } from '../props.jsx'

// The Market (Tobb): the V1 feel-test stall, adapted to the real game. Warm
// wood, two lanterns, a window onto a dusk sky, jars and a sleeping fox in the
// sun, hanging herbs and Tobb's backpack on its hook.
const SKY = ['#120d24', '#1f1535', '#34203f', '#4f2944', '#733545', '#9c4a43', '#c46a45']
const STARS = [[30, 28, 0.2, true], [44, 34, 1.1], [58, 30, 2], [70, 40, 0.6], [36, 46, 1.6], [76, 30, 2.4, true], [64, 52, 0.9]]

function Back({ shop }) {
  return (
    <>
      <rect width="320" height="128" fill="#2e1c26" />
      <Planks />
      <Beam />
      <Window x={27} y={25} w={58} h={54} sky={SKY} />
      <Plant x={30} y={72} />
      {!shop && (
        <>
      <Shelf x={104} y={64} w={122} />
      <Books x={108} y={64} />
      <Jar x={128} y={52} />
      <Jar x={146} y={52} fill="#ffe27a" level={0.2} />
      <Candle x={198} y={64} />

        </>
      )}
      <Notice x={236} y={24} />
      <Herbs x={176} y={14} />
      <Herbs x={64} y={10} c="#a6e57a" len={10} />
      <Floor />
      <Crate x={4} y={132} w={26} h={22} />
      <Barrel x={34} y={118} w={22} h={34} />
      <Sack x={60} y={134} />
      <Counter />
      <Bottle x={250} y={96} fill="#6fd38a" />
      <Lantern x={124} y={12} rope={2} />
      <Lantern x={228} y={12} rope={2} />
    </>
  )
}

function Ambient() {
  return (
    <>
      <Twinkles stars={STARS} />
      <Bubbles x={131} y={60} />
      <Sway dur={6.4}>
        <Candle x={198} y={64} h={8} />
      </Sway>
      <Flame x={199} y={52} w={2} h={4} />
      <Creature x={106} y={141} />
    </>
  )
}

const room = {
  id: 'market',
  Back,
  Ambient,
  lights: [
    { x: 128, y: 24, r: 46, c: '#ffd98a', flicker: true, o: 0.55 },
    { x: 232, y: 24, r: 46, c: '#ffd98a', flicker: true, o: 0.5 },
    { x: 56, y: 120, r: 50, c: '#ffe9a0', o: 0.14 },
  ],
  motes: { kind: 'dust', count: 14, area: [30, 80, 150, 150] },
  keeper: { x: 286, y: 84, size: 28 },
}

export default function MarketRoom({ children }) {
  return children(room)
}
