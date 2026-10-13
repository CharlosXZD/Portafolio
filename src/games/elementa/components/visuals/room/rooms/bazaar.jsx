import { Banner, Bob, Floor, Pillar, Pulse, Rug, Stones, Table } from '../props.jsx'

// The Aether Bazaar (the Conclave): a grand gold and violet hall. Wares float
// above miniature stalls under hanging banners.
function Ware({ x, y, c }) {
  return (
    <>
      <rect x={x - 1} y={y - 1} width="12" height="12" fill="#120c1a" opacity="0.55" />
      <rect x={x} y={y} width="10" height="10" fill={c} />
      <rect x={x} y={y} width="10" height="3" fill="#ffffff" opacity="0.45" />
      <rect x={x + 4} y={y + 4} width="2" height="2" fill="#120c1a" opacity="0.5" />
    </>
  )
}
function Stall({ x, y, c }) {
  // A stall in miniature: a striped awning, a counter, two posts and a few wares on top.
  return (
    <>
      <rect x={x - 1} y={y - 11} width="54" height="12" fill="#120c1a" />
      <rect x={x} y={y - 10} width="52" height="10" fill={c} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={x + i * 9} y={y - 10} width="4" height="10" fill="#ffffff" opacity="0.18" />
      ))}
      <rect x={x} y={y} width="52" height="3" fill="#120c1a" opacity="0.45" />
      <rect x={x + 2} y={y + 3} width="4" height="26" fill="#3a2a5a" />
      <rect x={x + 46} y={y + 3} width="4" height="26" fill="#3a2a5a" />
      <rect x={x} y={y + 14} width="52" height="6" fill="#4a3a7a" />
      <rect x={x} y={y + 14} width="52" height="2" fill="#ffd166" opacity="0.7" />
      <rect x={x + 6} y={y + 8} width="8" height="6" fill="#ffd166" />
      <rect x={x + 22} y={y + 9} width="7" height="5" fill="#b88cff" />
      <rect x={x + 36} y={y + 8} width="8" height="6" fill="#9fd8ff" />
    </>
  )
}
function Chandelier() {
  return (
    <>
      <rect x="159" y="0" width="2" height="18" fill="#c9a030" />
      <rect x="138" y="18" width="44" height="3" fill="#ffd166" />
      <rect x="146" y="21" width="28" height="2" fill="#c9a030" />
      {[142, 154, 166, 176].map((cx) => (
        <rect key={cx} x={cx} y="12" width="3" height="6" fill="#fff3c4" />
      ))}
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
      <Stall x={30} y={104} c="#8a4ad8" />
      <Stall x={238} y={104} c="#c9a030" />
      <Chandelier />
      <Table x={140} y={112} w={44} h={22} top="#ffd166" leg="#c9a030" />
    </>
  )
}
function Ambient() {
  return (
    <>
      <Bob dur={4.5} amp={2}><Ware x={48} y={80} c="#ff7a8a" /></Bob>
      <Bob dur={5.5} amp={2} delay={-1}><Ware x={130} y={62} c="#9fd8ff" /></Bob>
      <Bob dur={4} amp={2} delay={-2}><Ware x={190} y={66} c="#ffd166" /></Bob>
      <Bob dur={6} amp={2} delay={-3}><Ware x={262} y={82} c="#b88cff" /></Bob>
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
