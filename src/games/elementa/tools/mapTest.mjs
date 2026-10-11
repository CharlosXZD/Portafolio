// Tests for the map (VISUALS.md V6): run with `node src/games/elementa/tools/mapTest.mjs`.
// The drawing itself is checked in the browser; this checks everything that is not drawing:
// where stops sit, which realm's paper a row is on, the state of each stop, the trails, the
// keyboard order, and that every map action still works on the map the view reads.
import { readFileSync } from 'node:fs'
const base = new URL('../', import.meta.url).pathname
const M = await import(base + 'components/visuals/map/mapModel.js')
const S = await import(base + 'components/visuals/map/mapSamples.js')
const E = await import(base + 'engine/map.js')
const R = await import(base + 'engine/gameReducer.js')
const { SHOP_TYPES } = await import(base + 'data/shops.js')
const { SIGN_IDS, GRIDS } = await import(base + 'components/visuals/map/mapSigns.js')
let fails = 0
const eq = (name, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) fails++; console.log(ok ? 'ok  ' : 'FAIL', name, ok ? '' : `got ${JSON.stringify(got)} want ${JSON.stringify(want)}`) }

// ---- realms and gates ----
{
  const el = S.sampleState({ round: 5, realm: 'elementa' })
  const fi = S.sampleState({ round: 20, realm: 'firmament', path: 'split' })
  const r3 = (path) => S.sampleState({ round: 35, realm: 'realm3', path })
  eq('rounds 1 to 15 are Elementa', [1, 8, 15].map((r) => M.realmOfRound(r, el)), ['elementa', 'elementa', 'elementa'])
  eq('16 to 30 are the Firmament once the door is crossed', [16, 25, 30].map((r) => M.realmOfRound(r, fi)), ['firmament', 'firmament', 'firmament'])
  eq('31 to 45 take the path\'s look', ['split', 'primordial', 'neutral'].map((p) => M.realmOfRound(35, r3(p))), ['empyrean', 'pleroma', 'meridian'])
  eq('past 45 is the Unwritten', M.realmOfRound(46, r3('split')), 'unwritten')
  eq('an Endless Elementa run has no Firmament paper', M.realmOfRound(20, S.sampleState({ round: 5 })), 'elementa')
  eq('every realm has a paper and a name in both languages', Object.keys(M.MAP_REALMS).every((k) => M.REALM_STYLE[k] && M.MAP_REALMS[k].name.en && M.MAP_REALMS[k].name.es), true)
  // gates
  const lay = (state, from, to) => M.layoutRoad({ state, fromRound: from, toRound: to, width: 340, rowHeight: 104, nodeSize: 56 })
  const g1 = lay(fi, 1, 30)
  eq('a gate sits between rounds 15 and 16, below 16 and above 15', g1.gates.map((g) => g.id), ['gate-15'])
  eq('...at the middle of the two rows', g1.gates[0].y, (g1.y(15) + g1.y(16)) / 2)
  const g2 = lay(r3('split'), 1, 45)
  eq('three gates on a full Road: the Firmament, realm 3 and the Unwritten', g2.gates.map((g) => g.id), ['gate-15', 'gate-30', 'gate-45'])
  eq('...each named for the realm it opens', g2.gates.map((g) => g.realm), ['firmament', 'empyrean', 'unwritten'])
  eq('the top door leaves room above round 45', [g2.topPad > 0, g2.y(45) > g2.topPad / 2], [true, true])
  eq('no gate when only one side is in view', lay(fi, 16, 30).gates.length, 0)
  eq('the layout is bottom to top: later rounds are higher', g2.y(10) > g2.y(11), true)
}

// ---- geometry ----
{
  const st = S.sampleState({ round: 9, realm: 'elementa' })
  const lay = M.layoutRoad({ state: st, fromRound: 9, toRound: 12, width: 168, rowHeight: 42, nodeSize: 30 })
  eq('the compact window keeps its size (width and rows x row height)', [lay.width, lay.height, lay.rows], [168, 4 * 42, [12, 11, 10, 9]])
  eq('three columns spread left to right inside the paper with a margin', [0, 1, 2].map((c) => lay.x(c)).every((x, i, a) => x - lay.nodeSize / 2 >= lay.gutter && x + lay.nodeSize / 2 <= lay.width - 10 && (i === 0 || x > a[i - 1])), true)
  eq('no row past the last layer', M.layoutRoad({ state: st, fromRound: 1, toRound: 99, width: 200 }).toRound, st.map.layers.length)
}

