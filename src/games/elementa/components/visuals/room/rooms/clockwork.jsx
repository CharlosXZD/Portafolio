import { Beam, ClockFace, Cog, Floor, GearSpin, Pendulum, Planks, SandFall, Table } from '../props.jsx'
import { ClockHand } from '../props.jsx'

// Clockwork (the Horologist): walls of gears and clocks, a swinging pendulum
// and sand that falls through a glass.
function Back() {
  return (
    <>
      <Planks a="#2a2218" b="#30281c" line="#1c160e" hi="#42382a" />
      <Beam a="#3a2e1c" hi="#6a5430" />
      <ClockFace x={40} y={40} r={16} />
      <ClockFace x={274} y={44} r={13} />
      <Cog x={90} y={30} r={12} />
      <Cog x={236} y={30} r={10} c="#a8844a" />
      <Floor a="#241d12" b="#1e180e" line="#34291a" joint="#100c06" />
      <Table x={20} y={104} w={50} h={26} top="#5a4a2a" leg="#3a2e1c" />
      <rect x="236" y="90" width="26" height="32" fill="#3a2e1c" />
      <rect x="240" y="94" width="18" height="24" fill="#dff3ff" opacity="0.18" />
      <rect x="236" y="88" width="26" height="3" fill="#c9a46b" />
      <rect x="236" y="121" width="26" height="3" fill="#c9a46b" />
      <rect x="150" y="14" width="24" height="76" fill="#3a2e1c" />
      <rect x="153" y="17" width="18" height="70" fill="#14100a" />
    </>
  )
}
function Ambient() {
  return (
    <>
      <GearSpin x={90} y={30} r={12} teeth={10} dur={18} />
      <GearSpin x={236} y={30} r={10} teeth={8} dur={14} c="#a8844a" reverse />
      <GearSpin x={120} y={70} r={8} teeth={8} dur={10} reverse />
      <ClockHand x={40} y={40} len={11} dur={60} steps={60} />
      <ClockHand x={274} y={44} len={9} dur={12} steps={12} />
      <Pendulum x={162} y={20} len={56} bob={8} />
      <SandFall x={248} y={96} h={20} />
    </>
  )
}
const room = {
  id: 'clockwork',
  Back,
  Ambient,
  lights: [
    { x: 160, y: 60, r: 90, c: '#c9a46b', o: 0.25 },
    { x: 248, y: 100, r: 30, c: '#ffd166', o: 0.2 },
  ],
  motes: { kind: 'dust', count: 10, area: [20, 20, 300, 120], color: '#c9a46b' },
  keeper: { x: 80, y: 94, size: 28 },
}
export default function ClockworkRoom({ children }) {
  return children(room)
}
