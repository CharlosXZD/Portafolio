import { useCallback, useEffect, useState } from 'react'
import { readWeather, writeWeather, loadWeather, forgetWeather } from './weather.js'

const EVENT = 'elementa-weather-change'

/**
 * The second permission (T7): weather and place. 'yes', 'no' or null (not asked).
 * `active` is true only while the Arbiter is on screen and the device-details
 * permission is yes; the weather is asked for then, once per sitting, never
 * before. The third value changes when the weather arrives, so lines can use it.
 */
export function useWeather(active) {
  const [permission, setPermission] = useState(() => readWeather())
  const [arrived, setArrived] = useState(0)
  useEffect(() => {
    const sync = () => setPermission(readWeather())
    window.addEventListener(EVENT, sync)
    return () => window.removeEventListener(EVENT, sync)
  }, [])
  useEffect(() => {
    if (permission === 'yes' && active) {
      let live = true
      loadWeather('yes').then((w) => live && w && setArrived((n) => n + 1))
      return () => {
        live = false
      }
    }
    if (permission !== 'yes') forgetWeather()
    return undefined
  }, [permission, active])
  const choose = useCallback((value) => {
    writeWeather(value)
    setPermission(value)
    window.dispatchEvent(new Event(EVENT))
  }, [])
  return [permission, choose, arrived]
}
