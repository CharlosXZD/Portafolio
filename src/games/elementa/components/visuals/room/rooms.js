// The room registry (VISUALS.md V3.1). Each room is its own lazy chunk, loaded
// only when its shop or scene is entered, never in the main bundle. A room
// module's default export is a tiny component that hands its data to the
// stage (so React.lazy can load it): see rooms/market.jsx.
export const ROOM_LOADERS = {
  market: () => import('./rooms/market.jsx'),
  forge: () => import('./rooms/forge.jsx'),
  alchemist: () => import('./rooms/alchemist.jsx'),
  vault: () => import('./rooms/vault.jsx'),
  blackmarket: () => import('./rooms/blackmarket.jsx'),
  shrine: () => import('./rooms/shrine.jsx'),
  bazaar: () => import('./rooms/bazaar.jsx'),
  astral: () => import('./rooms/astral.jsx'),
  cartography: () => import('./rooms/cartography.jsx'),
  clockwork: () => import('./rooms/clockwork.jsx'),
  observatory: () => import('./rooms/observatory.jsx'),
  pantry: () => import('./rooms/pantry.jsx'),
  camp: () => import('./rooms/camp.jsx'),
  crossroads: () => import('./rooms/crossroads.jsx'),
  boss: () => import('./rooms/boss.jsx'),
  table: () => import('./rooms/table.jsx'),
  unwritten: () => import('./rooms/unwritten.jsx'),
  tavern: () => import('./rooms/tavern.jsx'),
}

const L = (en, es) => ({ en, es })

/** What each room is, for the Lab and for tests. `shop` is the SHOP_TYPES id it backs. */
export const ROOM_INFO = {
  market: { label: L('Market', 'Mercado'), keeper: 'tobb', shop: 'market' },
  forge: { label: L('Forge', 'Forja'), keeper: 'brasa', shop: 'forge' },
  alchemist: { label: L('Alchemist', 'Alquimista'), keeper: 'vessa', shop: 'alchemist' },
  vault: { label: L('Relic Vault', 'Bóveda de Reliquias'), keeper: 'curator', shop: 'vault' },
  blackmarket: { label: L('Black Market', 'Mercado Negro'), keeper: 'nix', shop: 'blackmarket' },
  shrine: { label: L('Shrine', 'Santuario'), keeper: 'aeris', shop: 'shrine' },
  bazaar: { label: L('Aether Bazaar', 'Bazar del Ether'), keeper: 'conclave', shop: 'bazaar' },
  astral: { label: L('Astral Exchange', 'Intercambio Astral'), keeper: 'conclave', shop: 'astral' },
  cartography: { label: L('Cartography', 'Cartografía'), keeper: 'atlas', shop: 'cartography' },
  clockwork: { label: L('Clockwork', 'Mecanismo'), keeper: 'horologist', shop: 'clockwork' },
  observatory: { label: L('Observatory', 'Observatorio'), keeper: 'seren', shop: 'observatory' },
  pantry: { label: L('Pantry', 'Despensa'), keeper: 'mote', shop: 'pantry' },
  camp: { label: L('Camp', 'Campamento'), keeper: 'tobb', shop: 'camp' },
  crossroads: { label: L('The Crossroads', 'La Encrucijada'), keeper: null },
  boss: { label: L('Boss stage', 'Escenario de jefe'), keeper: null },
  table: { label: L('The table', 'La mesa'), keeper: null },
  unwritten: { label: L('The Unwritten', 'Lo No Escrito'), keeper: null },
  tavern: { label: L('The Tavern (menus)', 'La Taberna (menús)'), keeper: null },
}

export const ROOM_IDS = Object.keys(ROOM_LOADERS)
export const REALMS = ['elementa', 'firmament', 'empyrean', 'pleroma', 'meridian']

/**
 * What the room is made of beyond its 320 by 180 picture (VISUALS.md V4 fixes): the wall, ceiling and
 * floor colors, so the stage can be drawn smaller ("the camera pulled back") and the wall and floor
 * simply carry on at the same height on both sides. The picture fades into them at its edges.
 */
export const ROOM_GROUND = {
  market: { wall: '#2e1c26', ceil: '#1c1018', floor: '#3b2215' },
  forge: { wall: '#3a2c34', ceil: '#1d1218', floor: '#2a1c20' },
  alchemist: { wall: '#1e2a2a', ceil: '#101a1a', floor: '#1b2420' },
  vault: { wall: '#2c2a44', ceil: '#16142a', floor: '#26233a' },
  blackmarket: { wall: '#17142a', ceil: '#0b0916', floor: '#110f20' },
  shrine: { wall: '#3a4a6a', ceil: '#202c48', floor: '#33425e' },
  bazaar: { wall: '#2a1f4a', ceil: '#150f2c', floor: '#2a2048' },
  astral: { wall: '#140e32', ceil: '#0a0820', floor: '#1a1236' },
  cartography: { wall: '#2a2a30', ceil: '#1c2a36', floor: '#26262e' },
  clockwork: { wall: '#2a2218', ceil: '#1c160e', floor: '#241d12' },
  observatory: { wall: '#121c44', ceil: '#0b1230', floor: '#1a2248' },
  pantry: { wall: '#1a1624', ceil: '#100c18', floor: '#161220' },
  camp: { wall: '#161230', ceil: '#0c0a1c', floor: '#1c1626' },
  tavern: { wall: '#2e1c26', ceil: '#1c1018', floor: '#3b2215' },
}