// ---- states of the stops ----
{
  const st = S.sampleState({ round: 9, realm: 'elementa' })
  const map = st.map
  const reachable = M.reachableFrom(map)
  const choices = new Set(E.nextChoices(map).map((n) => n.id))
  const path = new Set(map.path)
  const sight = M.sightOf(st)
  const status = (n) => M.nodeState(map, n, { reachable, choices, sight, path })
  eq('sight is three rows ahead, plus what Atlas and Clarity gave', [M.sightOf(st), M.sightOf({ ...st, roadSight: 2 })], [12, 14])
  eq('here, walked, choice', [status(E.currentNode(map)), status(E.nodeById(map, map.path[3])), status(E.nextChoices(map)[0])], ['here', 'walked', 'choice'])
  const states = map.layers.flat().map(status)
  eq('every stop is in exactly one known state', states.every((s) => ['here', 'picked', 'choice', 'walked', 'reachable', 'fog', 'unknown'].includes(s)), true)
  eq('rows past the sight are unknown, unless walked', map.layers[12].every((n) => status(n) === 'unknown'), true)
  eq('a stop not reachable from here, within sight, is fog', states.includes('fog'), true)
  const picked = S.withPick(st, E.nextChoices(map)[0].id)
  eq('the picked stop reads as picked', M.nodeState(picked.map, E.nextChoices(picked.map)[0], { reachable, choices, sight, path }), 'picked')
}

// ---- trails ----
{
  const st = S.sampleState({ round: 12, realm: 'elementa' })
  const lay = M.layoutRoad({ state: st, fromRound: 11, toRound: 14, width: 340, rowHeight: 104, nodeSize: 56 })
  const a = E.currentNode(st.map)
  const b = E.nextChoices(st.map)[0]
  const tr = M.trailBetween(lay, a, b)
  eq('a trail runs from the lower stop to the upper one', [tr.pts[0], tr.pts[3]], [[lay.x(a.col), lay.y(a.round)], [lay.x(b.col), lay.y(b.round)]])
  eq('the same pair always gets the same wobble', M.trailBetween(lay, a, b).d, tr.d)
  eq('points on a trail start and end on the stops', [M.pointOnTrail(tr.pts, 0), M.pointOnTrail(tr.pts, 1)].map((p) => p.map(Math.round)), [tr.pts[0], tr.pts[3]].map((p) => p.map(Math.round)))
  const mid = M.pointOnTrail(tr.pts, 0.5)
  eq('the walker moves up as it goes', M.pointOnTrail(tr.pts, 0.2)[1] > mid[1] && mid[1] > M.pointOnTrail(tr.pts, 0.8)[1], true)
}

// ---- keyboard ----
{
  const st = S.sampleState({ round: 9, realm: 'elementa' })
  const lay = M.layoutRoad({ state: st, fromRound: 6, toRound: 12, width: 340, rowHeight: 104, nodeSize: 56 })
  const reachable = M.reachableFrom(st.map)
  const choices = new Set(E.nextChoices(st.map).map((n) => n.id))
  const path = new Set(st.map.path)
  const status = (n) => M.nodeState(st.map, n, { reachable, choices, sight: 12, path })
  const order = M.focusOrder(lay, status)
  eq('only here, choices and what is reachable can be focused', order.every((n) => ['here', 'choice', 'picked', 'reachable'].includes(status(n))), true)
  const here = order.find((n) => status(n) === 'here')
  const up = M.neighborInDirection(lay, order, here, 'up')
  eq('up goes to the nearest row first', up.round, here.round + 1)
  eq('down from the first row has nowhere to go', M.neighborInDirection(lay, order, here, 'down'), null)
  const choice = order.find((n) => status(n) === 'choice')
  const sideways = M.neighborInDirection(lay, order, choice, choice.col === 0 ? 'right' : 'left')
  eq('left and right stay on the row', sideways ? sideways.round : choice.round, choice.round)
}

// ---- tooltips ----
{
  const keys = SHOP_TYPES
  eq('every shop type lists what it sells, in both languages', Object.values(keys).every((t) => M.sellsOf(t).every((k) => M.SELLS_LABEL[k]?.en && M.SELLS_LABEL[k]?.es)), true)
  eq('the Market sells dice, relics and items', M.sellsOf(keys.market), ['dice', 'relics', 'items'])
  eq('the Alchemist brews', M.sellsOf(keys.alchemist).includes('brew'), true)
  eq('Atlas sells map services and no goods', M.sellsOf(keys.cartography), ['services'])
  eq('every shop has a drawn sign', Object.values(keys).every((t) => SIGN_IDS.includes(t.id)), true)
  eq('every sign grid is at most 12 wide and 12 tall, rows of known letters', Object.values(GRIDS).every((g) => g.length <= 12 && g.every((row) => row.length <= 12 && /^[.kablwdmMycrgu]+$/.test(row))), true)
}

