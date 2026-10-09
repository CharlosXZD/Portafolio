// A feedback message handed from a game to the portfolio's contact form
// (EXPANSION.md T8). The game opens `/?feedback=<text>#contact` in a new tab;
// ContactForm reads the text once, puts it in the message box and clears the
// parameter. Nothing is sent: the visitor edits it and presses Send.
export const FEEDBACK_PARAM = 'feedback'
/** The URL stays well under what browsers accept. */
export const FEEDBACK_MAX = 1500

export function feedbackUrl(text) {
  return `/?${FEEDBACK_PARAM}=${encodeURIComponent(String(text ?? '').slice(0, FEEDBACK_MAX))}#contact`
}

/** Reads the prefill from a search string, or '' when there is none. */
export function parseFeedback(search = '') {
  try {
    return (new URLSearchParams(search).get(FEEDBACK_PARAM) ?? '').slice(0, FEEDBACK_MAX)
  } catch {
    return ''
  }
}

// React may build the form twice in development: the second read still gets the text.
let lastTaken = { text: '', at: 0 }

/** Reads the prefill from the page once and removes the parameter from the address. */
export function takeFeedbackPrefill(win = globalThis.window, now = Date.now()) {
  if (!win?.location) return ''
  const text = parseFeedback(win.location.search)
  if (!text) return now - lastTaken.at < 2000 ? lastTaken.text : ''
  lastTaken = { text, at: now }
  try {
    const params = new URLSearchParams(win.location.search)
    params.delete(FEEDBACK_PARAM)
    const rest = params.toString()
    win.history.replaceState(win.history.state, '', `${win.location.pathname}${rest ? `?${rest}` : ''}${win.location.hash}`)
  } catch {
    // the address stays as it is; the text was still read
  }
  return text
}
