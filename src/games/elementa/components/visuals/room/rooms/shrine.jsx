import { Altar, Bob, Candle, Flame, Floor, Pillar, Pulse, Banner, Stones } from '../props.jsx'

// The Shrine (Aeris): a pale blue-white temple. God-rays, floating feathers,
// a prayer flame on the altar and blessing glyphs that pulse.
function Glyph({ x, y }) {
  return (
    <>
      <rect x={x + 2} y={y} width="2" height="8" fill="#dff3ff" />
      <rect x={x} y={y + 3} width="6" height="2" fill="#dff3ff" />
    </>
  )
}
function Back() {
  return (
    <>
      <Stones a="#3a4a6a" b="#425478" mortar="#202c48" bw={22} bh={11} />
      <Pillar x={20} y={8} h={116} a="#6a80a8" hi="#a8c4e8" lo="#3a4a6a" />
      <Pillar x={286} y={8} h={116} a="#6a80a8" hi="#a8c4e8" lo="#3a4a6a" />
      <Banner x={52} y={12} c="#6a9ad8" trim="#dff3ff" />
      <Banner x={252} y={12} c="#6a9ad8" trim="#dff3ff" />
      <Floor a="#33425e" b="#2c3a54" line="#4a5c80" joint="#1a2438" />
      <Altar x={136} y={106} w={48} />
      <Candle x={146} y={96} c="#dff3ff" />
      <Candle x={170} y={98} c="#dff3ff" />
    </>
  )
}
function Ambient() {
  return (
    <>
      <polygon points="120,0 150,0 190,124 90,124" fill="#dff3ff" opacity="0.08" />
      <Pulse dur={6} lo={0.2}>
        <polygon points="190,0 210,0 250,124 200,124" fill="#dff3ff" opacity="0.1" />
      </Pulse>
      <Flame x={157} y={90} w={6} h={10} outer="#9fd8ff" mid="#dff3ff" inner="#ffffff" />
      <Pulse dur={4} lo={0.3}>
        <Glyph x={84} y={50} />
      </Pulse>
      <Pulse dur={5} lo={0.3} delay={1.4}>
        <Glyph x={228} y={46} />
      </Pulse>
      <Bob dur={6} amp={2}>
        <rect x="112" y="60" width="3" height="1" fill="#ffffff" />
      </Bob>
    </>
  )
}
const room = {
  id: 'shrine',
  Back,
  Ambient,
  lights: [
    { x: 160, y: 40, r: 100, c: '#dff3ff', o: 0.22 },
    { x: 158, y: 92, r: 40, c: '#9fd8ff', flicker: true, o: 0.3 },
  ],
  motes: { kind: 'feather', count: 10, area: [40, 0, 280, 40] },
  keeper: { x: 146, y: 74, size: 28 },
}
export default function ShrineRoom({ children }) {
  return children(room)
}
