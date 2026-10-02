// First-playthrough tutorial (GDD §25). Pip, a small arcane wisp, explains
// each part of the game the first time the player reaches it. Each group
// fires once (tracked in utils/tutorial.js); its steps play in order, each
// optionally spotlighting an element marked with `data-tut="<target>"`.
//
// `when(state)` decides whether a group is relevant right now. Groups are
// checked in order, so the first unseen, relevant one wins.
//
// A step with `waitFor(state)` is an action step: Pip asks the player to
// do something, only the spotlighted element is clickable, and the step
// advances by itself once `waitFor` returns true (polled).
const distinctElements = (state) => new Set(state.dice.map((d) => d.elementId)).size

export const TUTORIAL_GROUPS = [
  {
    id: 'basics',
    when: (s) => s.phase === 'rolling',
    steps: [
      {
        target: null,
        text: {
          en: "Hi, I'm Pip, keeper of the circle! I'll show you around. Each round, you roll elemental dice and try to score at least the target.",
          es: '¡Hola, soy Pip, guardián del círculo! Te voy a mostrar todo. Cada ronda tiras dados elementales e intentas anotar al menos el objetivo.',
        },
      },
      {
        target: 'dice',
        waitFor: (s) => s.dice.some((d) => d.held),
        text: {
          en: 'These are your dice. Click the die you like best to HOLD it (or press its number key). Held dice glow gold and stay put.',
          es: 'Estos son tus dados. Haz clic en el que más te guste para GUARDARLO (o pulsa su número). Los dados guardados brillan en dorado y no se mueven.',
        },
      },
      {
        target: 'reroll',
        waitFor: (s) => s.rerollsUsed > 0 || s.phase !== 'rolling',
        text: {
          en: 'Now press Reroll (or R). Every die you are NOT holding gets thrown again. You only get a few rerolls per round.',
          es: 'Ahora pulsa Relanzar (o R). Todos los dados que NO guardas se vuelven a tirar. Solo tienes unos pocos por ronda.',
        },
      },
      {
        target: 'score',
        text: {
          en: 'Your score is Base x Mult. Base comes from your dice. Mult comes from sets, explosions, reactions, and relics.',
          es: 'Tu puntaje es Base x Mult. La Base viene de tus dados. El Mult viene de sets, explosiones, reacciones y reliquias.',
        },
      },
      {
        target: 'ledger',
        text: {
          en: 'The Cast ledger lists every point, so you always know why your score is what it is. Check it before you cast.',
          es: 'La cuenta del hechizo lista cada punto, así siempre sabes por qué tienes ese puntaje. Revísala antes de lanzar.',
        },
      },
      {
        target: 'target',
        text: {
          en: 'Fill this bar to clear the round. Go way past it and you earn bonus Shards.',
          es: 'Llena esta barra para superar la ronda. Si la rebasas por mucho, ganas Fragmentos extra.',
        },
      },
      {
        target: 'hud',
        text: {
          en: 'This is your run: round, target, lives, Shards, and relics. Missing a target costs a life, and you retry the round.',
          es: 'Esta es tu partida: ronda, objetivo, vidas, Fragmentos y reliquias. Fallar un objetivo cuesta una vida y reintentas la ronda.',
        },
      },
      {
        target: 'cast',
        waitFor: (s) => s.phase !== 'rolling' || Boolean(document.querySelector('[data-casting]')),
        text: {
          en: 'Happy with it? Press Cast (or Enter) and watch the ledger add it all up.',
          es: '¿Te gusta? Pulsa Lanzar (o Enter) y mira cómo la cuenta lo suma todo.',
        },
      },
    ],
  },
  {
    id: 'missed',
    when: (s) => s.phase === 'missed',
    steps: [
      {
        target: null,
        text: {
          en: "Missed! That cost a life, but you get to retry this round with fresh dice. Run out of lives and the run ends. You've got this.",
          es: '¡Fallaste! Eso costó una vida, pero puedes reintentar la ronda con dados nuevos. Si te quedas sin vidas, la partida termina. ¡Tú puedes!',
        },
      },
    ],
  },
  {
    id: 'shop',
    when: (s) => s.phase === 'shop',
    steps: [
      {
        target: 'shards',
        text: {
          en: 'Welcome to the shop! Shards are your money. You earn them by clearing rounds, and unspent Shards earn a little interest.',
          es: '¡Bienvenido a la tienda! Los Fragmentos son tu dinero. Los ganas al superar rondas, y los que no gastas generan un poco de interés.',
        },
      },
      {
        target: 'offers',
        waitFor: () => Boolean(document.querySelector('[data-tut-inspector]')),
        text: {
          en: 'Click any die for sale to read what it does. Prices are on the gold tags.',
          es: 'Haz clic en cualquier dado a la venta para ver qué hace. Los precios están en las etiquetas doradas.',
        },
      },
      {
        target: null,
        text: {
          en: 'Buy puts an item in your inventory. Consumables also have "Buy & use", which uses it right away, no slot needed.',
          es: 'Comprar pone el objeto en tu inventario. Los consumibles también tienen "Comprar y usar", que lo usa de inmediato sin ocupar espacio.',
        },
      },
      {
        target: 'inventory',
        text: {
          en: 'Everything you own lives here. Relics work on their own. Consumables are one-use: click one and press Apply.',
          es: 'Todo lo que tienes está aquí. Las reliquias funcionan solas. Los consumibles son de un uso: haz clic en uno y pulsa Aplicar.',
        },
      },
      {
        target: 'next',
        text: {
          en: 'When you are done shopping, head into the next round.',
          es: 'Cuando termines de comprar, pasa a la siguiente ronda.',
        },
      },
    ],
  },
  {
    id: 'road',
    when: (s) => s.phase === 'shop' && Boolean(document.querySelector('[data-tut="map"]')),
    steps: [
      {
        target: 'map',
        waitFor: (s) => Boolean(s.map?.pendingId) || s.phase !== 'shop',
        text: {
          en: 'This is the Road. Every stop is a different shop with its own keeper: Markets, Alchemists, Forges, and rarer ones. Pick where you go next.',
          es: 'Este es el Camino. Cada parada es una tienda distinta con su propio guardián: Mercados, Alquimistas, Forjas y otras más raras. Elige a dónde vas después.',
        },
      },
      {
        target: 'map',
        text: {
          en: 'Faces on the left mark boss rounds. The keepers remember you between runs, so visit often and they might tell you a story.',
          es: 'Las caras a la izquierda marcan rondas de jefe. Los guardianes te recuerdan entre partidas: visítalos seguido y quizá te cuenten una historia.',
        },
      },
    ],
  },
  {
    id: 'forge',
    when: (s) => s.phase === 'shop' && Boolean(document.querySelector('[data-tut="forge"]')),
    steps: [
      {
        target: 'forge',
        text: {
          en: 'The Fusion Forge! It melts dice you own into one stronger fusion die. Fire and Air make Lightning, for example.',
          es: '¡La Forja de Fusión! Funde dados que tienes en un dado de fusión más fuerte. Fuego y Aire hacen Relámpago, por ejemplo.',
        },
      },
    ],
  },
  {
    id: 'reactions',
    when: (s) => s.phase === 'rolling' && distinctElements(s) >= 2,
    steps: [
      {
        target: 'dice',
        text: {
          en: 'Different elements! Dice sitting next to each other can react, like Fire beside Air. Drag dice to reorder them and watch the glow.',
          es: '¡Elementos distintos! Los dados que están juntos pueden reaccionar, como Fuego junto a Aire. Arrástralos para reordenarlos y mira el brillo.',
        },
      },
      {
        target: null,
        text: {
          en: 'Each element has a family: the pure die plus every fusion made from it. A "Water-family die" means Water, Ice, Mud, Steam, and so on. Hover any die to see its families.',
          es: 'Cada elemento tiene una familia: el dado puro y toda fusión hecha con él. Un "dado de la familia Agua" es Agua, Hielo, Lodo, Vapor, etc. Pasa el cursor sobre un dado para ver sus familias.',
        },
      },
      {
        target: null,
        text: {
          en: 'Run Info (top right) opens the Gallery with every reaction. Some reactions between fusion dice are secret: find them by experimenting.',
          es: 'Info de partida (arriba a la derecha) abre la Galería con todas las reacciones. Algunas reacciones entre dados de fusión son secretas: descúbrelas experimentando.',
        },
      },
    ],
  },
  {
    id: 'boss',
    when: (s) => s.phase === 'rolling' && Boolean(s.bossModifier),
    steps: [
      {
        target: 'boss',
        text: {
          en: 'A boss round! Read the twist carefully: it bends the rules for this round only.',
          es: '¡Una ronda de jefe! Lee el giro con cuidado: cambia las reglas solo en esta ronda.',
        },
      },
    ],
  },
]
