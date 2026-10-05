import { useMemo } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { arbiterLine, favorBand, giftLine, hindranceLine, hashText } from '../data/arbiter.js'
import { gatherDetails, arbiterFourthWall } from './fourthWall.js'
import { useFourthWall } from './useFourthWall.js'
import { readProfile } from './profile.js'

/**
 * What the Arbiter says at this moment (Part S), or null outside realm 3.
 * `situation` is 'round' or 'shop'. His mood (the hidden favor) only picks the
 * tone of the words; the gift and the slipped hold are announced when they
 * happen. About one turn in three, a player who said yes hears a line that
 * mentions a detail of their device (utils/fourthWall.js).
 */
export function useArbiter(state, situation) {
  const { lang } = useLanguage()
  const [permission] = useFourthWall()
  const { realm3, round, seed, favor, arbiterRound, eyeStrikes, activeSlot } = state
  return useMemo(() => {
    if (!realm3) return null
    const band = favorBand(favor || 0)
    const key = `${seed}:${situation}:${round}`
    if (situation === 'round' && arbiterRound?.used) return { text: hindranceLine(key)[lang], tone: 'cold', kind: 'slip' }
    if (situation === 'round' && arbiterRound?.gift) return { text: giftLine(key)[lang], tone: 'warm', kind: 'gift' }
    if (situation === 'round' && round === 31) {
      return { text: arbiterLine({ first: true, met: (eyeStrikes || 0) >= 3 })[lang], tone: band }
    }
    if (permission === 'yes' && hashText(key) % 3 === 0) {
      const details = gatherDetails({ lang, profile: readProfile(activeSlot) })
      const spoken = arbiterFourthWall({ permission, details, lang, seed, round })
      if (spoken) return { text: spoken, tone: band }
    }
    return { text: arbiterLine({ situation, favor, round, seed })[lang], tone: band }
  }, [realm3, round, seed, favor, arbiterRound, eyeStrikes, activeSlot, situation, permission, lang])
}
