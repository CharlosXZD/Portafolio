import { playClank, playClick, playCoin, playFail, playTick } from '../../../utils/sound.js'
import { onRoom } from './roomBus.js'

// The room events as sound (VISUALS.md V4.3): the hooks V3 emitted now play the game's existing
// sfx, at today's loudness, through the same engine, so the Options volume and mute settings apply.
// `hover` is one new, very quiet tick; `pick` is the usual click; `buy` and `sell` the coin; `broke`
// the fail buzz; `bell` the clank of the lever. `restock`, `welcome` and `leave` stay silent (the
// reroll and the next-round buttons already play their own sound).
const SOUNDS = {
  hover: playTick,
  pick: playClick,
  buy: playCoin,
  sell: playCoin,
  broke: playFail,
  bell: playClank,
}

let installed = 0
let off = null

/** Starts listening (counted, so two screens at once do not double the sound); returns the stop function. */
export function installRoomSounds() {
  if (installed++ === 0) off = onRoom((name) => SOUNDS[name]?.())
  return () => {
    if (--installed === 0) off?.()
  }
}
