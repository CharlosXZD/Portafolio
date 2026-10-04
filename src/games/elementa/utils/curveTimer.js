// The Closed Timelike Curve's clock (EXPANSION.md N5): Mult x2 if you cast
// within CURVE_SECONDS of the round starting. The seconds only run while the
// table is live (the same rule as the Clockwork); the UI ticks it and tells
// the reducer (`CTC_EXPIRE`) when it runs out. Pure, so a fake clock can test it.
export const CURVE_SECONDS = 20

/** The seconds left after `dt` more seconds of live table. */
export const tickCurve = (left, dt) => Math.max(0, left - dt)

/** Whether the x2 window is still open. */
export const curveOpen = (left) => left > 0
