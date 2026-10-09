// Shape data for the layered keeper rigs, generated from the shipping 14x14 sprites in
// components/KeeperSprite.jsx so a rigged keeper looks identical to the sprite at rest.
// Characters: k outline, h headpiece, c accent, a face, b shade, w eye white, e pupil, d detail, . empty.
// `quirk` names a small extra motion for that keeper (flame, halo, horns).
export const RIG_KEEPERS = {
  tobb: {
    head: ['.......cc.....','....kkkckk....','...khhhhhhk...','.kkhhhhhhhhkk.','khhhhhhhhhhhhk'],
    mouth: '..kaddddddaak.',
    palette: {k: '#120c1a',h: '#8a5a34',c: '#e5533d',a: '#8fcf6a',b: '#5a9a45',w: '#ffffff',e: '#120c1a',d: '#5a3a22'},
  },
  vessa: {
    head: ['..............','.....kkkk.....','...kkhhhhkk...','..kcckhhkcck..','..kcckkkkcck..'],
    mouth: '..kaaadaaaaak.',
    palette: {k: '#120c1a',h: '#2f7a6a',c: '#ffd166',a: '#bff0e6',b: '#7fc9ba',w: '#ffffff',e: '#1d4f5a',d: '#2f7a6a'},
  },
  curator: {
    head: ['..............','...kkkkkkkk...','..khhhhhhhhk..','..khhhkhhhhk..','.khhhhhkhhhhk.'],
    mouth: '..kaddddddaak.',
    palette: {k: '#120c1a',h: '#6b6f78',c: '#c8b6ff',a: '#a4a9b2',b: '#7c818c',w: '#ffe9a0',e: '#120c1a',d: '#4b4f58'},
  },
  brasa: {
    head: ['....c..c..c...','...cc.cc.cc...','...khchhchhk..','..khhhhhhhhk..','..kddddddddk..'],
    mouth: '..kaaaddaaaak.',
    palette: {k: '#120c1a',h: '#5a2a1a',c: '#ff7a1a',a: '#f2a36b',b: '#c9774a',w: '#ffffff',e: '#3a1a0a',d: '#b8321f'},
    quirk: 'flame',
  },
  nix: {
    head: ['......k.......','.....khk......','....khhhk.....','...khhhhhk....','..khhhhhhhk...'],
    mouth: '..kaaaaaaaaak.',
    palette: {k: '#0a0710',h: '#241a33',c: '#6a4fd6',a: '#3a3048',b: '#2a2338',w: '#ff5a8a',e: '#ff5a8a',d: '#120c1a'},
    quirk: 'hood',
  },
  aeris: {
    head: ['....cccccc....','...c......c...','....cccccc....','.....kkkk.....','...kkhhhhkk...'],
    mouth: '..kaaaddaaaak.',
    palette: {k: '#120c1a',h: '#cfe3ff',c: '#ffe9a0',a: '#eef3ff',b: '#bccbe8',w: '#9fd8ff',e: '#3d6fe5',d: '#9fb0d0'},
    quirk: 'halo',
  },
  atlas: {
    head: ['..........cc..','....kkkkkcck..','...khhhhhhhk..','..khhhhhhhhhk.','..kddddddddk..'],
    mouth: '..kaaddddaaak.',
    palette: {k: '#120c1a',h: '#2f5a8a',c: '#f2e6c8',a: '#e8c9a0',b: '#c49a74',w: '#ffffff',e: '#1d3a5a',d: '#7ad1ff'},
  },
  horologist: {
    head: ['.....kccck....','....kcdddck...','....kcdcdck...','...kkhhhhhkk..','..khhhhhhhhk..'],
    mouth: '..kaaaaaaaaak.',
    palette: {k: '#120c1a',h: '#5a4a2a',c: '#c9a46b',a: '#d8d0c0',b: '#a89f8c',w: '#fff4d6',e: '#3a2a12',d: '#fff4d6'},
    quirk: 'tick',
  },
  mote: {
    head: ['..............','...k......k...','...hk....kh...','....khhhhk....','...khhhhhhk...'],
    mouth: '..kaaadaaaaak.',
    palette: {k: '#05030a',h: '#2a2338',c: '#8a7aa8',a: '#1a1424',b: '#120c1a',w: '#ff4fd8',e: '#ffffff',d: '#8a7aa8'},
    quirk: 'horns',
  },
  seren: {
    head: ['.......c......','......ccc.....','....kkkckk....','...khhhhhhk...','..khhhhhhhhk..'],
    mouth: '..kaaaddaaaak.',
    palette: {k: '#120c1a',h: '#3a3f8a',c: '#ffe9a0',a: '#e6d4c8',b: '#bfa8a0',w: '#ffffff',e: '#1d2260',d: '#9fb8ff'},
  },
  vesper: {
    head: ['.........cc...','....kkkkkc....','...khhhhhhk...','..khhhhhhhhk..','..khhhhhhhhk..'],
    mouth: '..kaaaadaaaak.',
    palette: {k: '#120c1a',h: '#1d2a4a',c: '#e8e0ff',a: '#d8c8e8',b: '#a898c0',w: '#ffffff',e: '#5a4ab8',d: '#9fb8ff'},
  },
}

// Rows 5 to 13 are the same for every keeper except the mouth row (8).
export const BODY_ROWS = (mouth) => [
  '.kkaaaaaaaakk.',
  '..kaweaaweaak.',
  '..kaaaaaaaaak.',
  mouth,
  '..kbaaaaaabk..',
  '...kbbbbbbk...',
  '..kcccccccck..',
  '.kcccccccccck.',
  '.kkkkkkkkkkkk.',
]

// The Aether Bazaar's host is every keeper side by side.
export const CONCLAVE_IDS = ['tobb', 'vessa', 'curator', 'brasa', 'nix', 'aeris']
