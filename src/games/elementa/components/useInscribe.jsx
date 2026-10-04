import { useState } from 'react'
import { runesOf } from '../data/runes.js'
import { selectors } from '../engine/gameReducer.js'
import InscribeScreen from './InscribeScreen.jsx'

/**
 * The two die items that need more than a click on a die (EXPANSION.md K3b,
 * K6), shared by the shop and the table:
 *   a Rune opens the Inscribe screen on the die you picked, to choose its
 *   number;
 *   a Graft first takes the die that gives a rune, then the die that gets
 *   it, then the Inscribe screen.
 * `route(item, die, finish)` returns 'fail' (play the no sound), 'wait'
 * (still choosing), true (the screen is open) or false (not one of these
 * items: apply it as usual). `finish(extra)` dispatches with the chosen
 * `{ face }` or `{ dieId, toDieId, face, runeIndex }`.
 */
export function useInscribe(state) {
  const [open, setOpen] = useState(null)
  const [graftFrom, setGraftFrom] = useState(null)

  function reset() {
    setOpen(null)
    setGraftFrom(null)
  }

  function route(item, die, finish) {
    if (item?.type === 'rune') {
      if (!selectors.consumableTargetOk(state, item, die)) return 'fail'
      setOpen({ die, runeId: item.rune, finish: (r) => finish({ face: r.face }) })
      return true
    }
    if (item?.type === 'graft') {
      if (!graftFrom) {
        if (!runesOf(die).length) return 'fail'
        setGraftFrom(die.id)
        return 'wait'
      }
      const source = state.dice.find((d) => d.id === graftFrom)
      if (!source || die.id === graftFrom || die.elementId === 'entropy' || selectors.isMythicDie(die.elementId)) return 'fail'
      setOpen({
        die,
        choices: runesOf(source),
        finish: (r) => finish({ dieId: graftFrom, toDieId: die.id, face: r.face, runeIndex: r.runeIndex }),
      })
      return true
    }
    return false
  }

  const element = open ? (
    <InscribeScreen
      die={open.die}
      runeId={open.runeId}
      choices={open.choices}
      onConfirm={(r) => {
        open.finish(r)
        reset()
      }}
      onCancel={reset}
    />
  ) : null

  return { route, element, graftFrom, reset }
}
