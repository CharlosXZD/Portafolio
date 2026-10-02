import { useEffect, useState } from 'react'

// Relics and pacts react while the score is added (EXPANSION.md P14). The
// cast reveal (DiceTray.jsx) announces each ledger group that comes from a
// relic or a boon with an `elementa:trigger` event; the icons in the round
// HUD listen and play a short bounce, a glow and a floating chip. An event
// instead of props because the reveal and the HUD are siblings.
export const TRIGGER_EVENT = 'elementa:trigger'

/** { 'relic:heat': { n, section, op, value } }, `n` counting up per trigger. */
export function useTriggerPulses() {
  const [pulses, setPulses] = useState({})
  useEffect(() => {
    function onTrigger(e) {
      const { kind, id, section, op, value } = e.detail ?? {}
      if (!kind || !id) return
      const key = `${kind}:${id}`
      setPulses((p) => ({ ...p, [key]: { n: (p[key]?.n ?? 0) + 1, section, op, value } }))
    }
    window.addEventListener(TRIGGER_EVENT, onTrigger)
    return () => window.removeEventListener(TRIGGER_EVENT, onTrigger)
  }, [])
  return pulses
}
