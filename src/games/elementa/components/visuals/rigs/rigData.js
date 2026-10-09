// Shape data for the layered keeper rigs. These are the same 14x14 pixel
// grids the shipping KeeperSprite draws (components/KeeperSprite.jsx), so a
// rigged keeper looks identical to the sprite at rest; the rig only splits
// them into layers that can move. Characters: k outline, h headpiece, c
// accent, a face, b shade, w eye white, e pupil, d detail, '.' empty.
// V7 will fold KeeperSprite and these rigs into one source.
export const RIG_KEEPERS = {
  tobb: {
    head: ['.......cc.....', '....kkkckk....', '...khhhhhhk...', '.kkhhhhhhhhkk.', 'khhhhhhhhhhhhk'],
    mouth: '..kaddddddaak.',
    palette: { k: '#120c1a', h: '#8a5a34', c: '#e5533d', a: '#8fcf6a', b: '#5a9a45', w: '#ffffff', e: '#120c1a', d: '#5a3a22' },
  },
  brasa: {
    head: ['....c..c..c...', '...cc.cc.cc...', '...khchhchhk..', '..khhhhhhhhk..', '..kddddddddk..'],
    mouth: '..kaaaddaaaak.',
    palette: { k: '#120c1a', h: '#5a2a1a', c: '#ff7a1a', a: '#f2a36b', b: '#c9774a', w: '#ffffff', e: '#3a1a0a', d: '#b8321f' },
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

// Where the eyes sit (row 6): the white pixel then the pupil, left and right.
export const EYE_CELLS = [
  { x: 4, w: 'w' },
  { x: 5, w: 'e' },
  { x: 8, w: 'w' },
  { x: 9, w: 'e' },
]
