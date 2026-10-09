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
  bazaar: { label: L('Aether Bazaar', 'Bazar del Éter'), keeper: 'conclave', shop: 'bazaar' },
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
}

export const ROOM_IDS = Object.keys(ROOM_LOADERS)
export const REALMS = ['elementa', 'firmament', 'empyrean', 'pleroma', 'meridian']
