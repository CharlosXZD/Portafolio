import { Component, Suspense, lazy } from 'react'
import PixelBackdrop from '../PixelBackdrop.jsx'
import { realm3For } from '../../data/realm3.js'
import { bossColor } from '../../data/bossModifiers.js'
import { mix } from '../../utils/color.js'
import { ROOM_LOADERS } from './room/rooms.js'

// The game's backdrop (VISUALS.md V3.3). A shop, the table, a boss fight, the
// Crossroads and the Unwritten each get their room; everything else (the
// menus) keeps the old PixelBackdrop, which is also the fallback while a
// room's chunk loads and if it ever fails to load. The room art is a lazy
// chunk, so none of it is in the main bundle.
const RoomStage = lazy(() => import('./room/RoomStage.jsx'))

class Fallback extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

// A very dark boss color (the Eclipse, the Umbra) would vanish on the dark stage: lift it.
function stageTone(id) {
  const c = bossColor(id)
  const n = parseInt(c.slice(1), 16)
  const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
  return lum < 0.4 ? mix(c, '#ffffff', 0.45) : c
}

/** Which room (if any) this moment of the game stands in. */
export function roomFor(state) {
  if (state.convergence) return { id: 'unwritten', realm: 'elementa' }
  const realm = state.realm3 ? realm3For(state.path).id : state.realm === 'firmament' ? 'firmament' : 'elementa'
  if (state.phase === 'shop' || state.phase === 'bossReward') {
    const type = state.shop?.type
    return ROOM_LOADERS[type] ? { id: type, realm, meter: type === 'pantry' ? Math.min(1, (state.moteFed || 0) / 40) : 0 } : null
  }
  if (state.phase === 'crossroads') return { id: 'crossroads', realm }
  if (state.phase === 'rolling' || state.phase === 'missed') {
    return state.bossModifier ? { id: 'boss', realm, tone: stageTone(state.bossModifier.id) } : { id: 'table', realm }
  }
  return null
}

export default function SceneBackdrop({ state, scene }) {
  const room = roomFor(state)
  const old = <PixelBackdrop scene={scene} />
  if (!room) return old
  return (
    <Fallback key={room.id} fallback={old}>
      <Suspense fallback={old}>
        <RoomStage roomId={room.id} realm={room.realm} tone={room.tone} meter={room.meter} dim={room.id === 'crossroads' ? 1.7 : 1} />
      </Suspense>
    </Fallback>
  )
}
