export const projects = [
  {
    slug: 'tiger-price',
    title: 'Tiger Price',
    role: { en: 'Lead Full-Stack Developer', es: 'Desarrollador Full-Stack Principal' },
    period: { en: 'Jul 2025 – Aug 2026', es: 'Jul 2025 – Ago 2026' },
    tagline: {
      en: 'A dairy & grocery delivery marketplace for Mexico City, built and ran solo, storefront to admin dashboard.',
      es: 'Un mercado de entrega de lácteos y abarrotes para la Ciudad de México, construido y operado en solitario, desde el escaparate hasta el panel de administración.',
    },
    tech: ['React', 'Vite', 'Firebase', 'Stripe'],
    team: { en: 'Solo', es: 'En solitario' },
    platform: { en: 'Web', es: 'Web' },
    stats: [
      {
        value: '100%',
        label: { en: 'Features owned solo', es: 'Funcionalidades desarrolladas en solitario' },
      },
      { value: '4', label: { en: 'Core modules shipped', es: 'Módulos principales lanzados' } },
      {
        value: '2',
        label: { en: 'Payment & data integrations', es: 'Integraciones de pago y datos' },
      },
    ],
    highlights: {
      en: [
        'Went from zero to a production storefront alone. No team, no template',
        'Real money moves through it: full Stripe checkout, not a demo cart',
        'Owns the entire stack: storefront, inventory, auth, and admin in one codebase',
      ],
      es: [
        'Pasó de cero a una tienda en producción, completamente solo. Sin equipo, sin plantilla',
        'Dinero real fluye a través de ella: pago completo con Stripe, no un carrito de demostración',
        'Cubre todo el stack: escaparate, inventario, autenticación y administración en un solo código',
      ],
    },
    brand: { color: '#2e7d4f', mark: '/icons/tiger-price-mark.png' },
    screenType: 'browser',
    screens: [
      '/screenshots/tiger-price-home.png',
      '/screenshots/tiger-price-explore.png',
      '/screenshots/tiger-price-cart.png',
    ],
    features: [
      {
        eyebrow: { en: 'STOREFRONT', es: 'ESCAPARATE' },
        headline: { en: 'A storefront that feels alive.', es: 'Un escaparate que se siente vivo.' },
        body: {
          en: 'The homepage surfaces your active order status, free-shipping progress, and weekly picks the moment you land, not buried behind a menu.',
          es: 'La página de inicio muestra el estado de tu pedido activo, el progreso de envío gratis y los productos destacados de la semana desde que llegas, sin esconderlos detrás de un menú.',
        },
        image: '/screenshots/tiger-price-home.png',
      },
      {
        eyebrow: { en: 'DISCOVERY', es: 'DESCUBRIMIENTO' },
        headline: {
          en: 'Filter it down to exactly what you need.',
          es: 'Filtra hasta encontrar justo lo que necesitas.',
        },
        body: {
          en: 'Category filters, quick filters (best-sellers, on promotion, in stock), and live search across the full catalog.',
          es: 'Filtros por categoría, filtros rápidos (más vendidos, en promoción, en stock) y búsqueda en vivo sobre todo el catálogo.',
        },
        image: '/screenshots/tiger-price-explore.png',
      },
      {
        eyebrow: { en: 'CHECKOUT', es: 'PAGO' },
        headline: { en: 'Real money, real Stripe, real state.', es: 'Dinero real, Stripe real, estado real.' },
        body: {
          en: "Cart, shipping-address selection, and a Stripe-backed payment step with live subtotal, shipping, and tax math. Not a static mockup.",
          es: 'Carrito, selección de dirección de envío y un paso de pago respaldado por Stripe con cálculo en vivo de subtotal, envío e impuestos. No es una maqueta estática.',
        },
        image: '/screenshots/tiger-price-checkout.png',
      },
      {
        eyebrow: { en: 'FULFILLMENT', es: 'CUMPLIMIENTO' },
        headline: { en: 'An order pipeline, not a spinner.', es: 'Un flujo de pedido, no solo una rueda de carga.' },
        body: {
          en: 'Every order moves through a real multi-step pipeline (payment, stock validation, order creation) with status the customer can actually follow.',
          es: 'Cada pedido pasa por un flujo real de varios pasos (pago, validación de stock, creación del pedido) con un estado que el cliente puede seguir de verdad.',
        },
        image: '/screenshots/tiger-price-order-progress.png',
      },
      {
        eyebrow: { en: 'SUPPORT', es: 'SOPORTE' },
        headline: {
          en: 'Cancellation windows, enforced for real.',
          es: 'Ventanas de cancelación, aplicadas de verdad.',
        },
        body: {
          en: "Customers can cancel within a live countdown window and a required reason, validated server-side so the rule can't be bypassed from the client.",
          es: 'Los clientes pueden cancelar dentro de una ventana con cuenta regresiva en vivo y un motivo obligatorio, validado del lado del servidor para que la regla no se pueda evadir desde el cliente.',
        },
        image: '/screenshots/tiger-price-cancel-order.png',
      },
      {
        eyebrow: { en: 'TRUST', es: 'CONFIANZA' },
        headline: {
          en: 'It looks like a real company because it runs like one.',
          es: 'Parece una empresa real porque funciona como una.',
        },
        body: {
          en: 'A full About/mission/vision page, an FAQ covering shipping and returns, and a working contact form: the parts that make a storefront feel trustworthy, not just functional.',
          es: 'Una página completa de Nosotros/misión/visión, un FAQ que cubre envíos y devoluciones, y un formulario de contacto funcional: las partes que hacen que un escaparate se sienta confiable, no solo funcional.',
        },
        image: '/screenshots/tiger-price-about.png',
      },
    ],
    securityNotes: {
      en: [
        'Firebase security rules scope every read/write to its owning user, so no client can reach another customer\'s orders, addresses, or profile data.',
        'Card data never touches the app\'s own servers: Stripe handles payment collection end-to-end, keeping PCI scope off this codebase entirely.',
        'The order-cancellation window is a server-enforced rule, not a UI courtesy. A request after the cutoff is rejected regardless of what the client sends.',
        'Inventory and fulfillment tooling live behind a separate authenticated admin role, isolated from the public storefront surface shown here.',
      ],
      es: [
        'Las reglas de seguridad de Firebase limitan cada lectura/escritura a su propio usuario, así que ningún cliente puede acceder a los pedidos, direcciones o datos de perfil de otro.',
        'Los datos de tarjeta nunca tocan los servidores propios de la app: Stripe gestiona el cobro de principio a fin, dejando el alcance PCI totalmente fuera de este código.',
        'La ventana de cancelación de pedidos es una regla aplicada por el servidor, no una cortesía de la interfaz. Una solicitud después del límite se rechaza sin importar lo que envíe el cliente.',
        'Las herramientas de inventario y cumplimiento viven detrás de un rol de administrador autenticado por separado, aislado de la superficie pública del escaparate que se muestra aquí.',
      ],
    },
    bullets: {
      en: [
        'Architected and built a full e-commerce platform from the ground up using React, Vite, and CSS',
        'Integrated Firebase for back-end services, including real-time database, authentication, and inventory management',
        'Implemented Stripe payment processing, enabling secure end-to-end online transactions',
        'Sole developer responsible for all platform features: storefront, product catalog, cart, checkout, and admin dashboard',
      ],
      es: [
        'Diseñó y construyó una plataforma de comercio electrónico completa desde cero usando React, Vite y CSS',
        'Integró Firebase para los servicios de back-end, incluyendo base de datos en tiempo real, autenticación y gestión de inventario',
        'Implementó el procesamiento de pagos con Stripe, permitiendo transacciones en línea seguras de principio a fin',
        'Único desarrollador responsable de todas las funciones de la plataforma: escaparate, catálogo de productos, carrito, checkout y panel de administración',
      ],
    },
  },
  {
    slug: 'tootor',
    title: 'Tootor',
    role: { en: 'Co-Founder & Lead Developer', es: 'Cofundador y Desarrollador Principal' },
    period: { en: 'Jan 2025 – Jun 2025', es: 'Ene 2025 – Jun 2025' },
    tagline: {
      en: 'An Uber-style on-demand tutoring marketplace, built cross-platform with Flutter.',
      es: 'Un mercado de tutorías a demanda estilo Uber, construido multiplataforma con Flutter.',
    },
    tech: ['Flutter', 'Dart', 'Firebase'],
    team: { en: 'Co-founding team', es: 'Equipo cofundador' },
    platform: { en: 'iOS & Android', es: 'iOS y Android' },
    stats: [
      {
        value: '2',
        label: { en: 'Platforms (iOS & Android)', es: 'Plataformas (iOS y Android)' },
      },
      { value: '1', label: { en: 'Codebase, cross-platform', es: 'Código único, multiplataforma' } },
      { value: '6mo', label: { en: 'Zero to near-launch', es: 'De cero a casi lanzado' } },
    ],
    highlights: {
      en: [
        'Co-founded it: not just an engineer, but a decision-maker on product and business',
        'One Flutter codebase shipped to both iOS and Android from day one',
        'Built real in-app purchase and booking/payment flows, not just UI screens',
      ],
      es: [
        'Lo cofundó: no solo como ingeniero, sino como responsable de decisiones de producto y negocio',
        'Un solo código en Flutter lanzado a iOS y Android desde el primer día',
        'Construyó compras integradas y flujos reales de reserva/pago, no solo pantallas de interfaz',
      ],
    },
    brand: { color: '#2196f3', tile: '#ffffff', mark: '/icons/tootor-mark.png' },
    screenType: 'phone',
    screens: ['/screenshots/tootor-welcome.png'],
    features: [
      {
        eyebrow: { en: 'FIRST IMPRESSION', es: 'PRIMERA IMPRESIÓN' },
        headline: { en: 'A clean front door.', es: 'Una puerta de entrada limpia.' },
        body: {
          en: 'The welcoming onboarding screen, with soft branding and clear sign-in/register paths.',
          es: 'La pantalla de bienvenida, con una identidad visual cuidada y rutas claras para iniciar sesión o registrarse.',
        },
        image: '/screenshots/tootor-welcome.png',
      },
      {
        eyebrow: { en: 'DISCOVERY', es: 'DESCUBRIMIENTO' },
        headline: { en: 'Every subject, one tap away.', es: 'Cada materia, a un toque de distancia.' },
        body: {
          en: 'Subject-category browsing (Math, Chemistry, English) plus tutor/subject search.',
          es: 'Navegación por categorías de materias (Matemáticas, Química, Inglés) además de búsqueda de tutores y materias.',
        },
        image: '/screenshots/tootor-explore.png',
      },
      {
        eyebrow: { en: 'PROGRESS', es: 'PROGRESO' },
        headline: { en: 'Tutoring, gamified.', es: 'Tutorías, gamificadas.' },
        body: {
          en: 'Medal-tier progress toward completed tutoring sessions, a class calendar, and featured tutors of the week.',
          es: 'Progreso por niveles de medallas hacia sesiones de tutoría completadas, un calendario de clases y los tutores destacados de la semana.',
        },
        image: '/screenshots/tootor-home.png',
      },
      {
        eyebrow: { en: 'ACCOUNT', es: 'CUENTA' },
        headline: {
          en: 'A real account system, not a mockup.',
          es: 'Un sistema de cuentas real, no una maqueta.',
        },
        body: {
          en: 'Profile editing, password changes, subscription management, notification settings, and payment methods.',
          es: 'Edición de perfil, cambio de contraseña, gestión de suscripción, configuración de notificaciones y métodos de pago.',
        },
        image: '/screenshots/tootor-profile.png',
      },
    ],
    bullets: {
      en: [
        'Co-founded a startup to build an Uber-style marketplace connecting students with online tutors',
        'Designed and developed the full cross-platform mobile app using Flutter, targeting both iOS and Android',
        'Architected in-app purchase functionality and tutor booking/payment flow',
        'Led all product design and development decisions; reached near-launch stage before halting due to funding constraints',
      ],
      es: [
        'Cofundó una startup para construir un mercado estilo Uber que conecta a estudiantes con tutores en línea',
        'Diseñó y desarrolló la aplicación móvil multiplataforma completa usando Flutter, para iOS y Android',
        'Diseñó la funcionalidad de compras integradas y el flujo de reserva/pago de tutores',
        'Lideró todas las decisiones de diseño y desarrollo del producto; alcanzó la etapa de casi lanzamiento antes de detenerse por falta de financiamiento',
      ],
    },
  },
  {
    slug: 'project-wellness',
    title: 'Project Wellness',
    role: { en: 'Solo Developer', es: 'Desarrollador en Solitario' },
    period: { en: 'In active development', es: 'En desarrollo activo' },
    tagline: {
      en: 'A privacy-first fitness app: workout tracking, nutrition-label scanning, and a gamified "Body Rank" muscle-progression system. Zero cloud, zero accounts.',
      es: 'Una app de fitness centrada en la privacidad: seguimiento de entrenamientos, escaneo de etiquetas nutricionales y un sistema gamificado "Body Rank" de progresión muscular. Sin nube, sin cuentas.',
    },
    tech: ['Flutter', 'Dart', 'SQLite', 'OCR'],
    team: { en: 'Solo', es: 'En solitario' },
    platform: { en: 'iOS & Android (Flutter)', es: 'iOS y Android (Flutter)' },
    stats: [
      { value: '13', label: { en: 'Muscle groups ranked', es: 'Grupos musculares clasificados' } },
      { value: '9', label: { en: 'Rank tiers per group', es: 'Niveles de rango por grupo' } },
      {
        value: '0',
        label: { en: 'Cloud services. Fully local', es: 'Servicios en la nube. Todo local' },
      },
    ],
    highlights: {
      en: [
        'Deliberately built with no backend at all: a real architectural stance, not a shortcut',
        'Shipped computer-vision-style OCR label scanning, not just manual data entry',
        'Designed an original gamification system (Body Rank) from scratch, not a copied template',
      ],
      es: [
        'Construida deliberadamente sin ningún backend: una postura arquitectónica real, no un atajo',
        'Implementó escaneo de etiquetas por OCR estilo visión por computadora, no solo captura manual de datos',
        'Diseñó un sistema de gamificación original (Body Rank) desde cero, no una plantilla copiada',
      ],
    },
    brand: {
      color: '#4f9a83',
      background: '/icons/project-wellness.png',
      mark: '/icons/project-wellness-mark.png',
    },
    screenType: 'phone',
    screens: ['/screenshots/project-wellness-onboarding.png'],
    apkUrl: 'https://github.com/CharlosXZD/Project-Wellness/releases/latest/download/ProjectWellness.apk',
    features: [
      {
        eyebrow: { en: 'PRIVACY', es: 'PRIVACIDAD' },
        headline: {
          en: 'No accounts. No cloud. No compromise.',
          es: 'Sin cuentas. Sin nube. Sin concesiones.',
        },
        body: {
          en: 'Setup stays entirely on-device, and the app says so directly in its own UI copy.',
          es: 'La configuración se mantiene completamente en el dispositivo, y la propia app lo dice directamente en su interfaz.',
        },
        image: '/screenshots/project-wellness-onboarding.png',
      },
      {
        eyebrow: { en: 'TRAINING', es: 'ENTRENAMIENTO' },
        headline: { en: 'Every rep, tracked.', es: 'Cada repetición, registrada.' },
        body: {
          en: 'A weight-trend chart plus Push/Pull/Legs workout logging.',
          es: 'Una gráfica de tendencia de peso junto con el registro de entrenamientos Push/Pull/Legs.',
        },
        image: '/screenshots/wellness-training.png',
      },
      {
        eyebrow: { en: 'NUTRITION', es: 'NUTRICIÓN' },
        headline: { en: "Scan it. Don't type it.", es: 'Escanéalo. No lo escribas.' },
        body: {
          en: 'OCR label scanning alongside manual calorie/macro tracking.',
          es: 'Escaneo de etiquetas por OCR junto con seguimiento manual de calorías y macros.',
        },
        image: '/screenshots/wellness-nutrition.png',
      },
      {
        eyebrow: { en: 'SCIENCE', es: 'CIENCIA' },
        headline: { en: 'Real numbers, not guesses.', es: 'Números reales, no suposiciones.' },
        body: {
          en: 'BMR/maintenance-calorie estimation with deficit/surplus/maintain goal presets.',
          es: 'Estimación de TMB/calorías de mantenimiento con opciones de déficit, superávit o mantenimiento.',
        },
        image: '/screenshots/wellness-goals-bmr.png',
      },
      {
        eyebrow: { en: 'STRUCTURE', es: 'ESTRUCTURA' },
        headline: { en: 'Train your way.', es: 'Entrena a tu manera.' },
        body: {
          en: 'Choose from Push Pull Legs, Upper/Lower, Full Body, Bro Split, Pilates, or a fully custom split.',
          es: 'Elige entre Push Pull Legs, Superior/Inferior, Cuerpo Completo, Bro Split, Pilates, o una rutina totalmente personalizada.',
        },
        image: '/screenshots/wellness-split.png',
      },
      {
        eyebrow: { en: 'LIBRARY', es: 'BIBLIOTECA' },
        headline: { en: 'An exercise library, built in.', es: 'Una biblioteca de ejercicios, integrada.' },
        body: {
          en: 'Searchable exercises by muscle group, each with a video demo.',
          es: 'Ejercicios buscables por grupo muscular, cada uno con un video demostrativo.',
        },
        image: '/screenshots/wellness-workout-builder.png',
      },
    ],
    bullets: {
      en: [
        'Built a fully local-first Flutter app: no backend, no accounts, no cloud sync by design',
        'Implemented barcode and OCR-based nutrition label scanning to log food and track calorie targets',
        'Shipped a workout tracker with an exercise library, tutorial videos, and medal/achievement tracking',
        'Designed "Body Rank," a gamified system that levels 13 muscle groups through 9 tiers based on real training volume',
        'Built a manual, no-cloud export/share system (and full data backup) so users control their own data end to end',
      ],
      es: [
        'Construyó una app en Flutter completamente local: sin backend, sin cuentas y sin sincronización en la nube, por diseño',
        'Implementó escaneo de etiquetas nutricionales por código de barras y OCR para registrar alimentos y seguir metas de calorías',
        'Lanzó un rastreador de entrenamientos con biblioteca de ejercicios, videos tutoriales y seguimiento de medallas/logros',
        'Diseñó "Body Rank", un sistema gamificado que sube de nivel 13 grupos musculares a través de 9 rangos según el volumen real de entrenamiento',
        'Construyó un sistema manual de exportación/compartición (y respaldo completo de datos) sin nube, para que los usuarios controlen sus propios datos de principio a fin',
      ],
    },
  },
  {
    slug: 'line-following-robot',
    title: 'Line-Following Robot',
    role: { en: 'CAD Design & Firmware', es: 'Diseño CAD y Firmware' },
    period: { en: 'Fall 2025', es: 'Otoño 2025' },
    tagline: {
      en: 'A CAD-designed robot chassis with Arduino-driven autonomous navigation.',
      es: 'Un chasis de robot diseñado en CAD con navegación autónoma controlada por Arduino.',
    },
    tech: ['Arduino', 'C++', 'CAD'],
    team: { en: 'ENGR 100 team, UM–Dearborn', es: 'Equipo de ENGR 100, UM–Dearborn' },
    platform: { en: 'Arduino hardware', es: 'Hardware Arduino' },
    stats: [
      { value: '1', label: { en: 'Custom-designed chassis', es: 'Chasis de diseño propio' } },
      {
        value: '2',
        label: { en: 'Navigation sensors integrated', es: 'Sensores de navegación integrados' },
      },
    ],
    highlights: {
      en: [
        'Ranked best in our lab section, out of all the teams',
        'Covered the full hardware pipeline: CAD design, assembly, and firmware in one project',
        'Wrote the autonomous navigation logic from scratch, not a pre-built library',
      ],
      es: [
        'Obtuvo el primer lugar en nuestra sección de laboratorio, entre todos los equipos',
        'Cubrió todo el proceso de hardware: diseño en CAD, ensamblaje y firmware en un solo proyecto',
        'Escribió la lógica de navegación autónoma desde cero, sin librerías preconstruidas',
      ],
    },
    model3d: '/models/line-following-robot.stl',
    brand: { color: '#ca6a04' },
    bullets: {
      en: [
        'Designed the full 3D model of the robot chassis using CAD software, optimizing for structure and weight',
        'Programmed the Arduino microcontroller to implement line-detection and autonomous navigation logic',
        'Assembled and integrated hardware components with custom firmware in a collaborative team setting',
      ],
      es: [
        'Diseñó el modelo 3D completo del chasis del robot usando software CAD, optimizando estructura y peso',
        'Programó el microcontrolador Arduino para implementar la detección de línea y la lógica de navegación autónoma',
        'Ensambló e integró los componentes de hardware con firmware personalizado en un entorno de trabajo en equipo',
      ],
    },
  },
  {
    slug: 'elementa',
    title: 'Elementa',
    // Shown on the homepage as its own playable card (components/GameCard.jsx),
    // so it's kept out of the regular project grid.
    hideFromGrid: true,
    role: { en: 'Solo Game Designer & Developer', es: 'Diseñador y Desarrollador de Juego en Solitario' },
    period: { en: '2026 · Playable alpha', es: '2026 · Alpha jugable' },
    tagline: {
      en: 'An elemental dice roguelite that runs in the browser. Roll, fuse, and chain reactions between neighboring dice to beat escalating targets across 15 rounds.',
      es: 'Un roguelite de dados elementales que corre en el navegador. Tira, fusiona y encadena reacciones entre dados vecinos para superar objetivos crecientes a lo largo de 15 rondas.',
    },
    tech: ['React', 'Framer Motion', 'Canvas', 'Web Audio', 'Tailwind CSS', 'Vite'],
    team: { en: 'Solo', es: 'En solitario' },
    platform: { en: 'Web (desktop & mobile browsers)', es: 'Web (navegadores de escritorio y móvil)' },
    playUrl: '/games/elementa',
    stats: [
      { value: '22', label: { en: 'Dice types, 4 sizes each', es: 'Tipos de dado, 4 tamaños cada uno' } },
      { value: '38', label: { en: 'Relics to build around', es: 'Reliquias para armar tu estrategia' } },
      { value: '0', label: { en: 'Image files. All art is drawn in code', es: 'Archivos de imagen. Todo el arte se dibuja en código' } },
    ],
    highlights: {
      en: [
        'Designed a full roguelite from a written design doc: economy, rarity, fusion tree, bosses, and progression',
        'Every sprite, die, and background is generated in code: rasterized pixel dice, canvas skies, and a CSS pixel UI kit',
        'A pure, data-driven scoring engine that explains itself: every point of Base and Mult is itemized on screen',
      ],
      es: [
        'Diseñó un roguelite completo a partir de un documento de diseño: economía, rareza, árbol de fusiones, jefes y progresión',
        'Cada sprite, dado y fondo se genera en código: dados en pixel art rasterizados, cielos en canvas y un kit de interfaz pixel en CSS',
        'Un motor de puntaje puro y basado en datos que se explica solo: cada punto de Base y Mult se detalla en pantalla',
      ],
    },
    brand: {
      color: '#6a4fd6',
      tile: '#1b1636',
      glyph: 'elementa',
    },
    screenType: 'browser',
    browserUrl: 'elementa.game',
    screens: [
      '/screenshots/elementa-table.png',
      '/screenshots/elementa-menu.png',
      '/screenshots/elementa-shop.png',
      '/screenshots/elementa-boss.png',
    ],
    features: [
      {
        eyebrow: { en: 'THE LOOP', es: 'EL CICLO' },
        headline: { en: 'Roll. Hold. Cast.', es: 'Tira. Guarda. Lanza.' },
        body: {
          en: 'Each round you roll a pool of elemental dice, hold the ones you like, reroll the rest, and cast to beat the target. Each element plays differently: Fire explodes on its max face, Water locks for free, Air builds sets, Earth never lets you down.',
          es: 'Cada ronda tiras un grupo de dados elementales, guardas los que te gustan, relanzas el resto y lanzas para superar el objetivo. Cada elemento se juega distinto: el Fuego explota en su cara máxima, el Agua se bloquea gratis, el Aire arma sets y la Tierra nunca falla.',
        },
        image: '/screenshots/elementa-table.png',
      },
      {
        eyebrow: { en: 'REACTIONS', es: 'REACCIONES' },
        headline: { en: 'Where a die sits matters.', es: 'Dónde está el dado importa.' },
        body: {
          en: 'Drag dice to reorder them. Neighbors react: Fire next to Air kindles for Mult, Water next to Earth blooms for Base. Fusion dice react as both parents, and placement dice like Mirror and Conduit turn the row into a puzzle.',
          es: 'Arrastra los dados para reordenarlos. Los vecinos reaccionan: Fuego junto a Aire aviva el Mult, Agua junto a Tierra florece en Base. Los dados de fusión reaccionan como ambos padres, y dados de posición como Espejo y Conducto convierten la fila en un rompecabezas.',
        },
        image: '/screenshots/elementa-reactions.png',
      },
      {
        eyebrow: { en: 'SCORING', es: 'PUNTAJE' },
        headline: { en: 'Every point, explained.', es: 'Cada punto, explicado.' },
        body: {
          en: 'The cast ledger itemizes every source of Base and Mult before you commit, then the reveal walks through it line by line: dice pop into Base, bonuses light up, Mult climbs, and the verdict slams in.',
          es: 'La cuenta del hechizo detalla cada fuente de Base y Mult antes de comprometerte, y luego la revelación la recorre línea por línea: los dados suman a la Base, los bonos se encienden, el Mult sube y llega el veredicto.',
        },
        image: '/screenshots/elementa-cast.png',
      },
      {
        eyebrow: { en: 'THE SHOP', es: 'LA TIENDA' },
        headline: { en: 'Build a run, not a hand.', es: 'Arma una partida, no una mano.' },
        body: {
          en: 'Spend Shards on new dice, relics, and consumables, or forge owned dice into fusions. Rarity is round-gated and offers are luck-based, so every run builds differently. Overscoring pays extra Shards.',
          es: 'Gasta Fragmentos en dados nuevos, reliquias y consumibles, o forja tus dados en fusiones. La rareza depende de la ronda y las ofertas son de suerte, así que cada partida se arma distinto. Superar el objetivo por mucho paga Fragmentos extra.',
        },
        image: '/screenshots/elementa-shop.png',
      },
      {
        eyebrow: { en: 'BOSSES', es: 'JEFES' },
        headline: { en: 'Twelve twists and a final boss.', es: 'Doce giros y un jefe final.' },
        body: {
          en: 'Every fifth round bends the rules: hidden faces, taxed rerolls, sealed relics. Harder twists join from round 10, and round 15 is Primordial, whose twist changes every time you reroll.',
          es: 'Cada quinta ronda cambia las reglas: caras ocultas, rerolls con impuesto, reliquias selladas. Giros más difíciles se suman desde la ronda 10, y la ronda 15 es Primordial, cuyo giro cambia cada vez que relanzas.',
        },
        image: '/screenshots/elementa-boss.png',
      },
      {
        eyebrow: { en: 'PROGRESSION', es: 'PROGRESIÓN' },
        headline: { en: 'Unlock, discover, complete.', es: 'Desbloquea, descubre, completa.' },
        body: {
          en: 'Eight starting loadouts and four difficulties unlock one win at a time. Everything you see in a run joins the Gallery, with a completion percentage to chase. Three autosave slots keep runs resumable.',
          es: 'Ocho equipos iniciales y cuatro dificultades se desbloquean victoria a victoria. Todo lo que ves en una partida entra a la Galería, con un porcentaje de progreso por completar. Tres espacios de autoguardado mantienen las partidas.',
        },
        image: '/screenshots/elementa-gallery.png',
      },
    ],
    bullets: {
      en: [
        'Designed the game end to end in a living design document: core loop, a 4-element fusion tree, a Shard economy with interest and overkill rewards, 5-tier rarity, and round-gated shop pools',
        'Built a pure, data-driven scoring engine in which relics and bosses are plain effect data, returning an itemized breakdown that powers the on-screen ledger and cast animation',
        'Implemented adjacency reactions and placement-based dice with drag-to-reorder, adding a spatial strategy layer to a dice game',
        'Generated all visuals in code: per-tier pixel dice rasterized from polygons, canvas backgrounds with dithering and particles, 29 pixel item sprites, and a CSS pixel UI kit',
        'Added persistent progression: autosave slots, unlockable loadouts and difficulties, a discovery gallery, and completion tracking',
        'Shipped bilingual EN/ES UI, keyboard controls, accessibility options (reduced motion, screen shake, scoring speed), and procedural Web Audio music and effects',
        'Directed an AI-assisted workflow with Claude Code for rapid iteration, verifying game logic with Node test scripts and browser playthroughs',
      ],
      es: [
        'Diseñó el juego de principio a fin en un documento de diseño vivo: ciclo principal, un árbol de fusión de 4 elementos, una economía de Fragmentos con interés y recompensas por exceso, rareza de 5 niveles y tienda limitada por ronda',
        'Construyó un motor de puntaje puro y basado en datos donde reliquias y jefes son datos de efecto, que devuelve un desglose detallado para la cuenta en pantalla y la animación de lanzamiento',
        'Implementó reacciones por adyacencia y dados de posición con arrastre para reordenar, sumando una capa de estrategia espacial a un juego de dados',
        'Generó todo el arte en código: dados pixel por tamaño rasterizados desde polígonos, fondos en canvas con dithering y partículas, 29 sprites pixel de objetos y un kit de interfaz pixel en CSS',
        'Agregó progresión persistente: espacios de autoguardado, equipos y dificultades desbloqueables, una galería de descubrimientos y seguimiento de progreso',
        'Lanzó interfaz bilingüe EN/ES, controles de teclado, opciones de accesibilidad (movimiento reducido, temblor de pantalla, velocidad de conteo) y música y efectos procedurales con Web Audio',
        'Dirigió un flujo de trabajo asistido por IA con Claude Code para iterar rápido, verificando la lógica del juego con scripts de prueba en Node y partidas en el navegador',
      ],
    },
  },
]

export const comingSoonProjects = [
  {
    title: 'Lucklike',
    tagline: {
      en: 'A game currently in development and the next project on deck. Details soon.',
      es: 'Un videojuego actualmente en desarrollo y el siguiente proyecto en la fila. Detalles pronto.',
    },
  },
]

export const stats = [
  {
    value: '2',
    label: { en: 'Engineering degrees in progress', es: 'Carreras de ingeniería en curso' },
  },
  { value: '5', label: { en: 'Shipped projects', es: 'Proyectos lanzados' } },
  { value: '3.38', label: { en: 'GPA', es: 'Promedio (GPA)' } },
  { value: '3', label: { en: 'Languages spoken', es: 'Idiomas hablados' } },
]
