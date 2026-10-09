import { Banner, Bob, Floor, Pillar, Pulse, Rug, Stones, Table } from '../props.jsx'

// The Aether Bazaar (the Conclave): a grand gold and violet hall. Wares float
// above miniature stalls under hanging banners.
function Ware({ x, y, c }) {
  return (
    <>
      <rect x={x} y={y} width="8" height="8" fill={c} />
      <rect x={x} y={y} width="8" height="2" fill="#ffffff" opacity="0.45" />
      <rect x={x + 3} y={y + 3} width="2" height="2" fill="#120c1a" opacity="0.5" />
    </>
  )
}
function Stall({ x, y, c }) {
  return (
    <>
      <rect x={x} y={y} width="36" height="6" fill={c} />
      <rect x={x} y={y + 6} width="36" height="2" fill="#120c1a" opacity="0.4" />
      <rect x={x + 2} y={y + 8} width="3" height="18" fill="#3a2a5a" />
      <rect x={x + 31} y={y + 8} width="3" height="18" fill="#3a2a5a" />
      <rect x={x + 4} y={y - 4} width="6" height="4" fill="#ffd166" />
      <rect x={x + 18} y={y - 3} width="5" height="3" fill="#b88cff" />
    </>
  )
}
function Back() {
  return (
    <>
      <Stones a="#2a1f4a" b="#33265a" mortar="#150f2c" bw={26} bh={13} />
      <Pillar x={8} y={0} h={124} a="#4a3a7a" hi="#ffd166" lo="#2a1f4a" w={16} />
      <Pillar x={296} y={0} h={124} a="#4a3a7a" hi="#ffd166" lo="#2a1f4a" w={16} />
      <Banner x={52} y={0} c="#6a3ab0" trim="#ffd166" h={44} />
      <Banner x={252} y={0} c="#6a3ab0" trim="#ffd166" h={44} />
      <Floor a="#2a2048" b="#241a3e" line="#ffd166" joint="#120c24" />
      <Rug x={70} y={146} w={180} h={14} a="#4a2a8a" b="#ffd166" />
      <Stall x={46} y={96} c="#8a4ad8" />
      <Stall x={238} y={96} c="#c9a030" />
      <Table x={140} y={112} w={44} h={22} top="#ffd166" leg="#c9a030" />
    </>
  )
}
function Ambient() {
  return (
    <>
      <Bob dur={4.5} amp={2}><Ware x={62} y={72} c="#ff7a8a" /></Bob>
      <Bob dur={5.5} amp={2} delay={-1}><Ware x={140} y={60} c="#9fd8ff" /></Bob>
      <Bob dur={4} amp={2} delay={-2}><Ware x={206} y={68} c="#ffd166" /></Bob>
      <Bob dur={6} amp={2} delay={-3}><Ware x={260} y={74} c="#b88cff" /></Bob>
      <Pulse dur={3.6} lo={0.3}>
        <rect x="158" y="102" width="8" height="2" fill="#ffd166" />
      </Pulse>
    </>
  )
}
const room = {
  id: 'bazaar',
  Back,
  Ambient,
  lights: [
    { x: 160, y: 40, r: 110, c: '#ffd166', o: 0.22 },
    { x: 60, y: 70, r: 50, c: '#8a4ad8', o: 0.2 },
    { x: 260, y: 70, r: 50, c: '#ffd166', o: 0.18 },
  ],
  motes: { kind: 'spark', count: 12, area: [20, 40, 300, 120], color: '#ffd166' },
  keeper: { x: 146, y: 84, size: 28 },
}
export default function BazaarRoom({ children }) {
  return children(room)
}
