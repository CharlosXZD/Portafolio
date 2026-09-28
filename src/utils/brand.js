// Soft wash of a project's brand color, used behind logo tiles and media
export function brandWash(color) {
  return `radial-gradient(60% 70% at 50% 55%, ${color}40, ${color}0d 70%, transparent)`
}
