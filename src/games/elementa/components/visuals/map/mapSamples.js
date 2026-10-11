// Sample Roads for the Visual Lab's Maps page, the tests and the test saves (VISUALS.md V6).
// They are built with the real engine functions (engine/map.js) from a seed, so they look like
// the Roads a run draws. Nothing here changes how a Road is laid out.
import { newMap, enterFirmament, enterRealm3, nextChoices } from '../../../engine/map.js'
import { setRngState, seedToState } from '../../../engine/rng.js'
import { difficultyById } from '../../../data/difficulty.js'

/** The follower shop each path leads to in the Firmament (engine/gameReducer.js FOLLOWER_SHOP). */
const FOLLOWER = { split: 'shrine', primordial: 'blackmarket', neutral: 'market' }

export const SAMPLE_SCENARIOS = {
  start: { round: 1, realm: 'elementa' },
  early: { round: 4, realm: 'elementa' },
  boss: { round: 9, realm: 'elementa', foretold: 10 },
  late: { round: 14, realm: 'elementa', pick: true },
  firmament: { round: 19, realm: 'firmament', path: 'split', pick: true },
  firmamentPeek: { round: 22, realm: 'firmament', path: 'neutral', peek: 25 },
  empyrean: { round: 33, realm: 'realm3', path: 'split', pick: true },
  pleroma: { round: 37, realm: 'realm3', path: 'primordial' },
  meridian: { round: 41, realm: 'realm3', path: 'neutral', pick: true },
  unwritten: { round: 44, realm: 'realm3', path: 'split' },
  clarity: { round: 6, realm: 'elementa', sight: 4 },
}

/** A state with just what the map reads: the Road, where you stand, and the run's realm. */
export function sampleState({ seed = 'MAPS', round = 8, realm = 'elementa', path = 'neutral', pick = false, sight = 0, foretold = null, peek = null } = {}) {
  setRngState(seedToState(seed))
  let map = newMap()
  if (realm === 'firmament' || realm === 'realm3') map = enterFirmament(map, FOLLOWER[path] ?? 'market')
  if (realm === 'realm3') map = enterRealm3(map)
  // Walk from the first stop to `round`, always taking the first fork, so the sample is steady.
  const trail = [map.layers[0][0].id]
  for (let r = 1; r < round; r++) {
    const node = map.layers[r - 1].find((n) => n.id === trail[trail.length - 1])
    trail.push(node.next[0])
  }
  map = { ...map, path: trail, currentId: trail[trail.length - 1], pendingId: null }
  if (pick) {
    const choices = nextChoices(map)
    if (choices.length) map = { ...map, pendingId: choices[choices.length - 1].id }
  }
  if (foretold) map = { ...map, prophecy: { round: foretold, boss: { id: 'umbra' }, broken: false } }
  if (peek) map = { ...map, peeks: { [peek]: 'clockwork' } }
  return {
    map,
    round,
    difficulty: difficultyById('ember'),
    realm: realm === 'elementa' ? 'elementa' : 'firmament',
    realm3: realm === 'realm3',
    path,
    roadSight: sight,
  }
}

/** The state after the player picks a stop: the same Road, with that stop pending (CHOOSE_PATH). */
export function withPick(state, nodeId) {
  return { ...state, map: { ...state.map, pendingId: nodeId } }
}
