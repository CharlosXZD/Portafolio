import { Anvil, Barrel, Beam, Crate, Floor, ForgeMouth, Notice, Orrery, Pillar, Rug, Sign, Stones } from '../props.jsx'
import { Flame, GearSpin, Sparks, Steam, Sway, Pulse } from '../props.jsx'

// The Forge (Brasa; Vesper joins her in the Firmament): a stone smithy around
// a glowing forge mouth. An anvil, hanging tongs, a quench barrel that steams,
// a rack of ingots, a bellows that pumps and sparks that jump.
function Tongs({ x, y }) {
  return (
    <>
      <rect x={x} y={y} width="2" height="22" fill="#6a6f78" />
      <rect x={x + 6} y={y} width="2" height="22" fill="#6a6f78" />
      <rect x={x + 1} y={y + 18} width="6" height="2" fill="#aab0b8" />
      <rect x={x + 2} y={y - 3} width="4" height="3" fill="#4b4f58" />
    </>
  )
}
function Ingots({ x, y }) {
  return (
    <>
      <rect x={x} y={y + 8} width="34" height="3" fill="#5a3620" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={x + 2 + i * 8} y={y} width="7" height="8" fill={i % 2 ? '#ffb347' : '#ff7a1a'} />
          <rect x={x + 2 + i * 8} y={y} width="7" height="1" fill="#ffe27a" />
        </g>
      ))}
    </>
  )
}

// Vesper's corner (the Firmament): star-charts pinned up and a small orrery on a stand.
function VesperCorner() {
  return (
    <>
      <Notice x={206} y={62} w={22} h={26} c="#2c3a6a" ink="#9fb8ff" lines={4} />
      <Notice x={232} y={66} w={18} h={22} c="#24305a" ink="#9fb8ff" lines={3} />
      <rect x="270" y="100" width="4" height="26" fill="#4a4a6a" />
      <Orrery x={272} y={90} r={14} c="#9fb8ff" core="#ffd166" />
    </>
  )
}

function Back({ realm }) {
  return (
    <>
      <Stones a="#3a2c34" b="#443640" mortar="#1d1218" />
      <Beam a="#2a1812" hi="#5a3620" />
      <Pillar x={14} y={10} h={114} a="#3a3550" hi="#5a5478" lo="#241f38" />
      <Pillar x={290} y={10} h={114} a="#3a3550" hi="#5a5478" lo="#241f38" />
      <ForgeMouth x={104} y={64} w={80} h={56} />
      <rect x="90" y="30" width="108" height="30" fill="#2c2840" />
      <rect x="90" y="30" width="108" height="2" fill="#5a5478" />
      <Notice x={236} y={28} w={26} h={30} c="#d8c8a0" ink="#6a4a30" />
      <Tongs x={214} y={30} />
      <Tongs x={228} y={30} />
      <Floor a="#2a1c20" b="#241418" line="#3a2a30" joint="#120a0c" />
      <Anvil x={30} y={108} />
      <Barrel x={254} y={100} w={26} h={30} a="#3a3550" hi="#5a5478" hoop="#1d1829" />
      <rect x="256" y="100" width="22" height="4" fill="#3d8fe5" />
      <Ingots x={188} y={116} />
      <Crate x={120} y={132} w={20} h={18} a="#3a2c34" hi="#5a4a54" band="#241418" />
      <Rug x={96} y={150} w={100} h={12} a="#5a1a22" />
      <Sign x={20} y={22} w={44} c="#2a1812" />
      {realm === 'firmament' && <VesperCorner />}
    </>
  )
}

function Ambient() {
  return (
    <>
      <Flame x={120} y={104} w={12} h={14} />
      <Flame x={140} y={100} w={14} h={18} delay={0.3} />
      <Flame x={160} y={104} w={12} h={14} delay={0.6} />
      <Sparks x={144} y={92} n={9} />
      <Sparks x={46} y={106} n={4} c="#fff4d6" c2="#ffd166" />
      <Steam x={262} y={96} n={3} c="#cfe0e8" />
      <Pulse dur={2.4}>
        <rect x="196" y="108" width="4" height="4" fill="#ffb347" />
      </Pulse>
      <Sway dur={5}>
        <rect x="150" y="22" width="1" height="8" fill="#6a6f78" />
      </Sway>
      <GearSpin x={274} y={44} r={9} teeth={8} c="#6a6f78" dur={20} />
    </>
  )
}

const room = {
  id: 'forge',
  Back,
  Ambient,
  lights: [
    { x: 144, y: 100, r: 78, c: '#ff7a1a', flicker: true, o: 0.6 },
    { x: 144, y: 112, r: 40, c: '#ffd166', flicker: true, o: 0.35 },
    { x: 46, y: 118, r: 30, c: '#ff9a3a', o: 0.2 },
  ],
  motes: { kind: 'ember', count: 14, area: [96, 70, 200, 120] },
  keeper: { x: 40, y: 80, size: 28 },
}

export default function ForgeRoom({ children }) {
  return children(room)
}
