// Achievements (GDD §26), tracked per save file. `sprite` reuses the item
// art (data/sprites.js) as a placeholder badge. Secret achievements show
// as "???" in the list until unlocked, and don't count toward completion.
export const ACHIEVEMENTS = [
  { id: 'first_clear', name: 'First Spark', description: 'Clear your first round.', sprite: ['flame', '#ffd166'] },
  { id: 'first_win', name: 'Keeper of the Circle', description: 'Win a run.', sprite: ['crown', '#ffd166', '#e5533d', '#3d8fe5'] },
  { id: 'all_loadouts', name: 'Every Path', description: 'Win with all 8 loadouts.', sprite: ['book', '#8f6bff', '#ffd166'] },
  { id: 'cataclysm', name: 'Through the Fire', description: 'Win a run on Cataclysm.', sprite: ['flame', '#7c3aed', '#ff5a5a'] },
  { id: 'cast_1000', name: 'Big Cast', description: 'Score 1,000 in a single cast.', sprite: ['bolt', '#f2c94c'] },
  { id: 'cast_10000', name: 'Colossal Cast', description: 'Score 10,000 in a single cast.', sprite: ['bolt', '#ff7ad9'] },
  { id: 'overkill', name: 'Overkill', description: 'Clear a round at 5x the target.', sprite: ['heart', '#e5533d'] },
  { id: 'chain_reaction', name: 'Chain Reaction', description: 'Trigger 5 reactions in one cast.', sprite: ['ring', '#ff8a3d'] },
  { id: 'secret_one', name: 'Hidden Chemistry', description: 'Discover a secret reaction.', sprite: ['flask', '#c79bff'] },
  { id: 'secret_all', name: 'Master Alchemist', description: 'Discover every secret reaction.', sprite: ['crucible', '#6a6070', '#ff7ad9', '#9fe8e0'] },
  { id: 'aether', name: 'Quintessence', description: 'Own an Aether die.', sprite: ['orb', '#f2f2f2'] },
  { id: 'full_relics', name: 'Collector', description: 'Fill every relic slot.', sprite: ['chest', '#8a5a34', '#ffd166'] },
  { id: 'rich', name: "Dragon's Hoard", description: 'Hold 100 Shards at once.', sprite: ['coin', '#ffd166'] },
  { id: 'one_shot', name: 'One Shot', description: 'Beat a boss round without rerolling.', sprite: ['die', '#efe6d8'] },
  { id: 'endless_20', name: 'Beyond the Circle', description: 'Reach round 20 in Endless mode.', sprite: ['ring', '#7ae0c8'] },
  { id: 'ermal', name: 'Thanks, Ermal', description: 'Face Ermal the Unbothered.', sprite: ['clover', '#5fd38a'] },
  { id: 'bestiary', name: 'Bestiary', description: 'Face every boss.', sprite: ['scroll', '#ff5a5a', '#8a2a32'] },
  { id: 'archivist', name: 'Archivist', description: 'Discover every die, relic, and consumable.', sprite: ['book', '#3d8fe5', '#ffd166'] },
  {
    id: 'trinity',
    name: 'Trinity',
    description: 'Complete all three save files to 100%.',
    secret: true,
    sprite: ['gem', '#ffd166'],
  },
]

export const ACHIEVEMENTS_ES = {
  first_clear: { name: 'Primera Chispa', description: 'Supera tu primera ronda.' },
  first_win: { name: 'Guardián del Círculo', description: 'Gana una partida.' },
  all_loadouts: { name: 'Todos los Caminos', description: 'Gana con los 8 equipos iniciales.' },
  cataclysm: { name: 'A Través del Fuego', description: 'Gana una partida en Cataclismo.' },
  cast_1000: { name: 'Gran Hechizo', description: 'Anota 1,000 en un solo lanzamiento.' },
  cast_10000: { name: 'Hechizo Colosal', description: 'Anota 10,000 en un solo lanzamiento.' },
  overkill: { name: 'Exceso', description: 'Supera una ronda con 5 veces el objetivo.' },
  chain_reaction: { name: 'Reacción en Cadena', description: 'Activa 5 reacciones en un lanzamiento.' },
  secret_one: { name: 'Química Oculta', description: 'Descubre una reacción secreta.' },
  secret_all: { name: 'Maestro Alquimista', description: 'Descubre todas las reacciones secretas.' },
  aether: { name: 'Quintaesencia', description: 'Ten un dado de Éter.' },
  full_relics: { name: 'Coleccionista', description: 'Llena todos los espacios de reliquias.' },
  rich: { name: 'Tesoro de Dragón', description: 'Ten 100 Fragmentos a la vez.' },
  one_shot: { name: 'Un Solo Tiro', description: 'Vence una ronda de jefe sin relanzar.' },
  endless_20: { name: 'Más Allá del Círculo', description: 'Llega a la ronda 20 en modo Infinito.' },
  ermal: { name: 'Gracias, Ermal', description: 'Enfrenta a Ermal el Imperturbable.' },
  bestiary: { name: 'Bestiario', description: 'Enfrenta a todos los jefes.' },
  archivist: { name: 'Archivista', description: 'Descubre todos los dados, reliquias y consumibles.' },
  trinity: { name: 'Trinidad', description: 'Completa los tres archivos de guardado al 100%.' },
}

export function localizeAchievement(a, lang) {
  if (lang !== 'es' || !ACHIEVEMENTS_ES[a.id]) return a
  return { ...a, ...ACHIEVEMENTS_ES[a.id] }
}
