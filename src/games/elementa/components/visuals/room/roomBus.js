// A tiny event bus for the shop rooms (VISUALS.md V3.8). The shop emits what
// just happened ('welcome', 'pick', 'buy', 'broke', 'sell', 'restock',
// 'leave', plus the V1 names 'hover' and 'bell'); the keeper rig and the room
// react to it. These names are also the hooks V4 will wire to the existing
// sounds: nothing here plays a sound.
const listeners = new Set()

export const ROOM_EVENTS = ['welcome', 'hover', 'pick', 'buy', 'bell', 'broke', 'restock', 'sell', 'leave']

export function emitRoom(name, data) {
  listeners.forEach((fn) => fn(name, data))
}

/** Subscribe to every room event; returns the unsubscribe function. */
export function onRoom(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** The room event a game action causes, or null (used to wrap the shop's dispatch). */
export function eventForAction(type) {
  if (/^BUY_/.test(type)) return 'buy'
  if (/^SELL_/.test(type)) return 'sell'
  if (type === 'REROLL_SHOP_OFFERS') return 'restock'
  if (type === 'NEXT_ROUND' || type === 'CHOOSE_PATH') return 'leave'
  return null
}
