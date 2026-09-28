// Tiny procedural audio engine: no audio assets, just short synthesized
// tones and a generated loop via the Web Audio API. Sound effects are kept
// deliberately sparse (per the "utility" rule, only meaningful moments get
// feedback); music is a separate, always-on-unless-muted ambient loop.
import { getSfxVolume, getMusicVolume, getMusicEnabled } from './settings.js'

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

// --- Music: a generated, looping minor-pentatonic arpeggio + bassline, no
// audio files. Runs on its own persistent GainNode so the volume slider
// can be dragged live without restarting the loop, and schedules itself a
// little ahead of `audioCtx.currentTime` (a standard Web Audio pattern)
// rather than relying on setInterval, which drifts under tab throttling.
const BAR_SECONDS = 1.8
const BASS_NOTES = [98.0, 98.0, 123.47, 110.0] // G2, G2, B2, A2: a simple 4-bar loop
const ARP_NOTES = [392.0, 466.16, 587.33, 466.16] // G4, Bb4, D5, Bb4

let musicGain = null
let musicSchedulerId = null
let nextBarTime = 0
let barIndex = 0

function scheduleBar(ctx, time) {
  const bass = BASS_NOTES[barIndex % BASS_NOTES.length]
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(bass, time)
  g.gain.setValueAtTime(0.0001, time)
  g.gain.linearRampToValueAtTime(0.22, time + 0.05)
  g.gain.exponentialRampToValueAtTime(0.0001, time + BAR_SECONDS * 0.9)
  osc.connect(g)
  g.connect(musicGain)
  osc.start(time)
  osc.stop(time + BAR_SECONDS)

  const arpStep = BAR_SECONDS / 4
  for (let i = 0; i < 4; i++) {
    const noteTime = time + i * arpStep
    const freq = ARP_NOTES[(barIndex + i) % ARP_NOTES.length]
    const aOsc = ctx.createOscillator()
    const aGain = ctx.createGain()
    aOsc.type = 'sine'
    aOsc.frequency.setValueAtTime(freq, noteTime)
    aGain.gain.setValueAtTime(0.0001, noteTime)
    aGain.gain.linearRampToValueAtTime(0.1, noteTime + 0.02)
    aGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + arpStep * 0.85)
    aOsc.connect(aGain)
    aGain.connect(musicGain)
    aOsc.start(noteTime)
    aOsc.stop(noteTime + arpStep)
  }

  barIndex++
}

function musicTick() {
  const ctx = getCtx()
  if (!ctx || !musicGain) return
  while (nextBarTime < ctx.currentTime + 1) {
    scheduleBar(ctx, Math.max(nextBarTime, ctx.currentTime))
    nextBarTime += BAR_SECONDS
  }
  musicSchedulerId = window.setTimeout(musicTick, 250)
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
  nextBarTime = ctx.currentTime
  barIndex = 0
  musicTick()
}

export function stopMusic() {
  if (musicSchedulerId != null) {
    window.clearTimeout(musicSchedulerId)
    musicSchedulerId = null
  }
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
