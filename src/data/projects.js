export const projects = [
  {
    slug: 'tiger-price',
    title: 'Tiger Price',
    role: { en: 'Lead Full-Stack Developer', es: 'Desarrollador Full-Stack Principal' },
    period: { en: 'Jul 2025 – Present', es: 'Jul 2025 – Presente' },
    tagline: {
      en: 'A dairy & grocery delivery marketplace for Mexico City, built and run solo, storefront to admin dashboard.',
      es: 'Un mercado de entrega de lácteos y abarrotes para la Ciudad de México, construido y operado en solitario, desde el escaparate hasta el panel de administración.',
    },
    tech: ['React', 'Vite', 'Firebase', 'Stripe'],
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
        'Went from zero to a production storefront alone — no team, no template',
        'Real money moves through it: full Stripe checkout, not a demo cart',
        'Owns the entire stack: storefront, inventory, auth, and admin in one codebase',
      ],
      es: [
        'Pasó de cero a una tienda en producción, completamente solo — sin equipo, sin plantilla',
        'Dinero real fluye a través de ella: pago completo con Stripe, no un carrito de demostración',
        'Cubre todo el stack: escaparate, inventario, autenticación y administración en un solo código',
      ],
    },
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
          en: 'The homepage surfaces your active order status, free-shipping progress, and weekly picks the moment you land — not buried behind a menu.',
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
          en: "Cart, shipping-address selection, and a Stripe-backed payment step with live subtotal, shipping, and tax math — not a static mockup.",
          es: 'Carrito, selección de dirección de envío y un paso de pago respaldado por Stripe con cálculo en vivo de subtotal, envío e impuestos — no una maqueta estática.',
        },
        image: '/screenshots/tiger-price-checkout.png',
      },
      {
        eyebrow: { en: 'FULFILLMENT', es: 'CUMPLIMIENTO' },
        headline: { en: 'An order pipeline, not a spinner.', es: 'Un flujo de pedido, no solo una rueda de carga.' },
        body: {
          en: 'Every order moves through a real multi-step pipeline — payment, stock validation, order creation — with status the customer can actually follow.',
          es: 'Cada pedido pasa por un flujo real de varios pasos — pago, validación de stock, creación del pedido — con un estado que el cliente puede seguir de verdad.',
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
          en: "Customers can cancel within a live countdown window and a required reason — validated server-side so the rule can't be bypassed from the client.",
          es: 'Los clientes pueden cancelar dentro de una ventana con cuenta regresiva en vivo y un motivo obligatorio — validado del lado del servidor para que la regla no se pueda evadir desde el cliente.',
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
          en: 'A full About/mission/vision page, an FAQ covering shipping and returns, and a working contact form — the parts that make a storefront feel trustworthy, not just functional.',
          es: 'Una página completa de Nosotros/misión/visión, un FAQ que cubre envíos y devoluciones, y un formulario de contacto funcional — las partes que hacen que un escaparate se sienta confiable, no solo funcional.',
        },
        image: '/screenshots/tiger-price-about.png',
      },
    ],
    securityNotes: {
      en: [
        'Firebase security rules scope every read/write to its owning user — no client can reach another customer\'s orders, addresses, or profile data.',
        'Card data never touches the app\'s own servers: Stripe handles payment collection end-to-end, keeping PCI scope off this codebase entirely.',
        'The order-cancellation window is a server-enforced rule, not a UI courtesy — a request after the cutoff is rejected regardless of what the client sends.',
        'Inventory and fulfillment tooling live behind a separate authenticated admin role, isolated from the public storefront surface shown here.',
      ],
      es: [
        'Las reglas de seguridad de Firebase limitan cada lectura/escritura a su propio usuario — ningún cliente puede acceder a los pedidos, direcciones o datos de perfil de otro.',
        'Los datos de tarjeta nunca tocan los servidores propios de la app: Stripe gestiona el cobro de principio a fin, dejando el alcance PCI totalmente fuera de este código.',
        'La ventana de cancelación de pedidos es una regla aplicada por el servidor, no una cortesía de la interfaz — una solicitud después del límite se rechaza sin importar lo que envíe el cliente.',
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
        'Co-founded it — not just an engineer, a decision-maker on product and business',
        'One Flutter codebase shipped to both iOS and Android from day one',
        'Built real in-app purchase and booking/payment flows, not just UI screens',
      ],
      es: [
        'Lo cofundó — no solo como ingeniero, sino como responsable de decisiones de producto y negocio',
        'Un solo código en Flutter lanzado a iOS y Android desde el primer día',
        'Construyó compras integradas y flujos reales de reserva/pago, no solo pantallas de interfaz',
      ],
    },
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
      en: 'A privacy-first fitness app: workout tracking, nutrition-label scanning, and a gamified "Body Rank" muscle-progression system — with zero cloud, zero accounts.',
      es: 'Una app de fitness centrada en la privacidad: seguimiento de entrenamientos, escaneo de etiquetas nutricionales y un sistema gamificado "Body Rank" de progresión muscular — sin nube, sin cuentas.',
    },
    tech: ['Flutter', 'Dart', 'SQLite', 'OCR'],
    stats: [
      { value: '13', label: { en: 'Muscle groups ranked', es: 'Grupos musculares clasificados' } },
      { value: '9', label: { en: 'Rank tiers per group', es: 'Niveles de rango por grupo' } },
      {
        value: '0',
        label: { en: 'Cloud services — fully local', es: 'Servicios en la nube — todo local' },
      },
    ],
    highlights: {
      en: [
        'Deliberately built with no backend at all — a real architectural stance, not a shortcut',
        'Shipped computer-vision-style OCR label scanning, not just manual data entry',
        'Designed an original gamification system (Body Rank) from scratch, not a copied template',
      ],
      es: [
        'Construida deliberadamente sin ningún backend — una postura arquitectónica real, no un atajo',
        'Implementó escaneo de etiquetas por OCR estilo visión por computadora, no solo captura manual de datos',
        'Diseñó un sistema de gamificación original (Body Rank) desde cero, no una plantilla copiada',
      ],
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
          en: 'Setup stays entirely on-device — the app says so directly in its own UI copy.',
          es: 'La configuración se mantiene completamente en el dispositivo — la propia app lo dice directamente en su interfaz.',
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
        'Built a fully local-first Flutter app — no backend, no accounts, no cloud sync by design',
        'Implemented barcode and OCR-based nutrition label scanning to log food and track calorie targets',
        'Shipped a workout tracker with an exercise library, tutorial videos, and medal/achievement tracking',
        'Designed "Body Rank," a gamified system that levels 13 muscle groups through 9 tiers based on real training volume',
        'Built a manual, no-cloud export/share system (and full data backup) so users control their own data end to end',
      ],
      es: [
        'Construyó una app en Flutter completamente local — sin backend, sin cuentas y sin sincronización en la nube, por diseño',
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
    role: {
      en: 'University of Michigan – Dearborn, ENGR 100 Team Project',
      es: 'Universidad de Michigan–Dearborn, Proyecto en equipo de ENGR 100',
    },
    period: { en: 'Fall 2025', es: 'Otoño 2025' },
    tagline: {
      en: 'A CAD-designed robot chassis with Arduino-driven autonomous navigation.',
      es: 'Un chasis de robot diseñado en CAD con navegación autónoma controlada por Arduino.',
    },
    tech: ['Arduino', 'C++', 'CAD'],
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
]

export const comingSoonProjects = [
  {
    title: 'Lucklike',
    tagline: {
      en: 'A game currently in development — the next project on deck. Details soon.',
      es: 'Un videojuego actualmente en desarrollo — el siguiente proyecto en la fila. Detalles pronto.',
    },
  },
]

export const stats = [
  {
    value: '2',
    label: { en: 'Engineering degrees in progress', es: 'Carreras de ingeniería en curso' },
  },
  { value: '4', label: { en: 'Shipped projects', es: 'Proyectos lanzados' } },
  { value: '3.38', label: { en: 'GPA', es: 'Promedio (GPA)' } },
  { value: '3', label: { en: 'Languages spoken', es: 'Idiomas hablados' } },
]
