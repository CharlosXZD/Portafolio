// Story scenes (EXPANSION.md G Q4a, H7): short full-screen beats before the
// big fights and at the big moments. Each scene is one or more pages; a page
// has a portrait (a boss avatar, a keeper sprite, a die, Pip, or an ending's
// art), a speaker and a few lines that type in. A scene plays once per save
// file (profile.scenes), can be skipped, and can be replayed from the
// Gallery's Endings tab. `music` is a theme from data/musicThemes.js and
// `color` tints the backdrop.
//
// All text here is a DRAFT for Carlos to rewrite. Keep each scene short
// enough to read in about 20 seconds.

import { ARBITER } from './arbiter.js'

const L = (en, es) => ({ en, es })
const page = (portrait, speaker, lines) => ({ portrait, speaker, lines })
// Portraits: { kind: 'boss' | 'keeper' | 'die' | 'pip', id }.
const boss = (id) => ({ kind: 'boss', id })
const keeper = (id) => ({ kind: 'keeper', id })
const die = (id) => ({ kind: 'die', id })
const PIP = { kind: 'pip' }

const PRIMORDIAL = L('The Primordial', 'El Primordial')
// The god who bans fishing is an Arbiter (Part S); his name lives in data/arbiter.js.
const ARBITER_SPEAKER = ARBITER.article

