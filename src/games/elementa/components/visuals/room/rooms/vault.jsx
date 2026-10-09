import { Banner, Beam, Books, Case, Floor, Ladder, Pillar, Pulse, Rug, ScrollRack, Stones } from '../props.jsx'
import { Bob } from '../props.jsx'

// The Relic Vault (the Curator): a stone archive. Cases under glass, a rolling
// ladder, shafts of dust and a shelf of dice from the fallen.
function Die({ x, y, c = '#e8dcc0' }) {
  return (
    <>
      <rect x={x} y={y} width="6" height="6" fill={c} />
      <rect x={x} y={y} width="6" height="1" fill="#ffffff" opacity="0.5" />
      <rect x={x + 2} y={y + 2} width="2" height="2" fill="#2c2840" />
    </>
  )
}
function Back() {
  return (
    <>
      <Stones a="#2c2a44" b="#34314f" mortar="#16142a" bw={24} bh={12} />
      <Beam a="#241f38" hi="#4a4466" />
      <Pillar x={10} y={10} h={114} />
      <Pillar x={296} y={10} h={114} />
      <Banner x={34} y={12} c="#4a3a8a" />
      <Banner x={268} y={12} c="#4a3a8a" />
      <ScrollRack x={58} y={30} n={6} />
      <Books x={64} y={58} colors={['#8f6bff', '#a8323a', '#3f9f5f']} w={18} />
      <Ladder x={104} y={36} h={90} />
      <Floor a="#26233a" b="#201d32" line="#34314f" joint="#100e1e" />
      <Case x={130} y={92} w={30} h={34} item="#ffd166" />
      <Case x={170} y={92} w={30} h={34} item="#9fd8ff" />
      <Case x={210} y={92} w={30} h={34} item="#ff7a8a" />
      <rect x="226" y="60" width="52" height="3" fill="#4a4466" />
      <Die x={230} y={54} />
      <Die x={242} y={54} c="#c8b6ff" />
      <Die x={254} y={54} c="#ffd166" />
      <Die x={266} y={54} c="#9fd8ff" />
      <Rug x={120} y={150} w={110} h={12} a="#3a2a6a" b="#c8b6ff" />
    </>
  )
}
function Ambient() {
  return (
    <>
      <Pulse dur={5} lo={0.3}>
        <rect x="136" y="98" width="18" height="2" fill="#ffffff" opacity="0.35" />
      </Pulse>
      <Bob dur={5} amp={1}>
        <rect x="178" y="100" width="4" height="4" fill="#9fd8ff" />
      </Bob>
      <Pulse dur={7} lo={0.2} delay={2}>
        <polygon points="150,10 180,10 214,124 118,124" fill="#c8b6ff" opacity="0.1" />
      </Pulse>
    </>
  )
}
const room = {
  id: 'vault',
  Back,
  Ambient,
  lights: [
    { x: 166, y: 70, r: 80, c: '#c8b6ff', o: 0.3 },
    { x: 60, y: 80, r: 40, c: '#8f6bff', o: 0.18 },
  ],
  motes: { kind: 'dust', count: 16, area: [120, 20, 220, 120] },
  keeper: { x: 262, y: 94, size: 28 },
}
export default function VaultRoom({ children }) {
  return children(room)
}
