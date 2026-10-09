import { Pillar, Pulse, Stones } from '../props.jsx'

// A boss stage: a dark arena in the boss's color (the stage's `tone`) with a
// raised dais and a rift of light the boss steps out of. The entrance beat
// is the stage's own cinematic (V5); this room is only the place.
const TONE = '#ff5a4a'
function Back({ tone = TONE }) {
  return (
    <>
      <rect width="320" height="180" fill="#0a0810" />
      <Stones a="#17121f" b="#1d1726" mortar="#0a0810" y={0} h={110} />
      <Pillar x={20} y={0} h={140} a="#241c30" hi="#3a2e4c" lo="#120e1a" w={18} />
      <Pillar x={282} y={0} h={140} a="#241c30" hi="#3a2e4c" lo="#120e1a" w={18} />
      <rect y="136" width="320" height="44" fill="#120e1a" />
      <rect y="136" width="320" height="2" fill={tone} opacity="0.6" />
      <ellipse cx="160" cy="150" rx="86" ry="10" fill="#241c30" />
      <ellipse cx="160" cy="148" rx="60" ry="6" fill={tone} opacity="0.25" />
      <rect x="140" y="30" width="40" height="100" fill={tone} opacity="0.12" />
    </>
  )
}
function Ambient({ tone = TONE }) {
  return (
    <>
      <Pulse dur={3} lo={0.3}>
        <rect x="152" y="40" width="16" height="90" fill={tone} opacity="0.35" />
      </Pulse>
      <Pulse dur={5} lo={0.2} delay={1}>
        <rect x="26" y="40" width="6" height="6" fill={tone} />
        <rect x="288" y="40" width="6" height="6" fill={tone} />
      </Pulse>
    </>
  )
}
const room = {
  id: 'boss',
  Back,
  Ambient,
  lights: (tone = TONE) => [
    { x: 160, y: 90, r: 110, c: tone, flicker: true, o: 0.4 },
    { x: 160, y: 150, r: 70, c: tone, o: 0.25 },
  ],
  motes: { kind: 'ember', count: 12, area: [30, 80, 290, 140] },
}
export default function BossRoom({ children }) {
  return children(room)
}
