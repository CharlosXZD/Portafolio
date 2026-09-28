// First-playthrough tutorial (GDD §25). Pip, a small arcane wisp, explains
// each part of the game the first time the player reaches it. Each group
// fires once (tracked in utils/tutorial.js); its steps play in order, each
// optionally spotlighting an element marked with `data-tut="<target>"`.
//
// `when(state)` decides whether a group is relevant right now. Groups are
// checked in order, so the first unseen, relevant one wins.
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
        text: {
          en: 'These are your dice. Click one to hold it (or press 1-9). Held dice stay put when you reroll.',
          es: 'Estos son tus dados. Haz clic en uno para guardarlo (o pulsa 1-9). Los dados guardados no se mueven al relanzar.',
        },
      },
      {
        target: 'reroll',
        text: {
          en: 'Reroll throws every die you are not holding. You only get a few per round, so pick your moments.',
          es: 'Relanzar vuelve a tirar todos los dados que no guardas. Solo tienes unos pocos por ronda, úsalos bien.',
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
        text: {
          en: "When you're happy with the roll, Cast. Good luck!",
          es: 'Cuando te guste la tirada, Lanza. ¡Buena suerte!',
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
        text: {
          en: 'Click anything for sale to read what it does, then buy it. Prices are on the gold tags.',
          es: 'Haz clic en lo que está a la venta para ver qué hace y luego cómpralo. Los precios están en las etiquetas doradas.',
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
          en: 'Hover any die to read what its element does. The Gallery (in the pause menu) lists every reaction.',
          es: 'Pasa el cursor sobre un dado para leer qué hace su elemento. La Galería (en el menú de pausa) lista todas las reacciones.',
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
