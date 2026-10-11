// The timeline of a story scene (VISUALS.md V5), as pure functions of the scene's
// data. One composition plays a whole scene; each page owns a slot of frames:
//
//   start .. start + INTRO         the shot comes in (a short fade and settle)
//   .. typeEnd                     the lines type in
//   .. end (HOLD frames later)     the page waits for a press, looping seamlessly
//
// The player never runs past a page by itself: when it reaches `end` it jumps
// back to `typeEnd`, which looks the same because everything that moves while a
// page waits has a period of LOOP frames (HOLD is a whole number of loops).
// A press moves to the next page's `start`, or finishes typing first.

export const FPS = 30
export const W = 960
export const H = 540
export const INTRO = 20
export const LOOP = 60
export const HOLD = LOOP * 10
const RATE = 70 // characters per second, like the old StoryScene

/** The most characters a page types in either language, so the timeline does not depend on the language. */
function pageChars(page) {
  const total = (lang) => page.lines.reduce((n, line) => n + (line[lang] ?? line.en).length, 0)
  return Math.max(total('en'), total('es'))
}

/** Frame slots for every page of a scene. `still` scenes (the ending cards) type nothing and spend their settle on a slow push. */
export function layoutScene(scene) {
  let at = 0
  const pages = scene.pages.map((page) => {
    // A still has nothing to type: its settle is the slow push (4 seconds).
    const typing = scene.still ? 120 : Math.max(24, Math.ceil((pageChars(page) / RATE) * FPS))
    const start = at
    const typeEnd = start + INTRO + typing
    const end = typeEnd + HOLD
    at = end
    return { start, typeEnd, end }
  })
  return { pages, total: at }
}

/** Which page a frame belongs to. */
export function pageAt(layout, frame) {
  const i = layout.pages.findIndex((p) => frame < p.end)
  return i === -1 ? layout.pages.length - 1 : i
}

/** The time a page's motion runs on: the real frame while it settles, then a seamless loop. */
export function pageTime(slot, frame) {
  const local = frame - slot.start
  const settle = slot.typeEnd - slot.start
  return local <= settle ? local : settle + ((local - settle) % LOOP)
}

/** How many characters of a page are typed in at a frame (Infinity when the page is a still). */
export function typedAt(slot, frame, still = false) {
  if (still) return Infinity
  return Math.max(0, Math.floor(((frame - slot.start - INTRO) * RATE) / FPS))
}

/** Three frames worth looking at for a scene (the contact sheet): the first page mid-typing, a middle page held, the last page held. */
export function sampleFrames(layout) {
  const n = layout.pages.length
  const first = layout.pages[0]
  const mid = layout.pages[Math.floor((n - 1) / 2)]
  const last = layout.pages[n - 1]
  return [
    Math.round(first.start + INTRO + (first.typeEnd - first.start - INTRO) / 2),
    mid.typeEnd,
    n === 1 ? last.typeEnd + LOOP / 2 : last.typeEnd,
  ]
}
