// Tiny procedural audio engine: no audio assets, just short synthesized
// tones and a generated loop via the Web Audio API. Sound effects are kept
// deliberately sparse (per the "utility" rule, only meaningful moments get
// feedback); music is a separate, always-on-unless-muted loop whose theme
// follows the screen, shop, or boss.
import { getSfxVolume, getMusicVolume, getMusicEnabled } from './settings.js'
import { MUSIC_THEMES, SCALES } from '../data/musicThemes.js'

let audioCtx = null

function getCtx() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return null
    audioCtx = new AudioContextClass()
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

function tone(freq, duration, { type = 'sine', gain = 0.06, delay = 0, glideTo } = {}) {
  const volume = getSfxVolume()
  if (volume <= 0) return
  const ctx = getCtx()
  if (!ctx) return
  try {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    const start = ctx.currentTime + delay

    osc.type = type
    osc.frequency.setValueAtTime(freq, start)
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, start + duration)

    g.gain.setValueAtTime(gain * volume, start)
    g.gain.exponentialRampToValueAtTime(0.001, start + duration)

    osc.connect(g)
    g.connect(ctx.destination)
    osc.start(start)
    osc.stop(start + duration + 0.02)
  } catch {
    // audio unavailable (unsupported browser, blocked autoplay), so fail silently
  }
}

export function playClick() {
  tone(700, 0.04, { type: 'square', gain: 0.03 })
}

export function playLock() {
  tone(650, 0.08, { gain: 0.05, glideTo: 950 })
}

// Distinct from playLock: a higher, glassier, descending chime, since freeze
// is a universal relic effect rather than the die's own element locking in.
export function playFreeze() {
  tone(1400, 0.05, { type: 'triangle', gain: 0.04 })
  tone(1100, 0.12, { type: 'triangle', gain: 0.04, delay: 0.05, glideTo: 850 })
}

export function playRoll() {
  tone(300, 0.03, { gain: 0.03 })
  tone(340, 0.03, { gain: 0.03, delay: 0.05 })
  tone(380, 0.03, { gain: 0.03, delay: 0.1 })
}

// A soft landing tick per die (EXPANSION.md P3), lower and heavier the more
// sides it has: a d3 taps, a d20 thuds.
export function playLand(sides = 6) {
  const heavy = Math.min(1, Math.max(0, (sides - 3) / 17))
  tone(900 - heavy * 620, 0.05 + heavy * 0.05, { type: 'triangle', gain: 0.025 + heavy * 0.02, glideTo: 520 - heavy * 340 })
}

// A short boom per explosion, rising in pitch along the chain (P11).
export function playBoom(step = 1) {
  const up = Math.min(8, step - 1)
  tone(150 + up * 38, 0.2, { type: 'sawtooth', gain: 0.05, glideTo: 55 + up * 8 })
  tone(420 + up * 70, 0.07, { type: 'square', gain: 0.02 })
}

// A breath of wind for Drift (P12).
export function playGust() {
  tone(520, 0.14, { type: 'sine', gain: 0.025, glideTo: 880 })
}

// A chain closing and a lock clicking shut (P12).
export function playClank() {
  tone(260, 0.05, { type: 'square', gain: 0.035, glideTo: 180 })
  tone(980, 0.04, { type: 'triangle', gain: 0.035, delay: 0.07 })
}

export function playSuccess() {
  tone(523.25, 0.12, { gain: 0.05 })
  tone(659.25, 0.12, { gain: 0.05, delay: 0.1 })
  tone(783.99, 0.2, { gain: 0.06, delay: 0.2 })
}

export function playFail() {
  tone(180, 0.35, { type: 'sawtooth', gain: 0.05, glideTo: 80 })
}

export function playLifeLost() {
  tone(110, 0.25, { type: 'square', gain: 0.07, glideTo: 60 })
}

export function playBossRound() {
  tone(130, 0.18, { type: 'sawtooth', gain: 0.05 })
  tone(98, 0.3, { type: 'sawtooth', gain: 0.06, delay: 0.15 })
}

export function playCoin() {
  tone(988, 0.06, { gain: 0.05 })
  tone(1319, 0.09, { gain: 0.05, delay: 0.06 })
}

// --- Music: a small step sequencer playing the themes in
// data/musicThemes.js (one per screen, shop and boss), no audio files.
// Runs on its own persistent GainNode so the volume slider can be dragged
// live without restarting, and schedules a little ahead of
// `audioCtx.currentTime` (a standard Web Audio pattern) rather than relying
// on setInterval, which drifts under tab throttling. Changing theme
// crossfades: the old theme's notes fade on their own gain node while the
// new one fades in.
const LOOKAHEAD = 0.4
const TICK_MS = 100
const WAVE_LEVEL = { sine: 1, triangle: 0.9, square: 0.28, sawtooth: 0.3 }

