import { Component } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'

// Catches a crash anywhere in the game so the page never goes blank. The
// run is autosaved (utils/saveManager.js), so reloading loses nothing but the
// current screen. "Try again" re-renders in place; "Reload" starts the page over.
function Fallback({ error, onRetry }) {
  const { lang } = useLanguage()
  const es = lang === 'es'
  return (
    <div className="elementa-root relative flex min-h-screen w-full items-center justify-center p-6">
      <div className="el-panel flex max-w-lg flex-col gap-4 p-6">
        <h2 className="pixel-heading text-sm text-[var(--gold-1)]">{es ? 'Algo se rompió' : 'Something broke'}</h2>
        <p className="text-base leading-snug text-[var(--text)]">
          {es
            ? 'El juego tuvo un error. Tu partida se guarda sola, así que no pierdes tu progreso. Prueba de nuevo o recarga la página.'
            : 'The game hit an error. Your run saves itself, so your progress is safe. Try again, or reload the page.'}
        </p>
        <pre className="max-h-40 overflow-auto rounded-sm bg-[var(--stone-0)] p-3 text-sm text-[var(--text-dim)]">
          {String(error?.message ?? error)}
        </pre>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="el-btn el-btn--gold" onClick={onRetry}>
            {es ? 'Intentar de nuevo' : 'Try again'}
          </button>
          <button type="button" className="el-btn" onClick={() => window.location.reload()}>
            {es ? 'Recargar' : 'Reload'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Elementa crashed:', error, info?.componentStack)
  }

  render() {
    if (this.state.error) return <Fallback error={this.state.error} onRetry={() => this.setState({ error: null })} />
    return this.props.children
  }
}
