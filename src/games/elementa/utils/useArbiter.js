import { useMemo } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { arbiterLine, favorBand, giftLine, hindranceLine, hashText } from '../data/arbiter.js'
import { gatherDetails, arbiterFourthWall } from './fourthWall.js'
import { currentWeather } from './weather.js'
import { useWeather } from './useWeather.js'
import { useFourthWall } from './useFourthWall.js'
import { readProfile } from './profile.js'
import { readFile } from './saveManager.js'

/** Everything a line may use, for one save file: the page's own details, and the weather if the player allowed it. */
export function deviceDetails(lang, slot) {
  let file = null
  try {
    file = slot == null ? null : readFile(slot)
  } catch {
    file = null
  }
  return gatherDetails({ lang, profile: readProfile(slot), file, weather: currentWeather() })
}

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
  // The weather arrives a moment after the second permission is given; lines pick it up then.
  const [, , weatherSeq] = useWeather(Boolean(state.realm3) && permission === 'yes')
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
      const details = deviceDetails(lang, activeSlot)
      const spoken = arbiterFourthWall({ permission, details, lang, seed, round })
      if (spoken) return { text: spoken, tone: band }
    }
    return { text: arbiterLine({ situation, favor, round, seed })[lang], tone: band }
  }, [realm3, round, seed, favor, arbiterRound, eyeStrikes, activeSlot, situation, permission, lang, weatherSeq])
}