let musicGain = null
let musicSchedulerId = null
let currentThemeId = 'menu'
let player = null
let noiseBuffer = null

function parsePattern(pattern) {
  if (!pattern) return []
  const tokens = pattern.trim().split(/\s+/)
  return tokens.map((tok, i) => {
    if (tok === '.' || tok === '-') return null
    const deg = Number(tok)
    if (Number.isNaN(deg)) return { hit: tok }
    let len = 1
    while (tokens[(i + len) % tokens.length] === '-' && len < tokens.length) len++
    return { deg, len }
  })
}

function degreeToSemis(deg, scale) {
  const n = scale.length
  const oct = Math.floor(deg / n)
  return oct * 12 + scale[((deg % n) + n) % n]
}

const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12)

function compileTheme(id) {
  const theme = MUSIC_THEMES[id] ?? MUSIC_THEMES.menu
  return {
    id,
    theme,
    scale: SCALES[theme.scale] ?? SCALES.minor,
    lead: parsePattern(theme.lead),
    bass: parsePattern(theme.bass),
    perc: parsePattern(theme.perc),
  }
}

function getNoise(ctx) {
  if (noiseBuffer) return noiseBuffer
  noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const data = noiseBuffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return noiseBuffer
}

function note(ctx, out, { freq, time, dur, wave = 'sine', level = 0.1, attack = 0.01, glide = 0 }) {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = wave
  osc.frequency.setValueAtTime(freq, time)
  if (glide) osc.frequency.exponentialRampToValueAtTime(freq * Math.pow(2, glide / 12), time + dur)
  const peak = level * (WAVE_LEVEL[wave] ?? 1)
  g.gain.setValueAtTime(0.0001, time)
  g.gain.linearRampToValueAtTime(peak, time + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(attack + 0.02, dur))
  osc.connect(g)
  g.connect(out)
  osc.start(time)
  osc.stop(time + dur + 0.05)
}

function noiseHit(ctx, out, time, { type, freq, dur, level }) {
  const src = ctx.createBufferSource()
  src.buffer = getNoise(ctx)
  const filter = ctx.createBiquadFilter()
  filter.type = type
  filter.frequency.setValueAtTime(freq, time)
  const g = ctx.createGain()
  g.gain.setValueAtTime(level, time)
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur)
  src.connect(filter)
  filter.connect(g)
  g.connect(out)
  src.start(time)
  src.stop(time + dur + 0.02)
}

function drum(ctx, out, hit, time) {
  switch (hit) {
    case 'k':
      note(ctx, out, { freq: 150, time, dur: 0.14, level: 0.35, attack: 0.003, glide: -24 })
      break
    case 's':
      noiseHit(ctx, out, time, { type: 'bandpass', freq: 1800, dur: 0.12, level: 0.14 })
      break
    case 'h':
      noiseHit(ctx, out, time, { type: 'highpass', freq: 7000, dur: 0.035, level: 0.06 })
      break
    case 't':
      note(ctx, out, { freq: 2200, time, dur: 0.025, wave: 'square', level: 0.1, attack: 0.002 })
      break
    case 'a':
      note(ctx, out, { freq: 1250, time, dur: 0.35, wave: 'triangle', level: 0.07, attack: 0.002 })
      note(ctx, out, { freq: 1870, time, dur: 0.22, wave: 'square', level: 0.1, attack: 0.002 })
      noiseHit(ctx, out, time, { type: 'highpass', freq: 3000, dur: 0.04, level: 0.08 })
      break
    case 'b':
      note(ctx, out, { freq: 1760, time, dur: 1.2, level: 0.05, attack: 0.004 })
      note(ctx, out, { freq: 2640, time, dur: 0.6, level: 0.02, attack: 0.004 })
      break
    case 'p':
      note(ctx, out, { freq: 420, time, dur: 0.09, level: 0.06, attack: 0.004, glide: 19 })
      break
    case 'z':
      note(ctx, out, { freq: 72, time, dur: 0.9, wave: 'sawtooth', level: 0.12, attack: 0.3, glide: -4 })
      break
    default:
  }
}

