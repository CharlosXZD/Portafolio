import { Component } from 'react'

// Catches a failed lazy chunk (or a crash inside it) and shows `fallback` instead, so a missing
// piece of the overhaul never takes a screen down (VISUALS.md V8.3). `onError` is told once.
export default class LazyBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error) {
    console.warn('A lazy part failed, using the plain version:', error?.message ?? error)
    this.props.onError?.(error)
  }
  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children
  }
}
