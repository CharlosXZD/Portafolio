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

// Rows 5 to 10 (the face down to the chin) are the same for every keeper except the mouth row (8).
export const FACE_ROWS = (mouth) => [
  '.kkaaaaaaaakk.',
  '..kaweaaweaak.',
  '..kaaaaaaaaak.',
  mouth,
  '..kbaaaaaabk..',
  '...kbbbbbbk...',
]

// The body under the head (V3.1): neck, shoulders and torso, rows 11 to 17 of an 14 by 18 bust.
// c is the keeper's garment color, s its shade, d its detail color (the collar mark).
export const TORSO_ROWS = [
  '....kbbbbk....',
  '..kkccddcckk..',
  '.kcccccccccck.',
  '..kcccccccck..',
  '..kssssssssk..',
  '..kcccccccck..',
  '..kkkkkkkkkk..',
]

// The two arms, one grid each over the same 14 columns (rows 13 to 17): an upper arm at the
// side, a forearm that bends in, and a hand (a) in front of the chest.
export const ARM_ROWS = {
  left: ['kcc...........', 'kcc...........', '.kcck.........', '..kaak........', '..kkkk........'],
  right: ['...........cck', '...........cck', '.........kcck.', '........kaak..', '........kkkk..'],
}

// What each keeper does with their right hand (rects x, y, w, h, color) and how it moves.
// `work`: stir (a spoon swirls), tap (a hammer), flip (a coin), read (a ledger), tick (a watch),
// glint (a gem or star that pulses), rub (hands rub), scroll (a chart is unrolled).
export const KEEPER_PROPS = {
  tobb: { work: 'rub', props: [[10, 14, 2, 2, '#ffd166'], [10, 14, 2, 1, '#fff4d6']] },
  vessa: { work: 'stir', props: [[12, 9, 1, 6, '#8a5a34'], [11, 8, 3, 2, '#bff0e6'], [11, 8, 1, 1, '#ffffff']] },
  curator: { work: 'read', props: [[4, 14, 6, 3, '#4a3a8a'], [4, 14, 6, 1, '#c8b6ff'], [6, 15, 2, 1, '#ffe9a0']] },
  brasa: { work: 'tap', props: [[12, 10, 1, 6, '#8a5a34'], [10, 9, 4, 2, '#9aa0a8'], [10, 9, 4, 1, '#d4d8de']] },
  nix: { work: 'flip', props: [[10, 12, 2, 2, '#ffd166'], [10, 12, 1, 1, '#fff4d6']] },
  aeris: { work: 'glint', props: [[6, 14, 2, 2, '#ffffff'], [5, 15, 4, 1, '#9fd8ff']] },
  atlas: { work: 'scroll', props: [[8, 14, 5, 2, '#f2e6c8'], [8, 14, 1, 2, '#c49a74'], [12, 14, 1, 2, '#c49a74']] },
  horologist: { work: 'tick', props: [[10, 12, 3, 3, '#c9a46b'], [11, 13, 1, 1, '#fff4d6'], [11, 12, 1, 1, '#120c1a']] },
  mote: { work: 'glint', props: [[10, 13, 2, 2, '#ff4fd8']] },
  seren: { work: 'glint', props: [[10, 12, 2, 2, '#ffe9a0'], [9, 13, 4, 1, '#ffe9a0'], [10, 11, 2, 4, '#ffe9a0']] },
  vesper: { work: 'glint', props: [[10, 12, 3, 3, '#9fb8ff'], [11, 13, 1, 1, '#ffffff']] },
}

// The Aether Bazaar's host is every keeper side by side.
export const CONCLAVE_IDS = ['tobb', 'vessa', 'curator', 'brasa', 'nix', 'aeris']
