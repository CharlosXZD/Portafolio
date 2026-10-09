import { Component, Suspense, lazy } from 'react'
import PixelBackdrop from '../PixelBackdrop.jsx'
import { realm3For } from '../../data/realm3.js'
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

/** Which room (if any) this moment of the game stands in. */
export function roomFor(state) {
  if (state.convergence) return { id: 'unwritten', realm: 'elementa' }
  const realm = state.realm3 ? realm3For(state.path).id : state.realm === 'firmament' ? 'firmament' : 'elementa'
  if (state.phase === 'shop' || state.phase === 'bossReward') {
    const type = state.shop?.type
    return ROOM_LOADERS[type] ? { id: type, realm } : null
  }
  if (state.phase === 'crossroads') return { id: 'crossroads', realm }
  if (state.phase === 'rolling' || state.phase === 'missed') {
    return state.bossModifier ? { id: 'boss', realm, tone: state.bossModifier.color } : { id: 'table', realm }
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
        <RoomStage roomId={room.id} realm={room.realm} tone={room.tone} dim={1} />
      </Suspense>
    </Fallback>
  )
}
