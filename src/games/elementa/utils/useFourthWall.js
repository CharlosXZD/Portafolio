import { useCallback, useEffect, useState } from 'react'
import { readFourthWall, writeFourthWall, startSessionTracking, probeBattery } from './fourthWall.js'

const EVENT = 'elementa-fourthwall-change'

/**
 * The player's answer about the Arbiter noticing details (Part S): 'yes',
 * 'no' or null (not asked yet). Shared by every component through a window
 * event, so the Options toggle and the first-appearance prompt agree.
 */
export function useFourthWall() {
  const [permission, setPermission] = useState(() => readFourthWall())
  useEffect(() => {
    const sync = () => setPermission(readFourthWall())
    window.addEventListener(EVENT, sync)
    return () => window.removeEventListener(EVENT, sync)
  }, [])
  // The sitting is only counted once the player said yes.
  useEffect(() => {
    if (permission !== 'yes') return undefined
    probeBattery()
    return startSessionTracking()
  }, [permission])
  const choose = useCallback((value) => {
    writeFourthWall(value)
    // Storage may be blocked: the answer still holds for this sitting.
    setPermission(value)
    window.dispatchEvent(new Event(EVENT))
  }, [])
  return [permission, choose]
}
