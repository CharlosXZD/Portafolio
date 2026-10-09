// Weather and place (EXPANSION.md T7): the one file of the Arbiter's code that
// may use the network, and only after the player said yes to the second,
// separate permission ("weather and place").
//
// What it does, in order, and nothing else:
//   1. asks the browser for the position through the browser's own prompt;
//   2. rounds the coordinates to 0.1 degrees (about 11 km);
//   3. asks the free Open-Meteo weather service (api.open-meteo.com, no key, no
//      account) for the weather at those rounded coordinates;
//   4. keeps the answer in memory for this sitting. The coordinates are never
//      stored, not even in memory, and the answer is never written to storage.
// The city never comes from a lookup or from the address of the connection:
// it is the timezone's name (utils/fourthWall.js).
export const WEATHER_KEY = 'elementa-weather'
export const OPEN_METEO_HOST = 'api.open-meteo.com'

/** 'yes', 'no', or null when the player has not been asked yet. */
export function readWeather(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(WEATHER_KEY)
    return raw === 'yes' || raw === 'no' ? raw : null
  } catch {
    return null
  }
}

export function writeWeather(value, storage = globalThis.localStorage) {
  if (value !== 'yes' && value !== 'no') return false
  try {
    storage.setItem(WEATHER_KEY, value)
    return true
  } catch {
    return false
  }
}

/** Rounds a coordinate to 0.1 degrees. */
export const roundCoordinate = (x) => Math.round(x * 10) / 10

/** The only address this file ever asks for. */
export function weatherUrl(latitude, longitude) {
  const query = new URLSearchParams({
    latitude: String(roundCoordinate(latitude)),
    longitude: String(roundCoordinate(longitude)),
    current: 'temperature_2m,precipitation,wind_speed_10m,cloud_cover,is_day',
    daily: 'sunrise,sunset',
    timezone: 'auto',
    forecast_days: '1',
  })
  return `https://${OPEN_METEO_HOST}/v1/forecast?${query.toString()}`
}

/** What a sitting keeps: a few plain values, never the position. */
function summarize(json, latitude) {
  const c = json?.current
  if (!c || typeof c.temperature_2m !== 'number') return null
  return {
    temperatureC: Math.round(c.temperature_2m),
    rainMm: Number(c.precipitation) || 0,
    windKmh: Math.round(Number(c.wind_speed_10m) || 0),
    cloud: Number(c.cloud_cover) || 0,
    isDay: Boolean(c.is_day),
    sunrise: json.daily?.sunrise?.[0] ?? null,
    sunset: json.daily?.sunset?.[0] ?? null,
    south: latitude < 0,
  }
}

let kept = null
/** The weather kept for this sitting, or null. */
export const currentWeather = () => kept
export const forgetWeather = () => {
  kept = null
}

/**
 * Loads the weather once per sitting. Nothing happens unless `permission` is
 * 'yes'; the position is asked for first, and the request is made only after
 * the browser has answered. `deps` lets a test stand in for the browser.
 */
let pending = null
export function loadWeather(permission, deps = {}) {
  if (permission !== 'yes') return Promise.resolve(null)
  if (kept) return Promise.resolve(kept)
  // One request at a time, so two screens asking together make one prompt and one call.
  pending ??= fetchWeather(deps).finally(() => {
    pending = null
  })
  return pending
}

async function fetchWeather(deps) {
  const geolocation = deps.geolocation ?? globalThis.navigator?.geolocation
  if (!geolocation) return null
  const position = await new Promise((resolve) => {
    try {
      geolocation.getCurrentPosition(
        (p) => resolve(p),
        () => resolve(null),
        { maximumAge: 600000, timeout: 15000 },
      )
    } catch {
      resolve(null)
    }
  })
  if (!position?.coords) return null
  const latitude = roundCoordinate(position.coords.latitude)
  const longitude = roundCoordinate(position.coords.longitude)
  const url = weatherUrl(latitude, longitude)
  if (new URL(url).host !== OPEN_METEO_HOST) return null
  const doFetch = deps.fetch ?? globalThis.fetch
  try {
    const response = await doFetch(url)
    if (!response?.ok) return null
    kept = summarize(await response.json(), latitude)
  } catch {
    kept = null
  }
  return kept
}