export const SCENES = {
  // --- Before the Primordial, on each path (Q4a, 1). ---
  final_neutral: {
    title: L('The last Circle', 'El último Círculo'),
    color: '#ff5a5a',
    music: 'boss_primordial',
    pages: [
      page(boss('primordial'), PRIMORDIAL, [
        L('Before fire, before water, before ground and sky, there was one thing dreaming. Me.', 'Antes del fuego, antes del agua, antes del suelo y el cielo, había una sola cosa soñando. Yo.'),
        L('The first Casters cut my dream in four and called the pieces elements.', 'Los primeros Lanzadores cortaron mi sueño en cuatro y llamaron elementos a los pedazos.'),
        L('Every die you carry holds a piece of me. I only want them back.', 'Cada dado que llevas guarda un pedazo de mí. Solo quiero recuperarlos.'),
        L('Cast, Caster. Let us see whose dream is stronger.', 'Lanza, Lanzador. Veamos qué sueño es más fuerte.'),
      ]),
    ],
  },
  final_split: {
    title: L('The last Circle', 'El último Círculo'),
    color: '#9fd8ff',
    music: 'boss_primordial',
    pages: [
      page(boss('primordial'), PRIMORDIAL, [
        L('You chose this. Pure dice, held apart. Every blessing Aeris gave you was a stitch in my wound.', 'Tú elegiste esto. Dados puros, separados. Cada bendición de Aeris fue una puntada en mi herida.'),
        L('Then I will not ask. I will take my pieces back, one roll at a time.', 'Entonces no voy a pedir. Recuperaré mis pedazos, una tirada a la vez.'),
        L('Watch your dice, Caster. When they touch, they remember me.', 'Cuida tus dados, Lanzador. Cuando se tocan, me recuerdan.'),
      ]),
    ],
  },
  final_primordial: {
    title: L('The last Circle', 'El último Círculo'),
    color: '#ff4d6d',
    music: 'boss_primordial',
    pages: [
      page(boss('primordial'), PRIMORDIAL, [
        L('You heard me. You forged, you bargained, you came all this way to bring me home.', 'Me escuchaste. Forjaste, negociaste, llegaste hasta aquí para traerme a casa.'),
        L('I will not fight you. The ones who broke me will.', 'No voy a pelear contigo. Lo harán los que me rompieron.'),
        L('Four gods stand between us. Bring them back to me, one by one.', 'Cuatro dioses se interponen entre nosotros. Tráemelos, uno por uno.'),
      ]),
    ],
  },

  // --- The Primordial die is lent (Q4a, 3). ---
  loan: {
    title: L('A die that dreams', 'Un dado que sueña'),
    color: '#ff4d6d',
    music: 'boss_primordial',
    pages: [
      page(die('primordial_die'), PRIMORDIAL, [
        L('Take this. It is the last piece of me that never split.', 'Toma esto. Es el último pedazo de mí que nunca se dividió.'),
        L('It holds everything Aether holds, and a little more.', 'Guarda todo lo que guarda el Éter, y un poco más.'),
        L('Each god that falls will pour back into it. By the fourth, it will be whole.', 'Cada dios que caiga volverá a él. Con el cuarto, estará entero.'),
        L('It is only lent. When this is over, I will need it back.', 'Solo es un préstamo. Cuando esto termine, lo necesitaré de vuelta.'),
      ]),
    ],
  },

  // --- Before each stage of the gauntlet (Q4a, 2). ---
  trial_gaea: {
    title: L('Stage 1 of 4', 'Etapa 1 de 4'),
    color: '#b8894a',
    music: 'boss_gaea',
    pages: [
      page(boss('gaea'), L('Gaea', 'Gaea'), [
        L('I am the ground. I held the dream still while the others cut it.', 'Soy el suelo. Sostuve el sueño quieto mientras los otros lo cortaban.'),
        L('Someone had to. A dream that never stops moving crushes everything inside it.', 'Alguien tenía que hacerlo. Un sueño que nunca deja de moverse aplasta todo lo que lleva dentro.'),
        L('Your Earth is mine, Caster. Let us see how it stands against me.', 'Tu Tierra es mía, Lanzador. Veamos cómo resiste contra mí.'),
      ]),
    ],
  },
  trial_ognen: {
    title: L('Stage 2 of 4', 'Etapa 2 de 4'),
    color: '#ff5a1a',
    music: 'boss_ognen',
    pages: [
      page(boss('ognen'), L('Ognen', 'Ognen'), [
        L('Ha! I burned the first seam. Best thing I ever did.', '¡Ja! Yo quemé la primera costura. Lo mejor que he hecho.'),
        L('One fire, everywhere, forever? Boring. Now I get to burn and go out and burn again.', '¿Un solo fuego, en todas partes, para siempre? Aburrido. Ahora puedo arder, apagarme y volver a arder.'),
        L('Your little flames will gutter in front of me. Prove me wrong.', 'Tus llamitas se van a apagar frente a mí. Demuéstrame lo contrario.'),
      ]),
    ],
  },
  trial_varuna: {
    title: L('Stage 3 of 4', 'Etapa 3 de 4'),
    color: '#2f7fe0',
    music: 'boss_varuna',
    pages: [
      page(boss('varuna'), L('Varuna', 'Varuna'), [
        L('I carried the pieces away, so far that they could never touch again.', 'Yo me llevé los pedazos, tan lejos que nunca volvieran a tocarse.'),
        L('You want them back together. The tide does not go back, Caster. It only pulls.', 'Tú quieres volver a juntarlos. La marea no regresa, Lanzador. Solo jala.'),
        L('Feel it in your dice. Every roll leans toward the bottom.', 'Siéntela en tus dados. Cada tirada se inclina hacia el fondo.'),
      ]),
    ],
  },
  trial_zephyr: {
    title: L('Stage 4 of 4', 'Etapa 4 de 4'),
    color: '#dff3ff',
    music: 'boss_zephyr',
    pages: [
      page(boss('zephyr'), L('Zephyr', 'Zephyr'), [
        L('We were four. We broke it together, and we told no one how.', 'Éramos cuatro. Lo rompimos juntos, y no le dijimos a nadie cómo.'),
        L('I am the last breath between you and a world with one voice.', 'Soy el último aliento entre tú y un mundo con una sola voz.'),
        L('If I fall, the dream wakes. Are you sure you want to hear it speak?', 'Si caigo, el sueño despierta. ¿Seguro que quieres oírlo hablar?'),
      ]),
    ],
  },

  // --- After the first Neutral win: the visions (Q4a, 4). ---
  visions: {
    title: L('Visions', 'Visiones'),
    color: '#ffd166',
    music: 'scene_firmament',
    pages: [
      page(die('gaea'), L('Gaea', 'Gaea'), [
        L('A mountain opens its eyes.', 'Una montaña abre los ojos.'),
        L('"I held the ground still while they cut it apart. I would do it again."', '"Sostuve el suelo quieto mientras lo partían. Lo volvería a hacer."'),
      ]),
      page(die('ognen'), L('Ognen', 'Ognen'), [
        L('A flame laughs, somewhere close.', 'Una llama ríe, muy cerca.'),
        L('"I burned the first seam. Ask me if I am sorry. Go on, ask."', '"Yo quemé la primera costura. Pregúntame si lo siento. Anda, pregunta."'),
      ]),
      page(die('varuna'), L('Varuna', 'Varuna'), [
        L('A tide pulls at your dice.', 'Una marea tira de tus dados.'),
        L('"I carried the pieces away so they could never touch. You keep bringing them together."', '"Me llevé los pedazos para que nunca se tocaran. Tú sigues juntándolos."'),
      ]),
      page(die('zephyr'), L('Zephyr', 'Zephyr'), [
        L('A wind whispers your name.', 'Un viento susurra tu nombre.'),
        L('"We were four. We broke it. Now you know how. Now you can choose."', '"Éramos cuatro. Lo rompimos. Ahora sabes cómo. Ahora puedes elegir."'),
      ]),
      page(boss('primordial'), PRIMORDIAL, [
        L('The Primordial sinks back into its dream, and speaks one last time.', 'El Primordial se hunde de nuevo en su sueño, y habla una última vez.'),
        L('"The four who broke me are still out there. Find them, and decide what I should be."', '"Los cuatro que me rompieron siguen ahí afuera. Encuéntralos, y decide qué debo ser."'),
      ]),
    ],
  },

  // --- The recipes, with the "Remembering" achievement (Q4a, 5). ---
  recipes: {
    title: L('Remembering', 'Recordar'),
    color: '#c8b6ff',
    music: 'shop_forge',
    pages: [
      page(PIP, L('Pip', 'Pip'), [
        L('You remember now. Pip glows brighter than it ever has.', 'Ahora recuerdas. Pip brilla más que nunca.'),
        L('Aether: the four triple fusions, forged together. One per run.', 'Éter: las cuatro fusiones triples, forjadas juntas. Uno por partida.'),
      ]),
      page(die('gaea'), L('The four gods', 'Los cuatro dioses'), [
        L('Gaea, Ognen, Varuna and Zephyr: each forged from four pure dice of their element, at the Forge.', 'Gaea, Ognen, Varuna y Zephyr: cada uno se forja con cuatro dados puros de su elemento, en la Forja.'),
        L('One god at a time. Each brings a power, and a price.', 'Un dios a la vez. Cada uno trae un poder, y un precio.'),
        L('Now every run is a choice: keep the pieces apart, or bring the dreamer home.', 'Ahora cada partida es una elección: mantener los pedazos separados, o llevar al soñador a casa.'),
      ]),
    ],
  },

  // --- The Firmament (H7). ---
  crossroads: {
    title: L('The Crossroads', 'La Encrucijada'),
    color: '#d9b8ff',
    music: 'scene_crossroads',
    pages: [
      page(PIP, L('Pip', 'Pip'), [
        L('The last Circle cracks like an eggshell.', 'El último Círculo se agrieta como una cáscara de huevo.'),
        L('Past it there is no ground and no sky. There is a frame: something older, something that holds everything in place.', 'Más allá no hay suelo ni cielo. Hay un marco: algo más antiguo, algo que sostiene todo en su lugar.'),
        L('Six shapes stand at its corners, watching you. Pip has never been this quiet.', 'Seis figuras están en sus esquinas, mirándote. Pip nunca había estado tan callado.'),
      ]),
    ],
  },
  warden_dawn: {
    title: L('A Warden', 'Un Custodio'),
    color: '#ffe27a',
    music: 'boss_dawn',
    pages: [
      page(boss('dawn'), L('The Dawn', 'El Alba'), [
        L('I am the first light that ever fell on anything.', 'Soy la primera luz que cayó sobre algo.'),
        L('I guard Light, so that every morning comes.', 'Guardo la Luz, para que llegue cada mañana.'),
        L('Too much of me blinds. Your best faces will burn white.', 'Demasiado de mí ciega. Tus mejores caras arderán en blanco.'),
        L('Win, and the Light is yours to carry.', 'Gana, y la Luz será tuya.'),
      ]),
    ],
  },
  warden_umbra: {
    title: L('A Warden', 'Un Custodio'),
    color: '#4a3a78',
    music: 'boss_umbra',
    pages: [
      page(boss('umbra'), L('The Umbra', 'La Umbra'), [
        L('I am the shadow every light leaves behind.', 'Soy la sombra que deja toda luz.'),
        L('I guard Darkness. Someone has to keep the night.', 'Guardo la Oscuridad. Alguien tiene que cuidar la noche.'),
        L('You will not see your dice, and each time you reach for them, I will take one.', 'No verás tus dados, y cada vez que los busques, me quedaré con uno.'),
        L('Cast in the dark, Caster.', 'Lanza a oscuras, Lanzador.'),
      ]),
    ],
  },
  warden_clockwork: {
    title: L('A Warden', 'Un Custodio'),
    color: '#c9a46b',
    music: 'boss_clockwork',
    pages: [
      page(boss('clockwork'), L('The Clockwork', 'El Mecanismo'), [
        L('Tick. I am the turning that keeps every moment in order.', 'Tic. Soy el giro que mantiene cada momento en orden.'),
        L('I guard Time. Without me, everything happens at once.', 'Guardo el Tiempo. Sin mí, todo pasa a la vez.'),
        L('You have ninety seconds. When they run out, I cast for you.', 'Tienes noventa segundos. Cuando se acaben, lanzo por ti.'),
        L('Tock.', 'Tac.'),
      ]),
    ],
  },
  warden_expanse: {
    title: L('A Warden', 'Un Custodio'),
    color: '#5a7cff',
    music: 'boss_expanse',
    pages: [
      page(boss('expanse'), L('The Expanse', 'La Extensión'), [
        L('I am the distance between things. Without me, nothing would have room to be.', 'Soy la distancia entre las cosas. Sin mí, nada tendría espacio para ser.'),
        L('I guard Space.', 'Guardo el Espacio.'),
        L('Every time you reroll, I will move your dice. Neighbors will not stay neighbors.', 'Cada vez que relances, moveré tus dados. Los vecinos no seguirán siendo vecinos.'),
      ]),
    ],
  },
  warden_maelstrom: {
    title: L('A Warden', 'Un Custodio'),
    color: '#ff3fa4',
    music: 'boss_maelstrom',
    pages: [
      page(boss('maelstrom'), L('The Maelstrom', 'La Vorágine'), [
        L('I am every change that has not happened yet.', 'Soy cada cambio que todavía no ocurre.'),
        L('I guard Chaos, and I am bad at guarding.', 'Guardo el Caos, y soy malo guardando.'),
        L('Reroll, and your dice forget what they were. For a round, at least.', 'Relanza, y tus dados olvidarán lo que eran. Por una ronda, al menos.'),
      ]),
    ],
  },
  warden_hollow: {
    title: L('A Warden', 'Un Custodio'),
    color: '#6b5a8a',
    music: 'boss_hollow',
    pages: [
      page(boss('hollow'), L('The Hollow', 'El Hueco'), [
        L('...', '...'),
        L('I am what was here before the first word.', 'Soy lo que había antes de la primera palabra.'),
        L('I guard the Void. Here, your relics are silent and your pockets are empty.', 'Guardo el Vacío. Aquí, tus reliquias callan y tus bolsillos están vacíos.'),
        L('Just you and your dice. As it should have been.', 'Solo tú y tus dados. Como debió ser.'),
      ]),
    ],
  },
  mote_first: {
    title: L('Mote speaks', 'Mote habla'),
    color: '#8a7aa8',
    music: 'shop_pantry',
    pages: [
      page(keeper('mote'), L('Mote', 'Mote'), [
        L('...', '...'),
        L('thank you. for the food.', 'gracias. por la comida.'),
        L('i was nothing, before. now i am a little something. i want to be more.', 'antes era nada. ahora soy un poco de algo. quiero ser más.'),
        L('bring me more, and i will show you what i keep.', 'tráeme más, y te mostraré lo que guardo.'),
      ]),
    ],
  },
  follower_split: {
    title: L('Aeris, unveiled', 'Aeris, revelada'),
    color: '#9fd8ff',
    music: 'shop_shrine',
    pages: [
      page(keeper('aeris'), L('Aeris', 'Aeris'), [
        L('You came through the door. Then I can stop pretending to be only a voice.', 'Cruzaste la puerta. Entonces puedo dejar de fingir que solo soy una voz.'),
        L('This is my true form: the wind above the world, the order in its sky.', 'Esta es mi verdadera forma: el viento sobre el mundo, el orden de su cielo.'),
        L('I will find you on every stretch of this Road. Keep the pieces apart, Caster.', 'Te encontraré en cada tramo de este Camino. Mantén los pedazos separados, Lanzador.'),
      ]),
    ],
  },
  follower_primordial: {
    title: L('The eclipse market', 'El mercado del eclipse'),
    color: '#8a5cff',
    music: 'shop_blackmarket',
    pages: [
      page(keeper('nix'), L('Nix', 'Nix'), [
        L('Surprised? I told you the Primordial remembers everyone who helps it.', '¿Sorprendido? Te dije que el Primordial recuerda a todos los que lo ayudan.'),
        L('Up here there is no reason to hide. I sell under a black sun now.', 'Aquí arriba no hay razón para esconderse. Ahora vendo bajo un sol negro.'),
        L('You will find my market on every stretch. Same deals. Bigger regrets.', 'Encontrarás mi mercado en cada tramo. Los mismos tratos. Arrepentimientos más grandes.'),
      ]),
    ],
  },
  follower_neutral: {
    title: L('Tobb, of course', 'Tobb, por supuesto'),
    color: '#e5a53d',
    music: 'shop_market',
    pages: [
      page(keeper('tobb'), L('Tobb', 'Tobb'), [
        L('What, you thought I would stay behind? I go everywhere, Caster.', '¿Qué, creías que me iba a quedar atrás? Voy a todas partes, Lanzador.'),
        L('No side, no master, no problem. Just a backpack and a good Road.', 'Sin bando, sin amo, sin problema. Solo una mochila y un buen Camino.'),
        L('I set up an extra stall on this stretch, just for you. Do not tell the others.', 'Puse un puesto extra en este tramo, solo para ti. No se lo digas a los demás.'),
      ]),
    ],
  },
  entropy: {
    title: L('The end of all things', 'El fin de todas las cosas'),
    color: '#f0e8ff',
    music: 'scene_firmament',
    pages: [
      page(die('entropy'), L('Entropy', 'Entropía'), [
        L('Six Wardens have fallen. Six corners of the frame stand open.', 'Seis Custodios han caído. Seis esquinas del marco están abiertas.'),
        L('Shadow, Continuum and Oblivion, with Aether at the center: four slots in the Forge, and they become one.', 'Sombra, Continuo y Olvido, con el Éter al centro: cuatro espacios en la Forja, y se vuelven uno.'),
        L('Entropy. It even makes sense, if you squint.', 'Entropía. Hasta tiene sentido, si entrecierras los ojos.'),
      ]),
    ],
  },

  // --- Cosmic elements (EXPANSION.md K6, K5). ---
  crossing: {
    title: L('A new realm', 'Un reino nuevo'),
    color: '#c9b8ff',
    music: 'scene_firmament',
    pages: [
      page(PIP, L('Pip', 'Pip'), [
        L('Pip flickers, then glows brighter than it ever has. This is not Elementa anymore.', 'Pip parpadea, y luego brilla más que nunca. Esto ya no es Elementa.'),
        L('Here the elements are new: Light, Darkness, Time, Space, Chaos and Void. You will find them in the shops.', 'Aquí los elementos son nuevos: Luz, Oscuridad, Tiempo, Espacio, Caos y Vacío. Los encontrarás en las tiendas.'),
      ]),
      page(PIP, L('Pip', 'Pip'), [
        L('Six Wardens guard the frame. Each one knows the recipe of a Mythic die: beat it, and the recipe is yours.', 'Seis Custodios guardan el marco. Cada uno conoce la receta de un dado Mítico: véncelo, y la receta es tuya.'),
        L('A Mythic die is forged from four of its element, plus Stardust. Bosses drop Stardust. Pip has never seen any. It wants to.', 'Un dado Mítico se forja con cuatro de su elemento, más Polvo Estelar. Los jefes sueltan Polvo Estelar. Pip nunca lo ha visto. Quiere verlo.'),
      ]),
    ],
  },
  // --- Realm 3 (EXPANSION.md R1, R2): the door, then each Rewriter. Drafts. ---
  realm3: {
    title: L('A realm of numbers', 'Un reino de números'),
    color: '#7affd8',
    music: 'scene_realm3',
    pages: [
      page(PIP, L('Pip', 'Pip'), [
        L('The frame was not the edge. Behind it, the numbers themselves are written down, and someone is holding the pen.', 'El marco no era el borde. Detrás, los números mismos están escritos, y alguien sostiene la pluma.'),
        L('Six Rewriters live here. Each one changes how a score is counted. Beat them, and what they know is yours.', 'Aquí viven seis Reescritores. Cada uno cambia cómo se cuenta un puntaje. Véncelos, y lo que saben es tuyo.'),
        L('There are new elements too, and dice made of arithmetic. Pip does not understand them. Pip wants to.', 'También hay elementos nuevos, y dados hechos de aritmética. Pip no los entiende. Pip quiere entenderlos.'),
      ]),
    ],
  },
  rewriter_axiom: {
    title: L('A Rewriter', 'Un Reescritor'),
    color: '#ffe9a0',
    music: 'boss_axiom',
    pages: [
      page(boss('axiom'), L('The Axiom', 'El Axioma'), [
        L('I state it; therefore it is.', 'Lo enuncio; por lo tanto, es.'),
        L('A score is a sum. Base, plus Mult. I have always said so.', 'Un puntaje es una suma. Base, más Mult. Siempre lo he dicho.'),
        L('Your multipliers are decoration. Bring weight, not tricks.', 'Tus multiplicadores son decoración. Trae peso, no trucos.'),
      ]),
      page(PIP, L('Pip', 'Pip'), [L('Pip says: big, flat numbers. Whetstones. Do not trust anything with an x.', 'Pip dice: números grandes y planos. Piedras de afilar. No confíes en nada que lleve una x.')]),
    ],
  },
  rewriter_zero: {
    title: L('A Rewriter', 'Un Reescritor'),
    color: '#9a9ab0',
    music: 'boss_zero',
    pages: [
      page(boss('zero'), L('Zero', 'Cero'), [
        L('...there was nothing, and then...', '...no había nada, y luego...'),
        L('...the small ones do not count. I do not count them...', '...los pequeños no cuentan. Yo no los cuento...'),
        L('...three or more, and you may stay...', '...tres o más, y puedes quedarte...'),
      ]),
      page(PIP, L('Pip', 'Pip'), [L('Pip says: faces below 3 are gone. Bring big dice, or something that lifts the small ones.', 'Pip dice: las caras menores a 3 desaparecen. Trae dados grandes, o algo que levante a los pequeños.')]),
    ],
  },
  rewriter_infinity: {
    title: L('A Rewriter', 'Un Reescritor'),
    color: '#8ad0ff',
    music: 'boss_infinity',
    pages: [
      page(boss('infinity'), L('Infinity', 'Infinito'), [
        L('and then, and then, and then', 'y luego, y luego, y luego'),
        L('Take every cap off. Explode forever. I only ask that the number you must reach grows with every breath you take.', 'Quita todos los topes. Explota para siempre. Solo pido que el número que debes alcanzar crezca con cada aliento tuyo.'),
        L('and then, and then', 'y luego, y luego'),
      ]),
      page(PIP, L('Pip', 'Pip'), [L('Pip says: every reroll and every explosion raises the target. Cast early, and make the first roll count.', 'Pip dice: cada reroll y cada explosión sube el objetivo. Lanza temprano, y que la primera tirada cuente.')]),
    ],
  },
  rewriter_observer: {
    title: L('A Rewriter', 'Un Reescritor'),
    color: '#ff9ad0',
    music: 'boss_observer',
    pages: [
      page(boss('observer'), L('The Observer', 'El Observador'), [
        L('I am only here if you look.', 'Solo estoy aquí si me miras.'),
        L('And neither are your dice. A face you are not watching has not decided what it is.', 'Y tus dados tampoco. Una cara que no miras no ha decidido qué es.'),
        L('Look at one. Only one.', 'Mira uno. Solo uno.'),
      ]),
      page(PIP, L('Pip', 'Pip'), [L('Pip says: faces are hidden until you hover or tap them. Luminance and the Eye keep them in view.', 'Pip dice: las caras están ocultas hasta que pasas el cursor o las tocas. La Luminancia y el Ojo las mantienen a la vista.')]),
    ],
  },
  rewriter_floating: {
    title: L('A Rewriter', 'Un Reescritor'),
    color: '#d8d8f0',
    music: 'boss_floating',
    pages: [
      page(boss('floating'), L('Floating Point', 'Punto Flotante'), [
        L('approximately.', 'aproximadamente.'),
        L('I round down. Every time. Half a point is not a point.', 'Redondeo hacia abajo. Siempre. Medio punto no es un punto.'),
        L('approximately, approximately.', 'aproximadamente, aproximadamente.'),
      ]),
      page(PIP, L('Pip', 'Pip'), [L('Pip says: whole numbers only. Every 0.5 is lost at every step. Flat Mult is your friend.', 'Pip dice: solo números enteros. Cada 0.5 se pierde en cada paso. El Mult plano es tu amigo.')]),
    ],
  },
  rewriter_deadlock: {
    title: L('A Rewriter', 'Un Reescritor'),
    color: '#c9a46b',
    music: 'boss_deadlock',
    pages: [
      page(boss('deadlock'), L('Deadlock', 'Bloqueo Mortal'), [
        L('One at a time, please.', 'De uno en uno, por favor.'),
        L('You may keep one die. Choose well. The rest must be thrown.', 'Puedes conservar un dado. Elige bien. El resto debe lanzarse.'),
        L('One at a time. Please.', 'De uno en uno. Por favor.'),
      ]),
      page(PIP, L('Pip', 'Pip'), [L('Pip says: you can hold or lock only one die. Build to reroll everything and trust the explosions.', 'Pip dice: solo puedes guardar o bloquear un dado. Arma algo que relance todo y confía en las explosiones.')]),
    ],
  },
  // The god who bans fishing (EXPANSION.md P5). Unarmed, calm, a little bored.
  // He is an Arbiter of realm 3 (Part S); the name and the portrait are placeholders.
  arbiter: {
    title: L('An Arbiter', 'Un Árbitro'),
    color: '#d8d2e8',
    music: 'scene_crossroads',
    pages: [
      page(keeper('arbiter'), ARBITER_SPEAKER, [
        L('Third time. Please stop.', 'Tercera vez. Por favor, detente.'),
        L('You have been shaking the future to see what falls out. It is not a pocket. It is not yours.', 'Has estado sacudiendo el futuro para ver qué cae. No es un bolsillo. No es tuyo.'),
      ]),
      page(keeper('arbiter'), ARBITER_SPEAKER, [
        L('Altering the odds by game is forbidden. I am not angry. I have no weapon. I simply do not allow it.', 'Alterar las probabilidades a base de juego está prohibido. No estoy enojado. No tengo armas. Simplemente no lo permito.'),
        L('Your dice are sent away. Your rerolls are spent. One of your lives is mine. Do try to look less often.', 'Tus dados se van. Tus rerolls se agotan. Una de tus vidas es mía. Intenta mirar con menos frecuencia.'),
      ]),
    ],
  },
  vesper_first: {
    title: L('The Cosmologist', 'La Cosmóloga'),
    color: '#9fb8ff',
    music: 'shop_vesper',
    pages: [
      page(keeper('vesper'), L('Vesper', 'Vesper'), [
        L("Someone new at Brasa's anvil. I'm Vesper. Where I'm from is a long story, and you don't have the time.", 'Alguien nuevo en el yunque de Brasa. Soy Vesper. De dónde vengo es una historia larga, y no tienes tiempo.'),
        L('These new elements are dangerous. Lovely, but dangerous. For now I only put two of them together at a time.', 'Estos elementos nuevos son peligrosos. Preciosos, pero peligrosos. Por ahora solo junto dos a la vez.'),
      ]),
      page(keeper('vesper'), L('Vesper', 'Vesper'), [
        L("Place two different ones in the slots and I'll tell you what they make. Some of them hum. Those can collapse.", 'Pon dos distintos en los espacios y te diré qué forman. Algunos zumban. Esos pueden colapsar.'),
        L('I sell Stardust and Catalysts. And if your runes fight over a number, Brasa and I can make them share. For a fee.', 'Vendo Polvo Estelar y Catalizadores. Y si tus runas se pelean por un número, Brasa y yo podemos hacer que lo compartan. Por una tarifa.'),
      ]),
    ],
  },
}

export const SCENE_IDS = Object.keys(SCENES)

export function sceneById(id) {
  return SCENES[id] ?? null
}
