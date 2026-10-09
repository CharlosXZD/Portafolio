import { Pulse } from '../props.jsx'

// The Unwritten: a blank page that erases itself. Lines of ink appear and
// vanish; at the edges the page frays into nothing.
function Back() {
  return (
    <>
      <rect width="320" height="180" fill="#0e0d12" />
      <rect x="40" y="14" width="240" height="152" fill="#e8e4dc" />
      <rect x="40" y="14" width="240" height="152" fill="none" stroke="#b8b0a0" strokeWidth="1" />
      <rect x="40" y="14" width="6" height="152" fill="#c8c0b0" />
      <rect x="274" y="14" width="6" height="152" fill="#0e0d12" opacity="0.5" />
    </>
  )
}
function Line({ y, w, d }) {
  return (
    <g className="r-erase" style={{ '--dur': `${14 + d}s`, '--delay': `${-d * 2}s` }}>
      <rect x="62" y={y} width={w} height="3" fill="#2a2630" />
    </g>
  )
}
function Ambient() {
  return (
    <>
      <Line y={36} w={150} d={1} />
      <Line y={52} w={180} d={2} />
      <Line y={68} w={120} d={3} />
      <Line y={84} w={170} d={4} />
      <Line y={100} w={90} d={5} />
      <Pulse dur={6} lo={0.2}>
        <rect x="236" y="120" width="30" height="30" fill="#0e0d12" opacity="0.25" />
      </Pulse>
    </>
  )
}
const room = {
  id: 'unwritten',
  Back,
  Ambient,
  lights: [{ x: 160, y: 90, r: 120, c: '#ffffff', o: 0.08 }],
  motes: { kind: 'dust', count: 8, area: [40, 20, 280, 160], color: '#2a2630' },
}
export default function UnwrittenRoom({ children }) {
  return children(room)
}