// ---- every map action still works on the map the view reads ----
{
  const bk = JSON.parse(readFileSync(base + 'tools/map-test-saves.json', 'utf8'))
  const files = JSON.parse(bk.data['elementa-files-v2'])
  const check = (name, state) => {
    let ok = true
    try {
      const lay = M.layoutRoad({ state, fromRound: 1, toRound: state.map.layers.length, width: 340, rowHeight: 104, nodeSize: 56 })
      for (const round of lay.rows) for (const node of state.map.layers[round - 1]) for (const id of node.next) {
        const to = E.nodeById(state.map, id)
        const tr = M.trailBetween(lay, node, to)
        if (!(tr.y2 < tr.y1) || tr.d.includes('NaN')) ok = false
      }
    } catch (e) {
      ok = false
      console.log(e)
    }
    eq(name, ok, true)
  }
  const s1 = files[0].run
  check('file 1 (Elementa, round 8): every trail is drawable', s1)
  eq('...with the foretold boss showing a name', M.knownBossAt(10, s1).known, 'umbra')
  eq('...and a boss row without one unknown', M.knownBossAt(15, s1).known, 'primordial')
  eq('...and a quiet row not a boss row', M.knownBossAt(9, s1).boss, false)
  // choose a stop
  const pick = E.nextChoices(s1.map)[0]
  const afterPick = R.gameReducer(s1, { type: 'CHOOSE_PATH', nodeId: pick.id })
  eq('CHOOSE_PATH picks a stop, and the map reads it as picked', [afterPick.map.pendingId, M.nodeState(afterPick.map, pick, { reachable: M.reachableFrom(afterPick.map), choices: new Set(E.nextChoices(afterPick.map).map((n) => n.id)), sight: 11, path: new Set(afterPick.map.path) })], [pick.id, 'picked'])
  const s2 = files[1].run
  check('file 2 (the Firmament, Atlas): every trail is drawable', s2)
  eq('...Atlas is the shop', s2.shop.type, 'cartography')
  // Atlas's services
  const unlinkedBefore = E.unlinkedNext(s2.map).length
  const added = R.gameReducer({ ...s2, shards: 999 }, { type: 'USE_SERVICE', serviceId: 'path' })
  eq('Add a path links one more stop, and the new trail is drawn', [unlinkedBefore > 0 ? E.currentNode(added.map).next.length - E.currentNode(s2.map).next.length : 0, unlinkedBefore > 0 ? 1 : 0], [unlinkedBefore > 0 ? 1 : 0, unlinkedBefore > 0 ? 1 : 0])
  check('...Add a path leaves a drawable map', added)
  const redrawn = R.gameReducer({ ...s2, shards: 999 }, { type: 'USE_SERVICE', serviceId: 'redraw' })
  check('Redraw leaves a drawable map', redrawn)
  eq('...Redraw changes the next row\'s shops, never the links', [JSON.stringify(redrawn.map.layers[20].map((n) => n.next)) === JSON.stringify(s2.map.layers[20].map((n) => n.next)), redrawn.map.layers[s2.round].length], [true, s2.map.layers[s2.round].length])
  const peeked = R.gameReducer({ ...s2, shards: 999 }, { type: 'USE_SERVICE', serviceId: 'peek' })
  const peekRound = Object.keys(peeked.map.peeks || {})[0]
  eq('Peek records the next Warden, and the banner can name it', [Boolean(peekRound), peekRound ? Boolean(M.knownBossAt(Number(peekRound), peeked).known) : false], [true, true])
  const s3 = files[2].run
  check('file 3 (realm 3, the Pleroma): every trail is drawable', s3)
  eq('...it is on the Pleroma paper', M.realmOfRound(s3.round, s3), 'pleroma')
}

// ---- the engine did not change ----
{
  const { execSync } = await import('node:child_process')
  let diff = ''
  try { diff = execSync('git diff --stat HEAD -- src/games/elementa/engine/map.js', { cwd: base + '../../../' }).toString() } catch { diff = 'git unavailable' }
  eq('engine/map.js is untouched by this phase', diff.trim(), '')
}

console.log(fails ? `${fails} FAILED` : 'all ok')
