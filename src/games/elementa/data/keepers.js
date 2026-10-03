// Shop keepers (GDD §28): one Wanderer per shop type, each remembering the
// player across runs (visits are stored per save file, utils/keepers.js).
// Dialog grows with the relationship: an intro on the first visit ever,
// then greetings by tier, with lore lines revealed at set visit counts.
// All lore here is a first draft for Carlos to rewrite.
//
// `loreAt` lists the visit numbers (counting the intro as visit 1) at
// which the next lore line is told instead of a greeting.

const L = (en, es) => ({ en, es })

export const KEEPERS = {
  tobb: {
    id: 'tobb',
    name: L('Tobb', 'Tobb'),
    title: L('Traveling peddler', 'Buhonero viajero'),
    intro: L(
      "Well met, Caster! Tobb's the name, and the Roads are my shop. Everything I own is for sale, except the backpack.",
      '¡Bienhallado, Lanzador! Me llamo Tobb, y los Caminos son mi tienda. Todo lo que tengo está a la venta, menos la mochila.',
    ),
    greet: {
      stranger: [
        L("Back again? Good. Shards don't spend themselves.", '¿Otra vez por aquí? Bien. Los Fragmentos no se gastan solos.'),
        L('Fresh stock, fresh from somewhere.', 'Mercancía fresca, recién traída de algún lado.'),
      ],
      regular: [
        L("My favorite customer! Don't tell the others.", '¡Mi cliente favorito! No se lo digas a los demás.'),
        L('I saved you the good dice. Probably.', 'Te guardé los dados buenos. Creo.'),
      ],
      friend: [
        L("You're the only Caster who ever came back this many times.", 'Eres el único Lanzador que ha vuelto tantas veces.'),
        L('Pull up a crate, friend. Business can wait a moment.', 'Siéntate en una caja, amigo. El negocio puede esperar un momento.'),
      ],
    },
    afterBoss: L('You beat a Fragment? Then you can afford my prices.', '¿Venciste a un Fragmento? Entonces puedes pagar mis precios.'),
    // Past the door (EXPANSION.md H6): Tobb goes everywhere.
    special: {
      firmament: L(
        "What, you thought I'd stay behind? I go everywhere, Caster. The prices up here are astronomical. That's a joke. Mostly.",
        '¿Qué, creías que me iba a quedar atrás? Voy a todas partes, Lanzador. Aquí arriba los precios son astronómicos. Es un chiste. Casi.',
      ),
    },
    lowLives: L('You look rough. Buy something shiny, it helps. Trust me.', 'Te ves fatal. Compra algo brillante, ayuda. Créeme.'),
    loreAt: [2, 4, 7, 11],
    lore: [
      L(
        "Dice weren't always toys, you know. The first Casters carved them to hold the elements after the Split.",
        'Los dados no siempre fueron juguetes. Los primeros Lanzadores los tallaron para guardar los elementos después de la División.',
      ),
      L(
        'The Split? Before Fire, Water, Earth and Air there was only the Primordial. One thing, everything at once. The Casters broke it in four.',
        '¿La División? Antes del Fuego, el Agua, la Tierra y el Aire solo existía el Primordial. Una cosa, todo a la vez. Los Lanzadores lo partieron en cuatro.',
      ),
      L(
        'The bosses you face are what is left of it. Fragments. They twist the rules because they remember when there were no rules.',
        'Los jefes que enfrentas son lo que queda de él. Fragmentos. Tuercen las reglas porque recuerdan cuando no había reglas.',
      ),
      L(
        'Every Caster walks the Roads toward the last Circle. Most stop. You keep going. I like that. Good for business.',
        'Todo Lanzador recorre los Caminos hacia el último Círculo. Casi todos se detienen. Tú sigues. Me gusta. Es bueno para el negocio.',
      ),
    ],
  },

  vessa: {
    id: 'vessa',
    name: L('Vessa', 'Vessa'),
    title: L('Alchemist', 'Alquimista'),
    intro: L(
      "Careful, that one bubbles. I'm Vessa. I brew what the elements forget to be.",
      'Cuidado, ese burbujea. Soy Vessa. Destilo lo que los elementos olvidan ser.',
    ),
    greet: {
      stranger: [
        L("Bring me two things and I'll give you one better thing. That's alchemy.", 'Tráeme dos cosas y te doy una mejor. Eso es alquimia.'),
        L("Don't touch the green flask. Or do. I'm curious.", 'No toques el frasco verde. O sí. Tengo curiosidad.'),
      ],
      regular: [
        L('Ah, my favorite test subject. I mean customer.', 'Ah, mi sujeto de pruebas favorito. Digo, cliente.'),
        L('I made something new. It only exploded twice.', 'Hice algo nuevo. Solo explotó dos veces.'),
      ],
      friend: [
        L('I named a potion after you. It is very stubborn.', 'Le puse tu nombre a una poción. Es muy terca.'),
        L('Stay a while. The fumes are mostly harmless now.', 'Quédate un rato. Los vapores ya son casi inofensivos.'),
      ],
    },
    afterBoss: L('You smell of Fragment. Delightful. Mind if I take a sample?', 'Hueles a Fragmento. Delicioso. ¿Me dejas tomar una muestra?'),
    lowLives: L("You're leaking vitality. Drink something. Not the green one.", 'Se te escapa la vitalidad. Bebe algo. El verde no.'),
    loreAt: [2, 4, 7, 11],
    lore: [
      L(
        "Water remembers every shape it has held. That's why my brews work: I just remind it.",
        'El agua recuerda cada forma que ha tenido. Por eso funcionan mis pociones: solo se lo recuerdo.',
      ),
      L(
        "Steam, Mud, Ice. Fusions aren't new elements. They're old ones holding hands.",
        'Vapor, Lodo, Hielo. Las fusiones no son elementos nuevos. Son elementos viejos tomados de la mano.',
      ),
      L(
        "Aether is all four holding hands at once. It's the closest thing to the Primordial we can still touch.",
        'El Éter son los cuatro tomados de la mano a la vez. Es lo más cercano al Primordial que aún podemos tocar.',
      ),
      L(
        'Pip? That little wisp is Aether too. A spark that fell off during the Split and never found its way back.',
        '¿Pip? Ese pequeño fuego fatuo también es Éter. Una chispa que se cayó en la División y nunca encontró el camino de vuelta.',
      ),
    ],
  },

  curator: {
    id: 'curator',
    name: L('The Curator', 'El Curador'),
    title: L('Keeper of the vault', 'Guardián de la bóveda'),
    intro: L(
      'Speak softly. Every relic here belonged to someone who did not finish the Road. I am the Curator. I keep them.',
      'Habla bajo. Cada reliquia aquí fue de alguien que no terminó el Camino. Soy el Curador. Yo las guardo.',
    ),
    greet: {
      stranger: [
        L('Choose with care. Relics choose back.', 'Elige con cuidado. Las reliquias también eligen.'),
        L('These were taken from the Fragments you defeated.', 'Estas se tomaron de los Fragmentos que derrotaste.'),
      ],
      regular: [
        L('You return, and you return. The relics notice.', 'Vuelves, y vuelves. Las reliquias lo notan.'),
        L('I polished the crown for you. Not that I expected you.', 'Pulí la corona para ti. No es que te esperara.'),
      ],
      friend: [
        L('When you fall, and all Casters do, I will keep your dice with honor.', 'Cuando caigas, y todos los Lanzadores caen, guardaré tus dados con honor.'),
        L('You have earned a seat by the vault. Few have.', 'Te has ganado un lugar junto a la bóveda. Pocos lo tienen.'),
      ],
    },
    afterBoss: L("The Fragment's echo is still warm. Its treasures are here now.", 'El eco del Fragmento aún está tibio. Sus tesoros ya están aquí.'),
    lowLives: L('Your light is thin. Do not let me add you to the collection today.', 'Tu luz es tenue. No dejes que te añada a la colección hoy.'),
    // Said once, on the first Vault visit after beating Primordial (B6).
    recipe: L(
      'You defeated it. Then you have earned this: the recipe the first Casters swore never to write down.',
      'Lo derrotaste. Entonces te ganaste esto: la receta que los primeros Lanzadores juraron nunca escribir.',
    ),
    loreAt: [2, 4, 7, 11],
    lore: [
      L(
        'I was a mountain once. A Caster carved me from the Earth half of the Split, to guard what matters.',
        'Una vez fui montaña. Un Lanzador me talló de la mitad terrestre de la División, para cuidar lo que importa.',
      ),
      L(
        'Each boss is a Fragment wearing a rule like a mask. Calm Winds, Iron Grip, Silence. Names we gave them so we could fight them.',
        'Cada jefe es un Fragmento que lleva una regla como máscara. Vientos Calmos, Puño de Hierro, Silencio. Nombres que les dimos para poder enfrentarlos.',
      ),
      L(
        'The Primordial does not want to destroy you. It wants to be whole again. It needs your dice for that.',
        'El Primordial no quiere destruirte. Quiere volver a estar completo. Para eso necesita tus dados.',
      ),
      L(
        'The last Circle is where the Split happened. If the Primordial reforms there, there will be no Road, no vault, and no me.',
        'El último Círculo es donde ocurrió la División. Si el Primordial se rehace ahí, no habrá Camino, ni bóveda, ni yo.',
      ),
    ],
  },

  brasa: {
    id: 'brasa',
    name: L('Brasa', 'Brasa'),
    title: L('Smith of the Fusion Forge', 'Herrera de la Forja de Fusión'),
    intro: L(
      "Mind the sparks! Name's Brasa. Bring me dice, I'll make them bigger, meaner, or both.",
      '¡Cuidado con las chispas! Me llamo Brasa. Tráeme dados y los hago más grandes, más bravos, o las dos cosas.',
    ),
    greet: {
      stranger: [
        L('Two dice go in, one better die comes out. Simple.', 'Entran dos dados, sale uno mejor. Así de simple.'),
        L('Hot iron, hot dice, hot deals. Well, fair deals.', 'Hierro caliente, dados calientes, ofertas calientes. Bueno, justas.'),
      ],
      regular: [
        L('Your dice sing when I hit them. Good sign.', 'Tus dados cantan cuando los golpeo. Buena señal.'),
        L('Back for more heat? I kept the forge warm.', '¿Vuelves por más calor? Mantuve la forja encendida.'),
      ],
      friend: [
        L("I'd forge you a die from my own flame if you asked. Don't ask.", 'Te forjaría un dado con mi propia llama si me lo pidieras. No me lo pidas.'),
        L("Every die you rolled against a Fragment, I hear it in the metal. You've been busy.", 'Cada dado que tiraste contra un Fragmento lo escucho en el metal. Has estado ocupado.'),
      ],
    },
    afterBoss: L('A Fragment down! We celebrate the only way I know: by melting things.', '¡Un Fragmento menos! Celebremos como sé hacerlo: fundiendo cosas.'),
    lowLives: L("You're cooling off, Caster. Let's warm your dice before you go.", 'Te estás enfriando, Lanzador. Calentemos tus dados antes de que te vayas.'),
    loreAt: [2, 4, 7, 11],
    lore: [
      L(
        "Fire was the first piece of the Primordial to break free. It's been restless ever since. So am I.",
        'El Fuego fue el primer pedazo del Primordial en liberarse. Ha estado inquieto desde entonces. Yo también.',
      ),
      L(
        'The Fusion Forge is older than me. The first Casters used it to glue elements back together, but only a little. Only in dice.',
        'La Forja de Fusión es más vieja que yo. Los primeros Lanzadores la usaban para volver a unir elementos, pero solo un poco. Solo en dados.',
      ),
      L(
        'Lightning, Magma, Steam. Every fusion is a tiny Primordial. Tame, though. Mostly.',
        'Relámpago, Magma, Vapor. Cada fusión es un pequeño Primordial. Domado, eso sí. Casi siempre.',
      ),
      L('They say the Primordial burns without fire. If you meet it, roll hot.', 'Dicen que el Primordial arde sin fuego. Si lo encuentras, tira con fuerza.'),
    ],
  },

  nix: {
    id: 'nix',
    name: L('Nix', 'Nix'),
    title: L('Dealer in the dark', 'Comerciante de las sombras'),
    intro: L(
      "Shh. You didn't see me. I'm Nix, and my deals cost more than Shards.",
      'Shh. No me viste. Soy Nix, y mis tratos cuestan más que Fragmentos.',
    ),
    greet: {
      stranger: [
        L('Everything has a price. Mine are just honest about it.', 'Todo tiene un precio. Los míos solo son honestos.'),
        L('One deal. Take it or walk away. Both are choices.', 'Un trato. Tómalo o vete. Las dos son decisiones.'),
      ],
      regular: [
        L('You again. You like risk. I like you.', 'Tú otra vez. Te gusta el riesgo. Me gustas.'),
        L("I keep a list of people who pay. You're on it. That's good.", 'Llevo una lista de quienes pagan. Estás en ella. Eso es bueno.'),
      ],
      friend: [
        L('Between us? The Fragments buy from me too. I sell them the same bad deals.', '¿Entre nos? Los Fragmentos también me compran. Les vendo los mismos malos tratos.'),
        L('For you, a discount. On the regret, not the price.', 'Para ti, un descuento. En el arrepentimiento, no en el precio.'),
      ],
    },
    afterBoss: L("A Fragment fell and you're still standing. That's worth something.", 'Cayó un Fragmento y sigues en pie. Eso vale algo.'),
    // Allegiance (EXPANSION.md B3, B1): what Nix says about your pacts, about
    // Aeris, and about where your run is leaning. Drafts for Carlos.
    special: {
      betrayal: L(
        "She blessed you? How sweet. Let's find out how much that blessing is worth to you.",
        '¿Ella te bendijo? Qué tierno. Veamos cuánto vale esa bendición para ti.',
      ),
      claimed: L("She won't come for you anymore. Only I will. Isn't that nice?", 'Ella ya no vendrá por ti. Solo yo. ¿No es bonito?'),
      more: L('Back again. Good. The Primordial remembers everyone who helps it.', 'Otra vez aquí. Bien. El Primordial recuerda a todos los que lo ayudan.'),
      leanPrimordial: L("You hear it too, don't you? It has been calling you home.", 'Tú también lo oyes, ¿verdad? Lleva tiempo llamándote a casa.'),
      leanSplit: L('Still clinging to the pieces? The Split never lasts, Caster.', '¿Sigues aferrado a los pedazos? La División nunca dura, Lanzador.'),
      // Past the door: the eclipse market (H6).
      firmament: L(
        'Welcome to the eclipse market. No more hiding in alleys. Up here I sell under a black sun, and everyone pays.',
        'Bienvenido al mercado del eclipse. Ya no me escondo en callejones. Aquí arriba vendo bajo un sol negro, y todos pagan.',
      ),
    },
    lowLives: L("You're low. That makes the deal sweeter. For me.", 'Te queda poco. Eso hace el trato más dulce. Para mí.'),
    loreAt: [2, 4, 7, 11],
    lore: [
      L('Air goes everywhere and belongs nowhere. So do I.', 'El Aire va a todas partes y no pertenece a ninguna. Igual que yo.'),
      L(
        'The Primordial whispers to anyone who listens. I listened once. That is how I learned what a life is worth.',
        'El Primordial le susurra a quien escuche. Yo escuché una vez. Así aprendí cuánto vale una vida.',
      ),
      L(
        'Tobb thinks the Roads are safe. The Roads were built by the Fragments. Before they were Fragments.',
        'Tobb cree que los Caminos son seguros. Los Caminos los construyeron los Fragmentos. Antes de ser Fragmentos.',
      ),
      L(
        'If the Primordial reforms, every deal ever made comes due at once. I plan to be elsewhere.',
        'Si el Primordial se rehace, todos los tratos vencen a la vez. Pienso estar en otro lado.',
      ),
    ],
  },

  aeris: {
    id: 'aeris',
    name: L('Aeris', 'Aeris'),
    title: L('Voice of the shrine', 'Voz del santuario'),
    intro: L(
      'Rest, Caster. I am Aeris. The wind brings me the whispers of the Fragments, and I bring them to you.',
      'Descansa, Lanzador. Soy Aeris. El viento me trae los susurros de los Fragmentos, y yo te los traigo a ti.',
    ),
    greet: {
      stranger: [
        L('Take a blessing, or take a warning. Both are free.', 'Toma una bendición, o toma una advertencia. Las dos son gratis.'),
        L('The wind is quiet here. Breathe.', 'Aquí el viento está en calma. Respira.'),
      ],
      regular: [
        L('The wind speaks of you now. It says you are stubborn.', 'El viento ya habla de ti. Dice que eres terco.'),
        L('Welcome back to stillness.', 'Bienvenido de vuelta a la calma.'),
      ],
      friend: [
        L('I have prayed for you on every Road. Keep walking.', 'He rezado por ti en cada Camino. Sigue andando.'),
        L('You have given the wind a new story. Thank you.', 'Le diste al viento una historia nueva. Gracias.'),
      ],
    },
    afterBoss: L('One Fragment sleeps again. The wind is lighter for it.', 'Un Fragmento vuelve a dormir. El viento está más ligero.'),
    // Allegiance (B3, B1): Aeris senses your pacts with Nix, and your lean.
    special: {
      strange: L(
        'Something is strange about you. My blessings will cost you Shards now.',
        'Hay algo extraño en ti. Ahora mis bendiciones te costarán Fragmentos.',
      ),
      shadow: L('You carry a shadow. I can still help, for a price.', 'Llevas una sombra. Aún puedo ayudarte, a cambio de algo.'),
      leanSplit: L('The pieces hold because of Casters like you. Thank you.', 'Los pedazos se sostienen gracias a Lanzadores como tú. Gracias.'),
      leanPrimordial: L(
        'Your dice hum with something very old. Be careful what you help become whole.',
        'Tus dados zumban con algo muy antiguo. Cuidado con lo que ayudas a volver a ser uno.',
      ),
      // Past the door: Aeris in her true form (H6).
      firmament: L(
        'Here the wind is not a messenger. It is me, all of me. Ask, Caster, and the sky will answer.',
        'Aquí el viento no es un mensajero. Soy yo, toda yo. Pide, Lanzador, y el cielo responderá.',
      ),
    },
    lowLives: L('Your breath is short. Let me lend you some of mine.', 'Te falta el aliento. Déjame prestarte un poco del mío.'),
    loreAt: [2, 4, 7, 11],
    lore: [
      L('Before the Split there was no sky and no ground, only the Primordial, dreaming.', 'Antes de la División no había cielo ni suelo, solo el Primordial, soñando.'),
      L(
        'The Casters did not want to break it. They broke it because its dream was ending everything else.',
        'Los Lanzadores no querían romperlo. Lo rompieron porque su sueño estaba acabando con todo lo demás.',
      ),
      L("Pip remembers that dream. Ask it someday. It won't answer, but it will glow.", 'Pip recuerda ese sueño. Pregúntale algún día. No te contestará, pero brillará.'),
      L(
        'Each run you walk is a prayer. Each Fragment you defeat keeps the world split, and so, alive.',
        'Cada partida que recorres es una plegaria. Cada Fragmento que vences mantiene el mundo dividido, y por eso, vivo.',
      ),
    ],
  },

  // --- The Firmament's keepers (EXPANSION.md H6). All drafts. ---
  atlas: {
    id: 'atlas',
    name: L('Atlas', 'Atlas'),
    title: L('Cartographer', 'Cartógrafo'),
    intro: L(
      'Mind the ink, it is still wet. I am Atlas. I draw the Roads up here, and sometimes the Roads agree with me.',
      'Cuidado con la tinta, todavía está fresca. Soy Atlas. Dibujo los Caminos aquí arriba, y a veces los Caminos me hacen caso.',
    ),
    greet: {
      stranger: [
        L('Every map is a promise. Mine are mostly kept.', 'Todo mapa es una promesa. Los míos casi siempre se cumplen.'),
        L('Where to next? I can make it somewhere better.', '¿A dónde ahora? Puedo hacer que sea un lugar mejor.'),
      ],
      regular: [
        L('You walk my lines well. I drew this one with you in mind.', 'Recorres bien mis líneas. Dibujé esta pensando en ti.'),
        L('A Warden moved last night. I redrew three rows.', 'Un Custodio se movió anoche. Redibujé tres filas.'),
      ],
      friend: [
        L('I left a corner of every map blank for you. Fill it however you like.', 'Dejé una esquina de cada mapa en blanco para ti. Llénala como quieras.'),
        L('Sit. The stars can wait to be charted.', 'Siéntate. Las estrellas pueden esperar a ser trazadas.'),
      ],
    },
    afterBoss: L('A Warden fell? Then a border just moved. Give me a moment.', '¿Cayó un Custodio? Entonces una frontera acaba de moverse. Dame un momento.'),
    lowLives: L('You are running out of map, Caster. Let me draw you a shorter way.', 'Se te acaba el mapa, Lanzador. Déjame dibujarte un camino más corto.'),
    loreAt: [2, 4],
    lore: [
      L(
        'The Firmament is not a place. It is the frame around every place. The Wardens are its corners.',
        'El Firmamento no es un lugar. Es el marco alrededor de todos los lugares. Los Custodios son sus esquinas.',
      ),
      L(
        'There is a spot on every map I draw that will not take ink. A blank. I think something lives there.',
        'Hay un punto en cada mapa que dibujo que no acepta tinta. Un blanco. Creo que algo vive ahí.',
      ),
    ],
  },

  horologist: {
    id: 'horologist',
    name: L('The Horologist', 'El Relojero'),
    title: L('Keeper of the hours', 'Guardián de las horas'),
    intro: L(
      'You are four seconds late. Not to worry, I wound them back. I am the Horologist. Time is my trade.',
      'Llegas cuatro segundos tarde. No te preocupes, los rebobiné. Soy el Relojero. El tiempo es mi oficio.',
    ),
    greet: {
      stranger: [
        L('Tick. Tock. Buy something before the hour turns.', 'Tic. Tac. Compra algo antes de que cambie la hora.'),
        L('Every die rolls in time. Mine roll twice.', 'Todo dado rueda en el tiempo. Los míos ruedan dos veces.'),
      ],
      regular: [
        L('Back again, at exactly the right moment. As usual.', 'De vuelta, en el momento exacto. Como siempre.'),
        L('I have been expecting you since tomorrow.', 'Te esperaba desde mañana.'),
      ],
      friend: [
        L('For you I stopped every clock in the shop. Take your time. Literally.', 'Por ti detuve todos los relojes de la tienda. Tómate tu tiempo. Literalmente.'),
        L('We have met before. You just have not got there yet.', 'Ya nos conocemos. Solo que tú todavía no has llegado ahí.'),
      ],
    },
    afterBoss: L('The Clockwork? A crude design. Mine are better. Do not tell it I said so.', '¿El Mecanismo? Un diseño tosco. Los míos son mejores. No le digas que lo dije.'),
    lowLives: L('Your time is short. I can sell you a little more of it.', 'Te queda poco tiempo. Puedo venderte un poco más.'),
    loreAt: [2, 3, 4, 5, 6],
    lore: [
      L(
        'Kairos is the right moment. Chrono is every moment. The Casters only ever had the first.',
        'Kairós es el momento justo. Crono es todo momento. Los Lanzadores solo tuvieron el primero.',
      ),
      L(
        'Before the Split there was no time, only the dream. Time is what the pieces do while they wait.',
        'Antes de la División no había tiempo, solo el sueño. El tiempo es lo que hacen los pedazos mientras esperan.',
      ),
      L(
        'I keep six things on the shelf and sell three of them. Which three depends on the minute you arrive. Do not ask me which minute.',
        'Guardo seis cosas en el estante y vendo tres. Cuáles, depende del minuto en que llegues. No me preguntes qué minuto.',
      ),
      L(
        'A Pulsar is a star that learned to count. Everything in this shop is just another way of counting.',
        'Un Púlsar es una estrella que aprendió a contar. Todo en esta tienda es otra manera de contar.',
      ),
      L(
        'The Mainspring is the oldest thing I own. It was in the first clock, the one that wound the dream.',
        'El Resorte Maestro es lo más antiguo que tengo. Estaba en el primer reloj, el que dio cuerda al sueño.',
      ),
    ],
  },

  seren: {
    id: 'seren',
    name: L('Seren', 'Seren'),
    title: L('The astronomer', 'La astrónoma'),
    intro: L(
      'Quiet, please, the sky is thinking. I am Seren. I chart the shapes the stars make when nobody is rolling anything.',
      'Silencio, por favor, el cielo está pensando. Soy Seren. Dibujo las formas que hacen las estrellas cuando nadie tira nada.',
    ),
    greet: {
      stranger: [
        L('Every reaction is a star you have not drawn yet. Buy one.', 'Cada reacción es una estrella que aún no has dibujado. Compra una.'),
        L('Look up. No, further. There.', 'Mira arriba. No, más lejos. Ahí.'),
      ],
      regular: [
        L('Your stars are coming along nicely. Mind the glare.', 'Tus estrellas van muy bien. Cuidado con el resplandor.'),
        L('I saved you a good one. It fell this morning.', 'Te guardé una buena. Cayó esta mañana.'),
      ],
      friend: [
        L('For you I leave the lens uncovered. Do not tell the Wardens.', 'Para ti dejo la lente destapada. No se lo digas a los Custodios.'),
        L('You and I have charted half this sky. The other half is shy.', 'Tú y yo hemos trazado medio cielo. La otra mitad es tímida.'),
      ],
    },
    afterBoss: L('A Warden down. The sky is a little wider tonight.', 'Un Custodio menos. El cielo es un poco más ancho esta noche.'),
    lowLives: L('You are burning low. Take a star, it keeps longer than a heart.', 'Te estás apagando. Toma una estrella, dura más que un corazón.'),
    loreAt: [2, 4, 6],
    lore: [
      L(
        'A Constellation is just a habit the stars picked up. Feed a habit often enough and it becomes a law.',
        'Una Constelación es solo una costumbre que las estrellas adoptaron. Alimenta una costumbre bastante y se vuelve ley.',
      ),
      L(
        'The Black Hole is not a star. It is where the sky keeps what it has not decided about yet.',
        'El Agujero Negro no es una estrella. Es donde el cielo guarda lo que todavía no ha decidido.',
      ),
      L(
        'Atlas draws where the Roads go. I draw why. We do not speak much, the maps get crowded.',
        'Atlas dibuja adónde van los Caminos. Yo dibujo por qué. No hablamos mucho, los mapas se llenan.',
      ),
    ],
  },

  mote: {
    id: 'mote',
    name: L('Mote', 'Mote'),
    title: L('A speck of the Void', 'Una mota del Vacío'),
    // Mote does not talk until it has eaten enough (H7: its first words).
    intro: L('...', '...'),
    greet: {
      stranger: [L('...', '...'), L('(it stares at your dice)', '(mira fijamente tus dados)')],
      regular: [L('(it opens its mouth, hopefully)', '(abre la boca, esperanzado)'), L('more?', '¿más?')],
      friend: [L('you came back. you always bring food.', 'volviste. siempre traes comida.'), L('i remember you. i remember everything you fed me.', 'te recuerdo. recuerdo todo lo que me diste.')],
    },
    afterBoss: L('(it licks its lips)', '(se relame)'),
    lowLives: L('(it looks at you, a little worried)', '(te mira, un poco preocupado)'),
    loreAt: [5],
    lore: [L('before the first word there was nothing. i was the nothing. now i am a little something.', 'antes de la primera palabra no había nada. yo era la nada. ahora soy un poco de algo.')],
  },

  // The Aether Bazaar is hosted by every keeper at once.
  conclave: {
    id: 'conclave',
    name: L('The Wanderers', 'Los Errantes'),
    title: L('Every keeper, one crossroads', 'Todos los guardianes, un cruce'),
    intro: L(
      'Tobb: "Surprise! Once in a long while all of us set up at the same crossroads." Vessa: "It was my idea." Nix: "It was not."',
      'Tobb: "¡Sorpresa! Muy de vez en cuando nos instalamos todos en el mismo cruce." Vessa: "Fue idea mía." Nix: "No lo fue."',
    ),
    greet: {
      stranger: [
        L('The Aether Bazaar is open! Every keeper, every stall, every discount.', '¡El Bazar del Éter está abierto! Todos los guardianes, todos los puestos, todos los descuentos.'),
      ],
      regular: [
        L('Tobb: "Best prices on the Road." Brasa: "Best heat." Nix: "Best regrets."', 'Tobb: "Los mejores precios del Camino." Brasa: "El mejor calor." Nix: "Los mejores arrepentimientos."'),
      ],
      friend: [
        L('Aeris: "Look who it is." The Curator: "We saved you a stall."', 'Aeris: "Miren quién llegó." El Curador: "Te guardamos un puesto."'),
      ],
    },
    afterBoss: L('Brasa: "A Fragment down! Drinks are on Tobb." Tobb: "They are not."', 'Brasa: "¡Un Fragmento menos! Tobb invita." Tobb: "No invito."'),
    lowLives: L('Vessa: "You look awful." Aeris: "Kindly, she means: rest here."', 'Vessa: "Te ves horrible." Aeris: "Con cariño, quiere decir: descansa aquí."'),
    loreAt: [2, 3],
    lore: [
      L(
        'Aeris: "When all the Wanderers meet, the Road remembers it was once one thing too."',
        'Aeris: "Cuando todos los Errantes se reúnen, el Camino recuerda que también fue una sola cosa."',
      ),
      L(
        'The Curator: "We always gather before the last Circle. Even keepers want to see how the story ends."',
        'El Curador: "Siempre nos reunimos antes del último Círculo. Hasta los guardianes quieren ver cómo termina la historia."',
      ),
    ],
  },
}

export const KEEPER_IDS = Object.keys(KEEPERS)

// Relationship tiers by total visits on this file.
export function keeperTier(visits) {
  if (visits >= 10) return 'friend'
  if (visits >= 4) return 'regular'
  return 'stranger'
}
