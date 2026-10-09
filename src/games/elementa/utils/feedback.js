import { feedbackUrl } from '../../../utils/feedback.js'
import { LATEST_VERSION } from '../data/patchNotes.js'

// "Send feedback" (EXPANSION.md T8): opens the portfolio's contact form in a
// new tab with a drafted message. The run in this tab is untouched and nothing
// is sent: the visitor edits the text and presses Send themselves.

// The latest look at the run, kept in memory only (set by ElementaGame), so
// the Options screen and the error screen can mention it.
let context = null
export function setFeedbackContext(state) {
  context = state
    ? { round: state.round, realm: state.realm3 ? 'realm 3' : state.realm ?? 'elementa', difficulty: state.difficulty?.id, deckId: state.deckId, seed: state.seed }
    : null
}

const TEXT = {
  en: { intro: 'Feedback on Elementa. What happened, and what did you expect?', version: 'Version', round: 'Round', realm: 'Realm', difficulty: 'Difficulty', loadout: 'Loadout', seed: 'Seed', error: 'Error' },
  es: { intro: 'Comentarios sobre Elementa. ¿Qué pasó, y qué esperabas?', version: 'Versión', round: 'Ronda', realm: 'Reino', difficulty: 'Dificultad', loadout: 'Equipo inicial', seed: 'Semilla', error: 'Error' },
}

/** The drafted message: a short template, then lines of context. */
export function feedbackMessage(lang = 'en', ctx = context, error = null) {
  const x = TEXT[lang] ?? TEXT.en
  const lines = [x.intro, '', '', '---', `${x.version}: ${LATEST_VERSION}`]
  if (ctx) {
    lines.push(`${x.round}: ${ctx.round}`, `${x.realm}: ${ctx.realm}`)
    if (ctx.difficulty) lines.push(`${x.difficulty}: ${ctx.difficulty}`)
    if (ctx.deckId) lines.push(`${x.loadout}: ${ctx.deckId}`)
    if (ctx.seed) lines.push(`${x.seed}: ${ctx.seed}`)
  }
  if (error) lines.push(`${x.error}: ${String(error?.message ?? error).slice(0, 400)}`)
  return lines.join('\n')
}

export const feedbackLink = (lang, error = null, ctx = context) => feedbackUrl(feedbackMessage(lang, ctx, error))

/** Opens the form in a new tab. */
export function openFeedback(lang, error = null) {
  window.open(feedbackLink(lang, error), '_blank', 'noopener')
}