function scheduleStep(ctx, p, time) {
  const { theme, scale } = p
  const step = theme.step
  const voices = theme.voices ?? {}
  const at = (list) => (list.length ? list[p.step % list.length] : null)

  const lead = at(p.lead)
  if (lead?.deg != null) {
    const midi = theme.root + 24 + 12 * (theme.leadOctave || 0) + degreeToSemis(lead.deg, scale)
    note(ctx, p.out, {
      freq: midiToFreq(midi),
      time,
      dur: lead.len * step * 0.92,
      wave: voices.lead ?? 'sine',
      level: 0.1,
      glide: theme.leadGlide || 0,
    })
  }
  const bass = at(p.bass)
  if (bass?.deg != null) {
    note(ctx, p.out, {
      freq: midiToFreq(theme.root + degreeToSemis(bass.deg, scale)),
      time,
      dur: bass.len * step * 0.95,
      wave: voices.bass ?? 'triangle',
      level: 0.18,
      attack: 0.03,
    })
  }
  const hit = at(p.perc)
  if (hit?.hit) drum(ctx, p.out, hit.hit, time)

  // Pads: one chord per bar (16 steps), cycling through the list.
  if (theme.pad && p.step % 16 === 0) {
    const chord = theme.pad[Math.floor(p.step / 16) % theme.pad.length]
    chord.forEach((deg) =>
      note(ctx, p.out, {
        freq: midiToFreq(theme.root + 12 + degreeToSemis(deg, scale)),
        time,
        dur: 16 * step,
        wave: voices.pad ?? 'sine',
        level: 0.045,
        attack: 0.4,
      }),
    )
  }
}

function musicTick() {
  const ctx = getCtx()
  if (!ctx || !musicGain || !player) return
  while (player.nextTime < ctx.currentTime + LOOKAHEAD) {
    const { theme } = player
    const swing = theme.swing && player.step % 2 === 1 ? theme.swing * theme.step : 0
    scheduleStep(ctx, player, Math.max(player.nextTime + swing, ctx.currentTime))
    player.nextTime += theme.step
    player.step++
  }
  musicSchedulerId = window.setTimeout(musicTick, TICK_MS)
}

function fadeOut(ctx, p, seconds = 0.8) {
  if (!p) return
  const g = p.out.gain
  g.cancelScheduledValues(ctx.currentTime)
  g.setValueAtTime(g.value, ctx.currentTime)
  g.linearRampToValueAtTime(0.0001, ctx.currentTime + seconds)
  window.setTimeout(() => p.out.disconnect(), (seconds + 2.5) * 1000)
}

function startPlayer(ctx, themeId) {
  const compiled = compileTheme(themeId)
  const out = ctx.createGain()
  out.gain.setValueAtTime(0.0001, ctx.currentTime)
  out.gain.linearRampToValueAtTime(compiled.theme.gain ?? 1, ctx.currentTime + 0.6)
  out.connect(musicGain)
  player = { ...compiled, out, step: 0, nextTime: ctx.currentTime + 0.05 }
}

export function isMusicPlaying() {
  return musicSchedulerId != null
}

export function startMusic() {
  if (isMusicPlaying()) return
  if (!getMusicEnabled()) return
  const ctx = getCtx()
  if (!ctx) return
  if (!musicGain) {
    musicGain = ctx.createGain()
    musicGain.connect(ctx.destination)
  }
  musicGain.gain.setValueAtTime(getMusicVolume(), ctx.currentTime)
  startPlayer(ctx, currentThemeId)
  musicTick()
}

/** Switches the loop to another theme (data/musicThemes.js), crossfading. */
export function setMusicTheme(themeId) {
  if (themeId === currentThemeId) return
  currentThemeId = themeId
  if (!isMusicPlaying()) return
  const ctx = getCtx()
  if (!ctx) return
  fadeOut(ctx, player)
  startPlayer(ctx, themeId)
}

export function stopMusic() {
  if (musicSchedulerId != null) {
    window.clearTimeout(musicSchedulerId)
    musicSchedulerId = null
  }
  if (audioCtx && player) fadeOut(audioCtx, player, 0.3)
  player = null
}

// Called whenever the volume slider moves, so the loop doesn't need to
// restart to reflect a new level.
export function refreshMusicVolume() {
  if (!musicGain || !audioCtx) return
  musicGain.gain.setTargetAtTime(getMusicVolume(), audioCtx.currentTime, 0.05)
}

// Toggling the music setting on should also start playback immediately
// (given a live AudioContext, i.e. after some user gesture); toggling it
// off should stop the loop rather than just silence it via volume.
export function applyMusicEnabled(enabled) {
  if (enabled) startMusic()
  else stopMusic()
}
