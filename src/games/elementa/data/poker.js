// Poker dice and the Joker (EXPANSION.md O3). A poker die has six faces,
// 9, 10, J, Q, K and A; each is also the number 9 to 14, so every rule that
// reads a die's value still works. The Joker adds a seventh face, a wild one
// stored as 15. Poker hands are read among the poker dice only and add Mult.
export const POKER_ID = 'poker'
export const JOKER_ID = 'joker'
export const POKER_IDS = [POKER_ID, JOKER_ID]
export const isPokerId = (elementId) => POKER_IDS.includes(elementId)
/** The Joker's wild face, stored as a number above the Ace. */
export const JOKER_FACE = 15
/** At most this many Jokers in one pool (Default). */
export const JOKER_CAP = 2

const LABELS = { 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K', 14: 'A', 15: '★' }

/** The faces a poker die can show (its numbers), in order. */
export const pokerFaces = (elementId) => (elementId === JOKER_ID ? [9, 10, 11, 12, 13, 14, 15] : [9, 10, 11, 12, 13, 14])

/** What is printed on a face: a rank letter for poker dice, the number otherwise. */
export const faceLabel = (elementId, value) => (isPokerId(elementId) ? LABELS[value] ?? value : value)

/** Every face a die can show, for the Inscribe screen: 1..sides, or a poker die's ranks. */
export const facesOf = (die) => (isPokerId(die.elementId) ? pokerFaces(die.elementId) : Array.from({ length: die.sides }, (_, i) => i + 1))

const L = (en, es) => ({ en, es })
// Best hand wins; the Mult is added once per cast (Default numbers).
export const POKER_HANDS = [
  { id: 'five_kind', mult: 15, name: L('Five of a kind', 'Quintilla') },
  { id: 'four_kind', mult: 8, name: L('Four of a kind', 'Póquer') },
  { id: 'full_house', mult: 5, name: L('Full house', 'Full') },
  { id: 'straight', mult: 5, name: L('Straight', 'Escalera') },
  { id: 'three_kind', mult: 3, name: L('Three of a kind', 'Trío') },
  { id: 'two_pair', mult: 2, name: L('Two pair', 'Doble par') },
  { id: 'pair', mult: 1, name: L('Pair', 'Par') },
]
export const handById = (id) => POKER_HANDS.find((h) => h.id === id)

function handOf(ranks) {
  const counts = new Map()
  ranks.forEach((r) => counts.set(r, (counts.get(r) || 0) + 1))
  const sorted = [...counts.values()].sort((a, b) => b - a)
  const [first = 0, second = 0] = sorted
  const distinct = [...counts.keys()].sort((a, b) => a - b)
  const straight = distinct.some((r) => [1, 2, 3, 4].every((k) => counts.has(r + k)))
  if (first >= 5) return 'five_kind'
  if (first >= 4) return 'four_kind'
  if (first >= 3 && second >= 2) return 'full_house'
  if (straight) return 'straight'
  if (first >= 3) return 'three_kind'
  if (first >= 2 && second >= 2) return 'two_pair'
  if (first >= 2) return 'pair'
  return null
}

/**
 * The best poker hand among the poker dice's values (needs at least two
 * dice). A Joker showing its wild face counts as any rank, whichever makes
 * the best hand. Returns the hand or null.
 */
export function bestHand(values) {
  const wilds = values.filter((v) => v === JOKER_FACE).length
  const ranks = values.filter((v) => v !== JOKER_FACE)
  if (values.length < 2) return null
  let best = null
  const walk = (k, picked) => {
    if (k === wilds) {
      const id = handOf([...ranks, ...picked])
      if (id && (!best || handById(id).mult > handById(best).mult)) best = id
      return
    }
    for (let r = 9; r <= 14; r++) walk(k + 1, [...picked, r])
  }
  walk(0, [])
  return best ? handById(best) : null
}
