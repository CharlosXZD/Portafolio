export const projects = [
  {
    slug: 'tiger-price',
    title: 'Tiger Price',
    role: { en: 'Lead Full-Stack Developer', es: 'Desarrollador Full-Stack Principal' },
    period: { en: 'Jul 2025 – Aug 2026', es: 'Jul 2025 – Ago 2026' },
    tagline: {
      en: 'A marketplace for Mexico City, built solo: storefront plus vendor, warehouse, courier and admin apps. Pre-launch and production ready.',
      es: 'Un marketplace para la Ciudad de México, construido en solitario: escaparate y apps de proveedor, almacén, repartidor y administración. Listo para producción, aún sin lanzar.',
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
        'Built a full marketplace alone, pre-launch and production ready. No team, no template',
        'Stripe-backed checkout with order and cancellation rules enforced on the server',
        'Owns the entire stack: storefront, inventory, auth, and admin in one codebase',
      ],
      es: [
        'Construyó un marketplace completo en solitario, listo para producción. Sin equipo, sin plantilla',
        'Pago con Stripe y reglas de pedido y cancelación validadas en el servidor',
        'Cubre todo el stack: escaparate, inventario, autenticación y administración en un solo código',
      ],
    },
    brand: { color: '#2e7d4f', mark: '/icons/tiger-price-mark.png' },
    stage: { bg: '#08170f' },
    glance: {
      different: { en: 'Five role apps in one codebase, with Mexican tax invoices built in.', es: 'Cinco apps por rol en un solo código, con facturas fiscales mexicanas integradas.' },
      features: {
        en: ['Customer storefront', 'Vendor app with three roles', 'Warehouse picking', 'Courier delivery tracking', 'Admin console', 'CFDI invoicing', 'Server-validated cancellations'],
        es: ['Tienda para clientes', 'App de vendedores con tres roles', 'Almacén y preparación de pedidos', 'Seguimiento de entregas', 'Consola de administración', 'Facturación CFDI', 'Cancelaciones validadas en el servidor'],
      },
    },
    story: [
      {
        type: 'hero',
        eyebrow: { en: 'A marketplace for Mexico City', es: 'Un marketplace para la Ciudad de México' },
        tagline: {
          en: 'Five apps, one codebase, built by one person. Pre-launch and production ready.',
          es: 'Cinco apps, un solo código, construido por una persona. Listo para producción, aún sin lanzar.',
        },
        chip: { en: 'Pre-launch · production ready', es: 'Aún sin lanzar · listo para producción' },
        image: '/projects/tiger-price/home.webp',
        alt: { en: 'The Tiger Price storefront home page', es: 'La página de inicio de la tienda Tiger Price' },
      },
      {
        type: 'statement',
        tone: 'dark',
        eyebrow: { en: 'THE SHAPE OF IT', es: 'LA FORMA' },
        text: {
          en: 'Behind every order, *five* apps work *together*.',
          es: 'Detrás de cada pedido, *cinco* apps trabajan *juntas*.',
        },
        body: {
          en: 'A storefront for customers, an app for vendors with three levels of permission, a warehouse picking app, a courier delivery app and an admin console, all sharing one codebase.',
          es: 'Una tienda para clientes, una app para vendedores con tres niveles de permiso, una app de almacén para preparar pedidos, una app de repartidores y una consola de administración, todas en un solo código.',
        },
      },
      {
        type: 'bento',
        tone: 'soft',
        eyebrow: { en: 'WHO USES IT', es: 'QUIÉN LA USA' },
        heading: { en: 'One platform, five different jobs.', es: 'Una plataforma, cinco trabajos distintos.' },
        tiles: [
          { kind: 'art', image: '/projects/tiger-price/explore.webp', caption: { en: 'The customer storefront', es: 'La tienda para clientes' }, span: 'col-span-2 row-span-2', position: 'left top' },
          { kind: 'text', eyebrow: { en: 'CUSTOMER', es: 'CLIENTE' }, headline: { en: 'Order, follow, receive.', es: 'Pide, sigue, recibe.' }, body: { en: 'Browse and filter, check out, follow the order, cancel in time, return something or ask for an invoice.', es: 'Explora y filtra, paga, sigue el pedido, cancela a tiempo, devuelve algo o pide tu factura.' }, span: 'col-span-2' },
          { kind: 'text', eyebrow: { en: 'VENDOR', es: 'VENDEDOR' }, headline: { en: 'Owner, Manager, Staff.', es: 'Dueño, Gerente, Staff.' }, body: { en: 'Each role sees what it needs: products and stock, orders, analytics, the team, and an audit of who changed what.', es: 'Cada rol ve lo que necesita: productos y stock, pedidos, analíticas, el equipo y una auditoría de quién cambió qué.' }, span: 'col-span-2' },
          { kind: 'text', eyebrow: { en: 'WAREHOUSE', es: 'ALMACÉN' }, headline: { en: 'Pick, pack, hand off.', es: 'Prepara, empaca, entrega.' }, body: { en: 'Global inventory, order preparation, courier assignment, returns approval and printable tickets.', es: 'Inventario global, preparación de pedidos, asignación de repartidor, aprobación de devoluciones y tickets imprimibles.' }, span: 'col-span-2' },
          { kind: 'text', eyebrow: { en: 'COURIER', es: 'REPARTIDOR' }, headline: { en: 'The route, in your hand.', es: 'La ruta, en tu mano.' }, body: { en: 'Accept or decline deliveries, order your route, confirm each drop and pick up returns.', es: 'Acepta o rechaza entregas, ordena tu ruta, confirma cada entrega y recoge devoluciones.' }, span: 'col-span-2' },
          { kind: 'text', eyebrow: { en: 'ADMIN', es: 'ADMINISTRADOR' }, headline: { en: 'The whole operation, in one console.', es: 'Toda la operación, en una consola.' }, body: { en: 'Users and roles, inventory, a marketing center, reports, order audits, the event log, shipping coverage, customer support and tax invoicing.', es: 'Usuarios y roles, inventario, un centro de marketing, reportes, auditoría de pedidos, registro de eventos, cobertura de envíos, soporte y facturación.' }, span: 'col-span-4' },
        ],
      },
      {
        type: 'rail',
        tone: 'dark',
        eyebrow: { en: 'THE ORDER JOURNEY', es: 'EL VIAJE DEL PEDIDO' },
        heading: { en: 'From the first click to the doorstep.', es: 'Del primer clic a la puerta de tu casa.' },
        cardWidth: 40,
        cards: [
          {
            eyebrow: { en: 'DISCOVER', es: 'DESCUBRE' },
            headline: { en: 'Filter it down to what you need.', es: 'Filtra hasta lo que necesitas.' },
            body: { en: 'Category filters, quick filters (best-sellers, on promotion, in stock) and live search across the catalog.', es: 'Filtros por categoría, filtros rápidos (más vendidos, en promoción, en stock) y búsqueda en vivo en todo el catálogo.' },
            image: '/projects/tiger-price/explore.webp',
            position: 'left top',
          },
          {
            eyebrow: { en: 'CART', es: 'CARRITO' },
            headline: { en: 'A cart that does the math.', es: 'Un carrito que hace las cuentas.' },
            body: { en: 'Shipping address, live subtotal, shipping and tax, and a progress bar toward free shipping.', es: 'Dirección de envío, subtotal, envío e impuestos en vivo, y una barra de progreso hacia el envío gratis.' },
            image: '/projects/tiger-price/cart.webp',
            position: 'center top',
          },
          {
            eyebrow: { en: 'CHECKOUT', es: 'PAGO' },
            headline: { en: 'Three steps, all visible.', es: 'Tres pasos, todos visibles.' },
            body: { en: 'Processing payment, validating stock, creating the order, shown as it happens. Stripe takes the card, so card data never touches the app\'s own servers.', es: 'Procesando pago, validando stock, creando la orden, mostrado mientras ocurre. Stripe cobra la tarjeta, así que los datos de tarjeta nunca tocan los servidores de la app.' },
            image: '/projects/tiger-price/order-progress.webp',
            position: 'center',
          },
          {
            eyebrow: { en: 'CANCEL', es: 'CANCELA' },
            headline: { en: 'A countdown the browser cannot bend.', es: 'Una cuenta regresiva que el navegador no puede evadir.' },
            body: { en: 'Customers can cancel while a live countdown runs, with a required reason. The window is validated on the server, so it cannot be bypassed from the client.', es: 'Los clientes pueden cancelar mientras corre una cuenta regresiva en vivo, con un motivo obligatorio. La ventana se valida en el servidor, así que no se puede evadir desde el cliente.' },
            image: '/projects/tiger-price/cancel-order.webp',
            position: 'center',
          },
        ],
      },
      {
        type: 'statement',
        tone: 'dark',
        eyebrow: { en: 'MADE FOR MEXICO', es: 'HECHO PARA MÉXICO' },
        text: {
          en: 'Real Mexican tax invoices, *built in*.',
          es: 'Facturas fiscales mexicanas *reales*, integradas.',
        },
        body: {
          en: 'CFDI invoicing with stamping through Facturapi and the SAT catalog shipped with the app, including cancelling an invoice with the SAT from the admin console.',
          es: 'Facturación CFDI con timbrado a través de Facturapi y el catálogo del SAT incluido en la app, incluso cancelar una factura ante el SAT desde la consola de administración.',
        },
      },
      {
        type: 'bento',
        tone: 'light',
        eyebrow: { en: 'BUILT TO RUN A BUSINESS', es: 'HECHO PARA OPERAR UN NEGOCIO' },
        heading: { en: 'The unglamorous parts, done properly.', es: 'Las partes poco vistosas, bien hechas.' },
        tiles: [
          { kind: 'text', eyebrow: { en: 'RETURNS AND SUPPORT', es: 'DEVOLUCIONES Y SOPORTE' }, headline: { en: 'When something goes wrong.', es: 'Cuando algo sale mal.' }, body: { en: 'Returns, support tickets and a message thread live inside the order, so nothing gets lost in an inbox.', es: 'Devoluciones, tickets de soporte y un hilo de mensajes viven dentro del pedido, para que nada se pierda en un correo.' }, span: 'col-span-2' },
          { kind: 'text', eyebrow: { en: 'IT DOCUMENTS ITSELF', es: 'SE DOCUMENTA SOLA' }, headline: { en: 'A manual for every role.', es: 'Un manual para cada rol.' }, body: { en: 'Searchable in-app manuals per role, and an error catalogue with codes like TP-AUTH-01, so support can say exactly what happened.', es: 'Manuales dentro de la app, con búsqueda, por rol, y un catálogo de errores con códigos como TP-AUTH-01, para que soporte diga exactamente qué pasó.' }, span: 'col-span-2' },
          { kind: 'stat', value: '5', eyebrow: { en: 'ROLE APPS', es: 'APPS POR ROL' }, label: { en: 'in one codebase', es: 'en un solo código' } },
          { kind: 'text', eyebrow: { en: 'DISCIPLINED', es: 'DISCIPLINADO' }, headline: { en: 'Shipped like a product.', es: 'Lanzado como un producto.' }, body: { en: 'A changelog, a versioning policy and a test suite, release after release.', es: 'Un changelog, una política de versiones y pruebas, versión tras versión.' }, span: 'col-span-2' },
          { kind: 'stat', value: '12', eyebrow: { en: 'RELEASES', es: 'VERSIONES' }, label: { en: 'in the changelog', es: 'en el changelog' }, bg: 'linear-gradient(160deg,#1f6f8a,#06202a)' },
        ],
      },
      {
        type: 'specs',
        tone: 'dark',
        eyebrow: { en: 'UNDER THE HOOD', es: 'POR DENTRO' },
        items: [
          { value: 'React 19', label: { en: 'with TypeScript and Vite', es: 'con TypeScript y Vite' } },
          { value: 'Firebase', label: { en: 'Firestore, Auth, Functions', es: 'Firestore, Auth, Functions' } },
          { value: 'Stripe', label: { en: 'payments', es: 'pagos' } },
          { value: '~25', label: { en: 'Firestore collections', es: 'colecciones de Firestore' } },
          { value: '418', label: { en: 'lines of security rules', es: 'líneas de reglas de seguridad' } },
          { value: '0.7.1', label: { en: 'latest release', es: 'última versión' } },
        ],
        note: {
          en: 'Pre-launch and production ready. The storefront shown runs on a test catalog. Built by one person.',
          es: 'Aún sin lanzar y listo para producción. La tienda mostrada usa un catálogo de prueba. Construido por una persona.',
        },
      },
      { type: 'glance', tone: 'light' },
    ],
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
        headline: { en: 'A checkout with the rules on the server.', es: 'Un pago con las reglas en el servidor.' },
        body: {
          en: "Cart, shipping-address selection, and a Stripe-backed payment step with live subtotal, shipping, and tax math. Not a static mockup.",
          es: 'Carrito, selección de dirección de envío y un paso de pago respaldado por Stripe con cálculo en vivo de subtotal, envío e impuestos. No es una maqueta estática.',
        },
        image: '/screenshots/tiger-price-checkout.png',
      },
      {
        eyebrow: { en: 'FULFILLMENT', es: 'ENTREGA' },
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
        'Diseñé y construí una plataforma de comercio electrónico completa desde cero usando React, Vite y CSS',
        'Integré Firebase para los servicios de back-end, incluyendo base de datos en tiempo real, autenticación y gestión de inventario',
        'Implementé el procesamiento de pagos con Stripe, permitiendo transacciones en línea seguras de principio a fin',
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
        'One Flutter codebase built for both iOS and Android from day one',
        'Booking runs end to end on a live backend and is ready to launch; only the payment step is mocked',
      ],
      es: [
        'Lo cofundó: no solo como ingeniero, sino como responsable de decisiones de producto y negocio',
        'Un solo código en Flutter pensado para iOS y Android desde el primer día',
        'La reserva funciona de principio a fin sobre un backend real y está lista para lanzar; solo el paso de pago es simulado',
      ],
    },
    brand: { color: '#2196f3', tile: '#ffffff', mark: '/icons/tootor-mark.png' },
    screenType: 'phone',
    screens: ['/screenshots/tootor-welcome.png'],
    stage: { bg: '#06172b' },
    glance: {
      different: { en: 'A complete booking flow on a live backend, ready to launch with only the payment step mocked.', es: 'Un flujo de reservas completo sobre un backend real, listo para lanzar con solo el pago simulado.' },
      features: {
        en: ['Browse by subject', 'Tutor availability calendar', 'Booking sheet', 'Student and tutor sides', 'Push notifications', 'Medal tiers'],
        es: ['Explorar por materia', 'Calendario de disponibilidad', 'Hoja de reserva', 'Lados de estudiante y tutor', 'Notificaciones push', 'Niveles de medalla'],
      },
    },
    story: [
      {
        type: 'hero',
        eyebrow: { en: 'A tutoring marketplace app', es: 'Una app de tutorías' },
        tagline: {
          en: 'Find a tutor. See when they are free. Book a class.',
          es: 'Encuentra un tutor. Mira cuándo está libre. Reserva una clase.',
        },
        chip: { en: 'Ready to launch · payments mocked', es: 'Lista para lanzar · pagos simulados' },
        phones: ['/projects/tootor/explore.webp', '/projects/tootor/availability.webp', '/projects/tootor/booking-sheet.webp'],
      },
      {
        type: 'statement',
        tone: 'dark',
        eyebrow: { en: 'THE IDEA', es: 'LA IDEA' },
        text: {
          en: 'Learning is easier when the *right* tutor is one *tap* away.',
          es: 'Aprender es más fácil cuando el tutor *indicado* está a un *toque*.',
        },
        body: {
          en: 'Students browse by subject, see real availability and book in a few taps. Tutors publish their time and run their classes from the same app.',
          es: 'Los estudiantes buscan por materia, ven disponibilidad real y reservan en pocos toques. Los tutores publican su tiempo y manejan sus clases desde la misma app.',
        },
      },
      {
        type: 'collage',
        tone: 'dark',
        eyebrow: { en: 'HOW IT WORKS', es: 'CÓMO FUNCIONA' },
        heading: { en: 'From curious to booked.', es: 'De la curiosidad a la reserva.' },
        items: [
          {
            eyebrow: { en: 'DISCOVER', es: 'DESCUBRE' },
            headline: { en: 'Find the right tutor.', es: 'Encuentra al tutor indicado.' },
            body: { en: 'Browse by subject (Mathematics, Chemistry, English), search by name or topic, and keep your favorites close.', es: 'Explora por materia (Matemáticas, Química, Inglés), busca por nombre o tema y guarda tus favoritos.' },
            image: '/projects/tootor/explore.webp',
          },
          {
            eyebrow: { en: 'AVAILABILITY', es: 'DISPONIBILIDAD' },
            headline: { en: 'See when they are free.', es: 'Mira cuándo están libres.' },
            body: { en: 'Tutors publish their calendar slots. Students see a month view with the open days marked, pick a day and choose a time.', es: 'Los tutores publican sus horarios. Los estudiantes ven un calendario del mes con los días libres marcados, eligen un día y un horario.' },
            image: '/projects/tootor/availability.webp',
          },
          {
            eyebrow: { en: 'BOOK', es: 'RESERVA' },
            headline: { en: 'Book in a few taps.', es: 'Reserva en pocos toques.' },
            body: { en: 'Pick a specific topic, say what you need help with and confirm a booking sheet with the date, time, subject and price.', es: 'Elige un tema específico, cuenta en qué necesitas ayuda y confirma una hoja de reserva con fecha, hora, materia y precio.' },
            image: '/projects/tootor/booking-sheet.webp',
          },
          {
            eyebrow: { en: 'PAYMENT', es: 'PAGO' },
            headline: { en: 'Payment, honestly mocked.', es: 'El pago, simulado con honestidad.' },
            body: { en: 'The payment step is a mockup, so nothing real is charged. Everything around it works end to end, and wiring a real payment processor is the last piece before launch.', es: 'El paso de pago es una maqueta, así que no se cobra nada real. Todo lo demás funciona de principio a fin, y conectar un procesador de pagos real es la última pieza antes de lanzar.' },
            image: '/projects/tootor/mock-payment.webp',
          },
        ],
      },
      {
        type: 'note',
        tone: 'dark',
        eyebrow: { en: 'A PERSONAL NOTE', es: 'UNA NOTA PERSONAL' },
        headline: { en: 'The one that started it all.', es: 'La que lo empezó todo.' },
        paragraphs: {
          en: [
            'Tootor was my first big project. It is the one that made me start coding more seriously, and the layout that everything I built afterwards grew from.',
            'I started it with one of my best friends from back home. We built it from scratch, learning as we went, and it taught me what it takes to turn an idea into a real app.',
            'It is not the biggest thing I have made, but it is the one I hold closest.',
          ],
          es: [
            'Tootor fue mi primer proyecto grande. Es el que me hizo empezar a programar más en serio, y la base de la que creció todo lo que construí después.',
            'Lo empecé con uno de mis mejores amigos de mi tierra. Lo construimos desde cero, aprendiendo sobre la marcha, y me enseñó lo que hace falta para convertir una idea en una app real.',
            'No es lo más grande que he hecho, pero sí lo que guardo más cerca.',
          ],
        },
      },
      {
        type: 'bento',
        tone: 'light',
        eyebrow: { en: 'WHAT IS INSIDE', es: 'QUÉ HAY ADENTRO' },
        heading: { en: 'More than a booking screen.', es: 'Más que una pantalla de reservas.' },
        tiles: [
          { kind: 'phone', image: '/projects/tootor/welcome.webp', caption: { en: 'The welcome screen', es: 'La pantalla de bienvenida' }, span: 'row-span-2', bg: 'linear-gradient(170deg,#2196f3,#06172b)' },
          { kind: 'text', eyebrow: { en: 'TWO SIDES', es: 'DOS LADOS' }, headline: { en: 'A student app and a tutor app.', es: 'Una app de estudiantes y una de tutores.' }, body: { en: 'Tutors manage their availability, classes and earnings. Students discover, book and keep track of their classes.', es: 'Los tutores manejan su disponibilidad, clases y ganancias. Los estudiantes descubren, reservan y siguen sus clases.' }, span: 'col-span-2' },
          { kind: 'stat', value: '1', eyebrow: { en: 'CODEBASE', es: 'CÓDIGO' }, label: { en: 'Flutter, for iOS and Android', es: 'Flutter, para iOS y Android' } },
          { kind: 'text', eyebrow: { en: 'BUILT ON FIREBASE', es: 'CONSTRUIDA SOBRE FIREBASE' }, headline: { en: 'Real accounts, real bookings.', es: 'Cuentas reales, reservas reales.' }, body: { en: 'Email-verified accounts, bookings stored in Firestore and push-notification plumbing, running against a live backend.', es: 'Cuentas con verificación por correo, reservas guardadas en Firestore y notificaciones push, funcionando sobre un backend real.' }, span: 'col-span-2' },
          { kind: 'stat', value: '2025', eyebrow: { en: 'STARTED', es: 'INICIO' }, label: { en: 'where it all began', es: 'donde todo empezó' }, bg: 'linear-gradient(160deg,#7a4fd6,#14092b)' },
          { kind: 'text', eyebrow: { en: 'A REWARD LOOP', es: 'UN CICLO DE RECOMPENSA' }, headline: { en: 'Medals that grow with you.', es: 'Medallas que crecen contigo.' }, body: { en: 'A student\'s medal tier rises as they complete classes, from Novato up, so progress is visible.', es: 'El nivel de medalla de un estudiante sube al completar clases, desde Novato, para que el progreso se vea.' }, span: 'col-span-2' },
          { kind: 'text', eyebrow: { en: 'SPANISH FIRST', es: 'EN ESPAÑOL PRIMERO' }, headline: { en: 'Made for its students.', es: 'Hecha para sus estudiantes.' }, body: { en: 'The whole interface is in Spanish, with a friendly, colorful look that keeps it approachable.', es: 'Toda la interfaz está en español, con un look amigable y colorido que la hace cercana.' }, span: 'col-span-2' },
        ],
      },
      {
        type: 'specs',
        tone: 'dark',
        eyebrow: { en: 'UNDER THE HOOD', es: 'POR DENTRO' },
        items: [
          { value: 'Flutter', label: { en: 'and Dart', es: 'y Dart' } },
          { value: 'Firebase', label: { en: 'Auth, Firestore, Messaging', es: 'Auth, Firestore, Messaging' } },
          { value: '73', label: { en: 'Dart files', es: 'archivos Dart' } },
          { value: '22k', label: { en: 'lines of code', es: 'líneas de código' } },
          { value: '2', label: { en: 'sides: student and tutor', es: 'lados: estudiante y tutor' } },
          { value: '2025', label: { en: 'first commit', es: 'primer commit' } },
        ],
        note: {
          en: 'The payment step is mocked. The screens shown use a test account; real tutors on the live app are not shown.',
          es: 'El paso de pago es simulado. Las pantallas usan una cuenta de prueba; los tutores reales de la app en vivo no se muestran.',
        },
      },
      { type: 'glance', tone: 'light' },
    ],
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
        'Architected the tutor booking flow, with a mocked payment step',
        'Led all product design and development decisions; reached near-launch stage before halting due to funding constraints',
      ],
      es: [
        'Cofundé una startup para construir un mercado estilo Uber que conecta a estudiantes con tutores en línea',
        'Diseñé y desarrollé la aplicación móvil multiplataforma completa usando Flutter, para iOS y Android',
        'Diseñé el flujo de reserva de tutores, con un paso de pago simulado',
        'Lideré todas las decisiones de diseño y desarrollo del producto; alcancé la etapa de casi lanzamiento antes de que el proyecto se detuviera por falta de financiamiento',
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
    stage: { bg: '#0a1f1a' },
    glance: {
      different: { en: 'Your data never leaves the phone, and it learns your real maintenance calories.', es: 'Tus datos nunca salen del teléfono, y aprende tus calorías reales de mantenimiento.' },
      features: {
        en: ['Today card', 'Body Rank for 13 muscle groups', 'Barcode and label scanning', 'Training splits and 190 exercises', 'Calendar and cycle tracking', 'Biometric lock, Health sync and widget'],
        es: ['Tarjeta de Hoy', 'Rango corporal de 13 grupos musculares', 'Escaneo de códigos y etiquetas', 'Rutinas y 190 ejercicios', 'Calendario y seguimiento del ciclo', 'Bloqueo biométrico, sincronización con Salud y widget'],
      },
    },
    story: [
      {
        type: 'hero',
        eyebrow: { en: 'A private fitness app', es: 'Una app de fitness privada' },
        tagline: {
          en: 'Workouts, food and body progress, all on your phone. None of it on a server.',
          es: 'Entrenamientos, comida y progreso corporal, todo en tu teléfono. Nada en un servidor.',
        },
        chip: { en: 'iOS and Android · English and Spanish', es: 'iOS y Android · Español e inglés' },
        phones: ['/projects/project-wellness/training.webp', '/projects/project-wellness/home.webp', '/projects/project-wellness/nutrition.webp'],
      },
      {
        type: 'statement',
        tone: 'dark',
        eyebrow: { en: 'PRIVACY, BY DESIGN', es: 'PRIVACIDAD, POR DISEÑO' },
        text: {
          en: 'Your data never leaves your *phone*. No server, no sign-up, *zero* cloud.',
          es: 'Tus datos nunca salen de tu *teléfono*. Sin servidor, sin registro, *cero* nube.',
        },
        body: {
          en: 'The "account" is just a profile that gathers your own information: no email, no password, nothing to sell and nothing to leak.',
          es: 'La "cuenta" es solo un perfil que reúne tu propia información: sin correo, sin contraseña, nada que vender y nada que filtrar.',
        },
      },
      {
        type: 'rail',
        tone: 'dark',
        eyebrow: { en: 'THE DAY', es: 'EL DÍA' },
        heading: { en: 'One calm app for the whole day.', es: 'Una app tranquila para todo el día.' },
        cardWidth: 21,
        cards: [
          {
            phone: true,
            eyebrow: { en: 'TODAY', es: 'HOY' },
            headline: { en: 'Your day, at a glance.', es: 'Tu día, de un vistazo.' },
            body: { en: 'Calories left on a ring, whether you trained, and your latest weight, each one a shortcut. Open the app and you already know where you stand.', es: 'Calorías restantes en un anillo, si entrenaste y tu peso más reciente, cada uno un atajo. Abres la app y ya sabes cómo vas.' },
            image: '/projects/project-wellness/home.webp',
          },
          {
            phone: true,
            eyebrow: { en: 'TRAINING', es: 'ENTRENAMIENTO' },
            headline: { en: 'Train your way.', es: 'Entrena a tu manera.' },
            body: { en: 'Push, Pull, Legs, Upper and Lower, Full Body, Bro Split, Pilates or a split of your own, with a 190-exercise library and video demos.', es: 'Push, Pull, Legs, Torso y Pierna, Cuerpo Completo, Bro Split, Pilates o una rutina propia, con una biblioteca de 190 ejercicios y videos de demostración.' },
            image: '/projects/project-wellness/training.webp',
          },
          {
            phone: true,
            eyebrow: { en: 'NUTRITION', es: 'NUTRICIÓN' },
            headline: { en: 'Know what is left.', es: 'Sabe lo que te queda.' },
            body: { en: 'A ring for calories and a bar for protein, carbs and fat. Search a food, scan a barcode, read a nutrition label, or reuse your own foods and saved meals.', es: 'Un anillo para calorías y una barra para proteína, carbohidratos y grasa. Busca un alimento, escanea un código de barras, lee una etiqueta o reutiliza tus alimentos y comidas guardadas.' },
            image: '/projects/project-wellness/nutrition.webp',
          },
          {
            phone: true,
            eyebrow: { en: 'CALENDAR', es: 'CALENDARIO' },
            headline: { en: 'A calendar that remembers.', es: 'Un calendario que recuerda.' },
            body: { en: 'Dots for food, workouts and weigh-ins, plus optional cycle tracking that learns your cycle length and estimates your next period and fertile window.', es: 'Puntos para comida, entrenamientos y pesajes, más seguimiento opcional del ciclo que aprende tu duración y estima tu próximo periodo y ventana fértil.' },
            image: '/projects/project-wellness/calendar.webp',
          },
          {
            phone: true,
            eyebrow: { en: 'MEDALS', es: 'MEDALLAS' },
            headline: { en: 'Small wins, kept.', es: 'Pequeñas victorias, guardadas.' },
            body: { en: 'Medals and streaks reward consistency, from your first workout to long-term milestones, with progress you can see.', es: 'Medallas y rachas premian la constancia, desde tu primer entrenamiento hasta metas a largo plazo, con un progreso que puedes ver.' },
            image: '/projects/project-wellness/medals.webp',
          },
        ],
      },
      {
        type: 'bento',
        tone: 'dark',
        eyebrow: { en: 'SMARTER THAN IT LOOKS', es: 'MÁS INTELIGENTE DE LO QUE PARECE' },
        heading: { en: 'The details that make it feel finished.', es: 'Los detalles que la hacen sentir terminada.' },
        tiles: [
          { kind: 'phone', image: '/projects/project-wellness/onboarding.webp', caption: { en: 'No accounts, no cloud', es: 'Sin cuentas, sin nube' }, span: 'row-span-2' },
          { kind: 'text', eyebrow: { en: 'IT LEARNS YOU', es: 'TE APRENDE' }, headline: { en: 'It finds your real maintenance calories.', es: 'Encuentra tus calorías reales de mantenimiento.' }, body: { en: 'From what you ate and how your weight moved, it blends a learned estimate with the formula, shows every step and never drops below a safe minimum.', es: 'Con lo que comiste y cómo se movió tu peso, mezcla una estimación aprendida con la fórmula, muestra cada paso y nunca baja de un mínimo seguro.' }, span: 'col-span-2' },
          { kind: 'stat', value: '13', eyebrow: { en: 'BODY RANK', es: 'RANGO CORPORAL' }, label: { en: 'muscle groups, each ranked', es: 'grupos musculares, cada uno con rango' }, bg: 'linear-gradient(160deg,#2f7f66,#06201a)' },
          { kind: 'text', eyebrow: { en: 'SCAN IT', es: 'ESCANÉALO' }, headline: { en: 'Scan it, do not type it.', es: 'Escanéalo, no lo escribas.' }, body: { en: 'Barcodes and nutrition labels turn packaged food into a log entry in seconds.', es: 'Códigos de barras y etiquetas nutricionales convierten comida empacada en un registro en segundos.' }, span: 'col-span-2' },
          { kind: 'stat', value: '190', eyebrow: { en: 'EXERCISES', es: 'EJERCICIOS' }, label: { en: 'with video demos', es: 'con videos de demostración' }, bg: 'linear-gradient(160deg,#b86b2c,#2a1505)' },
          { kind: 'text', eyebrow: { en: 'FORGIVING', es: 'PERDONA ERRORES' }, headline: { en: 'Weigh-ins you can trust.', es: 'Pesajes en los que puedes confiar.' }, body: { en: 'A typo guard asks "Is that right?" when 109 becomes 209, and every delete has an undo.', es: 'Un guardia de errores pregunta "¿Es correcto?" cuando 109 se vuelve 209, y cada borrado se puede deshacer.' }, span: 'col-span-2' },
          { kind: 'text', eyebrow: { en: 'BUILT LIKE A REAL APP', es: 'HECHA COMO UNA APP DE VERDAD' }, headline: { en: 'Lock it. Sync it. Back it up.', es: 'Bloquéala. Sincronízala. Respáldala.' }, body: { en: 'Biometric lock, Apple Health and Health Connect sync, a home-screen widget, reminders, and full export and backup.', es: 'Bloqueo biométrico, sincronización con Apple Health y Health Connect, widget de pantalla de inicio, recordatorios y exportación y respaldo completos.' }, span: 'col-span-2' },
          { kind: 'text', eyebrow: { en: 'FOR EVERYONE', es: 'PARA TODOS' }, headline: { en: 'English and Spanish, built in.', es: 'Español e inglés, integrados.' }, body: { en: 'The whole app is available in both languages, so it works the way you think.', es: 'Toda la app está disponible en ambos idiomas, para que funcione como piensas.' }, span: 'col-span-2' },
          { kind: 'stat', value: '9', eyebrow: { en: 'RANK TIERS', es: 'NIVELES DE RANGO' }, label: { en: 'to climb, per muscle', es: 'por escalar, por músculo' }, bg: 'linear-gradient(160deg,#4a3a9a,#100c26)' },
          { kind: 'stat', value: '48', eyebrow: { en: 'RELEASES', es: 'VERSIONES' }, label: { en: 'and still shipping', es: 'y sigue lanzando' }, bg: 'linear-gradient(160deg,#1f6f8a,#06202a)' },
        ],
      },
      {
        type: 'specs',
        tone: 'dark',
        eyebrow: { en: 'UNDER THE HOOD', es: 'POR DENTRO' },
        items: [
          { value: '2.24', label: { en: 'current version', es: 'versión actual' } },
          { value: '48', label: { en: 'releases', es: 'versiones' } },
          { value: '130', label: { en: 'Dart files', es: 'archivos Dart' } },
          { value: '26.5k', label: { en: 'lines of code', es: 'líneas de código' } },
          { value: '13', label: { en: 'muscle groups', es: 'grupos musculares' } },
          { value: '190', label: { en: 'exercises', es: 'ejercicios' } },
        ],
        note: {
          en: 'Zero cloud means no server of its own. The only network request is the optional barcode lookup, which sends just the barcode to Open Food Facts. Screens show demo data.',
          es: 'Cero nube significa sin servidor propio. La única petición de red es la búsqueda opcional de código de barras, que envía solo el código a Open Food Facts. Las pantallas muestran datos de ejemplo.',
        },
      },
      { type: 'glance', tone: 'light' },
    ],
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
        'Construí una app en Flutter completamente local: sin backend, sin cuentas y sin sincronización en la nube, por diseño',
        'Implementé escaneo de etiquetas nutricionales por código de barras y OCR para registrar alimentos y seguir metas de calorías',
        'Lancé un rastreador de entrenamientos con biblioteca de ejercicios, videos tutoriales y seguimiento de medallas/logros',
        'Diseñé "Body Rank", un sistema gamificado que sube de nivel 13 grupos musculares a través de 9 rangos según el volumen real de entrenamiento',
        'Construí un sistema manual de exportación/compartición (y respaldo completo de datos) sin nube, para que los usuarios controlen sus propios datos de principio a fin',
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
        'Diseñé el modelo 3D completo del chasis del robot usando software CAD, optimizando estructura y peso',
        'Programé el microcontrolador Arduino para implementar la detección de línea y la lógica de navegación autónoma',
        'Ensamblé e integré los componentes de hardware con firmware personalizado en un entorno de trabajo en equipo',
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
    period: { en: '2026 · Alpha · counts as of v0.9.17, it keeps changing', es: '2026 · Alfa · cifras de la v0.9.17, sigue cambiando' },
    tagline: {
      en: 'An elemental dice roguelite that runs in the browser. Roll, fuse, and chain reactions between neighboring dice to beat escalating targets across 45 rounds, three paths, and 17 endings.',
      es: 'Un roguelite de dados elementales que corre en el navegador. Tira, fusiona y encadena reacciones entre dados vecinos para superar objetivos crecientes a lo largo de 45 rondas, tres caminos y 17 finales.',
    },
    tech: ['React', 'Framer Motion', 'Canvas', 'Web Audio', 'Tailwind CSS', 'Vite'],
    team: { en: 'Solo', es: 'En solitario' },
    platform: { en: 'Web (desktop & mobile browsers)', es: 'Web (navegadores de escritorio y móvil)' },
    playUrl: '/games/elementa',
    stats: [
      { value: '89', label: { en: 'Dice to roll, fuse, and forge', es: 'Dados para tirar, fusionar y forjar' } },
      { value: '62', label: { en: 'Relics to build around', es: 'Reliquias para armar tu estrategia' } },
      { value: '53', label: { en: 'Consumable items to bend the odds', es: 'Consumibles para inclinar las probabilidades' } },
      { value: '45', label: { en: 'Rounds across four realms', es: 'Rondas a lo largo de cuatro reinos' } },
      { value: '0', label: { en: 'Image or audio files. All art and music are made in code', es: 'Archivos de imagen o audio. Todo el arte y la música se hacen en código' } },
    ],
    highlights: {
      en: [
        'Designed a full roguelite from a written design doc: economy, rarity, fusion tree, bosses, three story paths, and 17 endings',
        'Every sprite, die, background, and song is generated in code: rasterized pixel dice, canvas skies, a CSS pixel UI kit, and music written as text',
        'A pure, data-driven scoring engine that explains itself: every point of Base and Mult is itemized on screen',
      ],
      es: [
        'Diseñó un roguelite completo a partir de un documento de diseño: economía, rareza, árbol de fusiones, jefes, tres caminos narrativos y 17 finales',
        'Cada sprite, dado, fondo y canción se genera en código: dados en pixel art rasterizados, cielos en canvas, un kit de interfaz pixel en CSS y música escrita como texto',
        'Un motor de puntaje puro y basado en datos que se explica solo: cada punto de Base y Mult se detalla en pantalla',
      ],
    },
    brand: {
      color: '#6a4fd6',
      tile: '#4a33b5',
      glyph: 'elementa',
    },
    stage: { bg: '#0b0816' },
    glance: {
      different: { en: 'The order of the dice is the puzzle, and the game shows its math for every point.', es: 'El orden de los dados es el rompecabezas, y el juego muestra sus cuentas en cada punto.' },
      features: {
        en: ['Neighbors that react', 'Fusing and forging dice', 'Bosses with counters', 'A branching road with shops', 'Pixel-art story scenes', 'English and Spanish', 'All art and music made in code'],
        es: ['Vecinos que reaccionan', 'Fusión y forja de dados', 'Jefes con contrajuegos', 'Un camino con tiendas', 'Escenas narrativas en pixel art', 'Español e inglés', 'Todo el arte y la música hechos en código'],
      },
    },
    story: [
      {
        type: 'hero',
        eyebrow: { en: 'A dice roguelite for the browser', es: 'Un roguelite de dados para el navegador' },
        tagline: {
          en: 'Roll the elements. Let the neighbors react. Beat a target that never stops growing.',
          es: 'Tira los elementos. Deja que los vecinos reaccionen. Supera un objetivo que no deja de crecer.',
        },
        chip: { en: 'Playable alpha · v0.9.17 · it keeps changing', es: 'Alfa jugable · v0.9.17 · sigue cambiando' },
        image: '/projects/elementa/boss-table.webp',
        alt: { en: 'A boss round with thirty dice on the table', es: 'Una ronda de jefe con treinta dados en la mesa' },
      },
      {
        type: 'statement',
        tone: 'dark',
        eyebrow: { en: 'THE IDEA', es: 'LA IDEA' },
        text: {
          en: 'Where a die *sits* is the *puzzle*. Neighbors react, scores explode, and you can see exactly why.',
          es: 'Dónde está un dado es el *rompecabezas*. Los vecinos *reaccionan*, los puntajes explotan y ves exactamente por qué.',
        },
        body: {
          en: 'Four elements, dice that fuse into new dice, and a table you rearrange with your hands. It rewards planning, and it never hides its math.',
          es: 'Cuatro elementos, dados que se fusionan en dados nuevos y una mesa que reordenas con las manos. Premia planear y nunca esconde sus cuentas.',
        },
      },
      {
        type: 'table',
        tone: 'dark',
        eyebrow: { en: 'TRY IT', es: 'PRUÉBALO' },
        heading: { en: 'Same six dice. Pick up the pieces.', es: 'Los mismos seis dados. Muévelos.' },
        body: {
          en: 'This is the real thing: the game\'s own dice and its own scoring rules, running right here. Drag a die to a new spot and watch the neighbors react, and the ledger explain every point.',
          es: 'Esto es lo real: los dados del juego y sus propias reglas de puntaje, funcionando aquí mismo. Arrastra un dado a otro lugar y mira cómo reaccionan los vecinos y cómo el registro explica cada punto.',
        },
        note: {
          en: 'Built from Elementa\'s own dice sprites and scoring engine, with a fixed set of six dice and no relics.',
          es: 'Construido con los sprites de dados y el motor de puntaje de Elementa, con seis dados fijos y sin reliquias.',
        },
      },
      {
        type: 'rail',
        tone: 'dark',
        eyebrow: { en: 'THE RUN', es: 'LA PARTIDA' },
        heading: { en: 'A road to walk, people to meet.', es: 'Un camino por recorrer, gente por conocer.' },
        cardWidth: 30,
        cards: [
          {
            eyebrow: { en: 'THE ROAD', es: 'EL CAMINO' },
            headline: { en: 'A map, not a corridor.', es: 'Un mapa, no un pasillo.' },
            body: { en: 'Between rounds you choose your way across a branching road: shops, forges, camps and the occasional god.', es: 'Entre rondas eliges tu ruta por un camino que se ramifica: tiendas, fraguas, campamentos y algún dios.' },
            image: '/projects/elementa/road-map.webp',
            pixel: true,
            position: 'center top',
          },
          {
            eyebrow: { en: 'THE MARKET', es: 'EL MERCADO' },
            headline: { en: 'Shops with people in them.', es: 'Tiendas con gente adentro.' },
            body: { en: 'Recurring shopkeepers like Tobb react to what you pick and buy. Trade for the build you are chasing.', es: 'Tenderos recurrentes como Tobb reaccionan a lo que eliges y compras. Intercambia por la estrategia que persigues.' },
            image: '/projects/elementa/shop.webp',
            position: 'center top',
          },
          {
            eyebrow: { en: 'THE CARTOGRAPHER', es: 'EL CARTÓGRAFO' },
            headline: { en: 'Someone redraws the road.', es: 'Alguien redibuja el camino.' },
            body: { en: 'Atlas sells you a longer sight, a new path, a way to reshape where the run goes next.', es: 'Atlas te vende una vista más larga, un camino nuevo, una forma de cambiar hacia dónde va la partida.' },
            image: '/projects/elementa/map-atlas.webp',
            position: 'center top',
          },
          {
            eyebrow: { en: 'THE STORY', es: 'LA HISTORIA' },
            headline: { en: 'Gods and bosses with something to say.', es: 'Dioses y jefes con algo que decir.' },
            body: { en: 'Each boss and path has its own pixel-art scene. Skip them with Esc, replay them from the Gallery.', es: 'Cada jefe y camino tiene su escena en pixel art. Sáltalas con Esc, repítelas desde la Galería.' },
            image: '/projects/elementa/boss-intro.webp',
            pixel: true,
            position: 'center 30%',
          },
        ],
      },
      {
        type: 'fullbleed',
        eyebrow: { en: 'THE ARBITER', es: 'EL ÁRBITRO' },
        headline: { en: 'A character that reads the room, with your consent.', es: 'Un personaje que lee el entorno, con tu permiso.' },
        body: {
          en: 'The Arbiter can use your browser\'s time, language and window size to write lines about you, but only after an explicit yes or no. Nothing is stored or sent.',
          es: 'El Árbitro puede usar la hora, el idioma y el tamaño de ventana de tu navegador para escribir líneas sobre ti, pero solo tras un sí o un no explícito. Nada se guarda ni se envía.',
        },
        image: '/projects/elementa/realm3-table.webp',
        position: 'center 30%',
      },
      {
        type: 'bento',
        tone: 'dark',
        eyebrow: { en: 'EVERYTHING YOU ROLL, FORGE AND FIND', es: 'TODO LO QUE TIRAS, FORJAS Y ENCUENTRAS' },
        heading: { en: 'A whole world of things to build with.', es: 'Un mundo entero de cosas con qué construir.' },
        body: {
          en: 'Dice that fuse, relics that bend the rules, items you spend at the right moment, and reactions that chain across the table.',
          es: 'Dados que se fusionan, reliquias que doblan las reglas, objetos que gastas en el momento justo y reacciones que se encadenan por la mesa.',
        },
        tiles: [
          { kind: 'stat', value: '89', eyebrow: { en: 'DICE', es: 'DADOS' }, label: { en: 'to roll, fuse and forge', es: 'para tirar, fusionar y forjar' } },
          { kind: 'art', image: '/projects/elementa/items-sprites.webp', caption: { en: 'Items drawn pixel by pixel, in code', es: 'Objetos dibujados píxel a píxel, en código' }, span: 'col-span-2', pixel: true, position: 'center top' },
          { kind: 'stat', value: '62', eyebrow: { en: 'RELICS', es: 'RELIQUIAS' }, label: { en: 'to build around', es: 'para armar tu estrategia' }, bg: 'linear-gradient(160deg,#8a6a12,#2a1d05)' },
          { kind: 'art', image: '/projects/elementa/characters.webp', caption: { en: 'Gods, keepers and bosses, all animated', es: 'Dioses, tenderos y jefes, todos animados' }, span: 'col-span-2', pixel: true, contain: true },
          { kind: 'stat', value: '53', eyebrow: { en: 'ITEMS', es: 'OBJETOS' }, label: { en: 'consumables to bend the odds', es: 'consumibles para inclinar las probabilidades' }, bg: 'linear-gradient(160deg,#1c6e6a,#06201f)' },
          { kind: 'stat', value: '54', eyebrow: { en: 'REACTIONS', es: 'REACCIONES' }, label: { en: 'between neighboring dice', es: 'entre dados vecinos' }, bg: 'linear-gradient(160deg,#b8432f,#2b0d08)' },
          { kind: 'art', image: '/projects/elementa/room-market.webp', caption: { en: 'Tobb, the traveling peddler', es: 'Tobb, el buhonero viajero' }, span: 'col-span-2 row-span-2', pixel: true },
          { kind: 'text', eyebrow: { en: 'FUSE, FORGE, COUNTER', es: 'FUSIONA, FORJA, CONTRARRESTA' }, headline: { en: 'Builds that feel authored.', es: 'Estrategias que se sienten propias.' }, body: { en: 'Pairs and trios of dice become new dice that inherit from both parents. Bosses arrive with counters you can plan for.', es: 'Pares y tríos de dados se vuelven dados nuevos que heredan de ambos padres. Los jefes llegan con contrajuegos que puedes prever.' }, span: 'col-span-2' },
          { kind: 'stat', value: '32', eyebrow: { en: 'BOSSES', es: 'JEFES' }, label: { en: 'with rules of their own', es: 'con reglas propias' }, bg: 'linear-gradient(160deg,#5b2a9a,#12071f)' },
          { kind: 'stat', value: '12', eyebrow: { en: 'SHOPKEEPERS', es: 'TENDEROS' }, label: { en: 'who remember you', es: 'que te recuerdan' }, bg: 'linear-gradient(160deg,#2d5f2a,#0a1a09)' },
        ],
        note: {
          en: 'Counts are accurate for v0.9.17. Elementa is an alpha and every release adds more.',
          es: 'Las cifras son de la v0.9.17. Elementa es una alfa y cada versión agrega más.',
        },
      },
      {
        type: 'fullbleed',
        eyebrow: { en: 'HANDMADE', es: 'HECHO A MANO' },
        headline: { en: 'Not one image or audio file.', es: 'Ni un solo archivo de imagen o audio.' },
        body: {
          en: 'Every sprite, sky and song is generated in code: pixel dice, canvas backdrops, a CSS pixel UI kit and music written as text. In English and Spanish.',
          es: 'Cada sprite, cielo y canción se genera en código: dados en pixel art, fondos en canvas, un kit de interfaz pixel en CSS y música escrita como texto. En inglés y español.',
        },
        image: '/projects/elementa/title.webp',
        pixel: true,
        narrow: true,
      },
      {
        type: 'statement',
        tone: 'dark',
        eyebrow: { en: 'STILL GROWING', es: 'SIGUE CRECIENDO' },
        text: {
          en: '17 endings so far, and the *game* keeps *growing*.',
          es: '17 finales hasta ahora, y el *juego* sigue *creciendo*.',
        },
        body: {
          en: 'Elementa is a living alpha. New dice, relics, realms and endings land with each version, so the numbers on this page are a snapshot of v0.9.17.',
          es: 'Elementa es una alfa viva. Dados, reliquias, reinos y finales nuevos llegan con cada versión, así que las cifras de esta página son una foto de la v0.9.17.',
        },
      },
      {
        type: 'specs',
        tone: 'dark',
        eyebrow: { en: 'THE NUMBERS, AS OF v0.9.17', es: 'LAS CIFRAS, A LA v0.9.17' },
        items: [
          { value: '45', label: { en: 'rounds', es: 'rondas' } },
          { value: '4', label: { en: 'realms', es: 'reinos' } },
          { value: '15', label: { en: 'starting loadouts', es: 'equipos iniciales' } },
          { value: '4', label: { en: 'difficulties', es: 'dificultades' } },
          { value: '72', label: { en: 'achievements', es: 'logros' } },
          { value: '17', label: { en: 'endings', es: 'finales' } },
        ],
        note: {
          en: 'Several late-run screens on this page come from the project\'s own test saves, so they show what the engine can reach, not a typical run.',
          es: 'Varias pantallas de partidas avanzadas en esta página vienen de las partidas de prueba del propio proyecto, así que muestran lo que el motor puede alcanzar, no una partida típica.',
        },
      },
      { type: 'glance', tone: 'light' },
    ],
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
        headline: { en: 'Every fifth round bends the rules.', es: 'Cada quinta ronda cambia las reglas.' },
        body: {
          en: 'Hidden faces, taxed rerolls, sealed relics. Round 15 is the Primordial, whose twist changes every time you reroll. Beat it and a path opens: the Firmament, then a third realm, then the Unwritten, with Wardens, Rewriters, and the four gods waiting past each door.',
          es: 'Caras ocultas, rerolls con impuesto, reliquias selladas. La ronda 15 es el Primordial, cuyo giro cambia cada vez que relanzas. Véncelo y se abre un camino: el Firmamento, luego un tercer reino, luego lo No Escrito, con Guardianes, Reescritores y los cuatro dioses tras cada puerta.',
        },
        image: '/screenshots/elementa-boss.png',
      },
      {
        eyebrow: { en: 'PROGRESSION', es: 'PROGRESIÓN' },
        headline: { en: 'Unlock, discover, complete.', es: 'Desbloquea, descubre, completa.' },
        body: {
          en: 'Fifteen starting loadouts and four difficulties unlock one win at a time. 72 achievements, 17 endings, and everything you see in a run join the Gallery, with a completion percentage to chase. Autosave slots keep runs resumable.',
          es: 'Quince equipos iniciales y cuatro dificultades se desbloquean victoria a victoria. 72 logros, 17 finales y todo lo que ves en una partida entran a la Galería, con un porcentaje de progreso por completar. Los espacios de autoguardado mantienen las partidas.',
        },
        image: '/screenshots/elementa-gallery.png',
      },
    ],
    bullets: {
      en: [
        'Designed the game end to end in a living design document: core loop, a 4-element fusion tree, a Shard economy, 5-tier rarity, three story paths, 17 endings, and a 45-round campaign across four realms',
        'Grew it from a 15-round prototype into an 89-dice, 62 relic, 53 consumable, 72 achievement game with 15 loadouts, recurring shopkeepers, and bosses with counters, shipped as numbered alpha releases with in-game patch notes',
        'Built a pure, data-driven scoring engine in which relics and bosses are plain effect data, returning an itemized breakdown that powers the on-screen ledger and cast animation',
        'Implemented adjacency reactions and placement-based dice with drag-to-reorder, adding a spatial strategy layer to a dice game',
        'Generated all visuals in code: per-tier pixel dice rasterized from polygons, canvas backgrounds with dithering and particles, pixel item sprites, and a CSS pixel UI kit',
        'Added persistent progression: autosave slots, unlockable loadouts and difficulties, a discovery gallery, and completion tracking',
        'Shipped bilingual EN/ES UI, keyboard controls, accessibility options (reduced motion, screen shake, scoring speed), and a procedural Web Audio soundtrack and effects, with an in-game jukebox and song editor',
        'Directed an AI-assisted workflow with Claude Code for rapid iteration, verifying game logic with Node test scripts and browser playthroughs',
      ],
      es: [
        'Diseñé el juego de principio a fin en un documento de diseño vivo: ciclo principal, un árbol de fusión de 4 elementos, una economía de Fragmentos, rareza de 5 niveles, tres caminos narrativos, 17 finales y una campaña de 45 rondas en cuatro reinos',
        'Lo hizo crecer de un prototipo de 15 rondas a un juego con 89 dados, 62 reliquias, 53 consumibles, 72 logros, 15 equipos iniciales, tenderos recurrentes y jefes con contrajuegos, lanzado en versiones alpha numeradas con notas de parche dentro del juego',
        'Construí un motor de puntaje puro y basado en datos donde reliquias y jefes son datos de efecto, que devuelve un desglose detallado para la cuenta en pantalla y la animación de lanzamiento',
        'Implementé reacciones por adyacencia y dados de posición con arrastre para reordenar, sumando una capa de estrategia espacial a un juego de dados',
        'Generé todo el arte en código: dados pixel por tamaño rasterizados desde polígonos, fondos en canvas con dithering y partículas, sprites pixel de objetos y un kit de interfaz pixel en CSS',
        'Agregué progresión persistente: espacios de autoguardado, equipos y dificultades desbloqueables, una galería de descubrimientos y seguimiento de progreso',
        'Lancé interfaz bilingüe EN/ES, controles de teclado, opciones de accesibilidad (movimiento reducido, temblor de pantalla, velocidad de conteo) y una banda sonora y efectos procedurales con Web Audio, con jukebox y editor de canciones dentro del juego',
        'Dirigí un flujo de trabajo asistido por IA con Claude Code para iterar rápido, verificando la lógica del juego con scripts de prueba en Node y partidas en el navegador',
      ],
    },
  },
  {
    slug: 'ohmstead',
    hideFromGrid: true,
    title: 'Ohmstead',
    role: { en: 'Solo Game Designer & Developer', es: 'Diseñador y Desarrollador de Juego en Solitario' },
    period: { en: '2026 · In development', es: '2026 · En desarrollo' },
    tagline: {
      en: 'An isometric factory builder about making electronics, from raw ore to a working desktop computer.',
      es: 'Un constructor de fábricas isométrico sobre fabricar electrónica, del mineral a una computadora de escritorio funcional.',
    },
    tech: ['PixiJS', 'JavaScript', 'Node tests'],
    team: { en: 'Solo', es: 'En solitario' },
    platform: { en: 'Web', es: 'Web' },
    brand: { color: '#e9962f', tile: '#1c1208', glyph: 'ohmstead' },
    stage: { bg: '#100b05' },
    glance: {
      different: { en: 'A deterministic factory simulation, tested like software, with power, fluids and heat.', es: 'Una simulación de fábrica determinista, probada como software, con energía, fluidos y calor.' },
      features: {
        en: ['Belts, machines and crafting', 'Power networks', 'Fluids and a refinery', 'A chip-making chain', 'A 57-node tech tree', 'A built-in Art Lab'],
        es: ['Cintas, máquinas y fabricación', 'Redes de energía', 'Fluidos y una refinería', 'Una cadena de fabricación de chips', 'Un árbol tecnológico de 57 nodos', 'Un Laboratorio de Arte integrado'],
      },
    },
    story: [
      {
        type: 'hero',
        eyebrow: { en: 'A factory-builder game', es: 'Un juego de construir fábricas' },
        tagline: {
          en: 'Dig the ore. Smelt it. Wire it. Build the machine that builds a computer.',
          es: 'Extrae el mineral. Fúndelo. Conéctalo. Construye la máquina que construye una computadora.',
        },
        chip: { en: 'In development · not playable yet', es: 'En desarrollo · aún no jugable' },
        image: '/projects/ohmstead/factory-close.webp',
        alt: { en: 'A powered drill, smelter and belt of ingots', es: 'Un taladro con energía, una fundidora y una cinta de lingotes' },
      },
      {
        type: 'statement',
        tone: 'dark',
        eyebrow: { en: 'THE IDEA', es: 'LA IDEA' },
        text: {
          en: 'A factory that *behaves* like a factory, and a game that teaches you the *technology* as you play.',
          es: 'Una fábrica que *se comporta* como una fábrica, y un juego que te enseña la *tecnología* mientras juegas.',
        },
        body: {
          en: 'Drills feed belts, belts feed smelters, smelters feed assemblers. Every machine does what it should, and every constraint is real.',
          es: 'Los taladros alimentan cintas, las cintas alimentan fundidoras, las fundidoras alimentan ensambladoras. Cada máquina hace lo que debe, y cada restricción es real.',
        },
      },
      {
        type: 'fullbleed',
        eyebrow: { en: 'A LIVING LINE', es: 'UNA LÍNEA VIVA' },
        headline: { en: 'Ore in. Ingots out.', es: 'Entra mineral. Salen lingotes.' },
        body: {
          en: 'Items move through a fixed-step simulation, 20 ticks a second, fully deterministic. A factory runs the same way every time, so it can be tested like software.',
          es: 'Los objetos se mueven en una simulación de paso fijo, 20 ticks por segundo, totalmente determinista. Una fábrica corre igual cada vez, así que se puede probar como software.',
        },
        image: '/projects/ohmstead/factory-wide.webp',
        position: 'center 40%',
      },
      {
        type: 'bento',
        tone: 'dark',
        eyebrow: { en: 'THE SYSTEMS', es: 'LOS SISTEMAS' },
        heading: { en: 'Power, fluids, heat. Nothing is free.', es: 'Energía, fluidos, calor. Nada es gratis.' },
        tiles: [
          { kind: 'art', image: '/projects/ohmstead/factory-close.webp', caption: { en: 'A powered line: drill, smelter, poles and belt', es: 'Una línea con energía: taladro, fundidora, postes y cinta' }, span: 'col-span-2 row-span-2', position: 'center' },
          { kind: 'text', eyebrow: { en: 'POWER', es: 'ENERGÍA' }, headline: { en: 'Short on power? Slow machines.', es: '¿Poca energía? Máquinas lentas.' }, body: { en: 'Poles and burners build a network. When supply falls short, everything slows, so you plan for it.', es: 'Postes y quemadores forman una red. Si la oferta no alcanza, todo se vuelve lento, así que lo planeas.' }, span: 'col-span-2' },
          { kind: 'text', eyebrow: { en: 'FLUIDS', es: 'FLUIDOS' }, headline: { en: 'Pipes, pumps, a refinery.', es: 'Tuberías, bombas, una refinería.' }, body: { en: 'Move fluids to where they are needed and turn them into what you can build with.', es: 'Mueve fluidos a donde se necesitan y conviértelos en lo que puedes construir.' }, span: 'col-span-2' },
          { kind: 'text', eyebrow: { en: 'THE CHIP LINE', es: 'LA LÍNEA DE CHIPS' }, headline: { en: 'Heat, cooling and exact yields.', es: 'Calor, enfriamiento y rendimientos exactos.' }, body: { en: 'From crystal furnace to packager, the chip-making chain has heat to manage and a tester that reports the exact yield.', es: 'Del horno de cristales al empacador, la cadena de chips tiene calor que manejar y un probador que reporta el rendimiento exacto.' }, span: 'col-span-4' },
        ],
      },
      {
        type: 'rail',
        tone: 'dark',
        eyebrow: { en: 'DEPTH', es: 'PROFUNDIDAD' },
        heading: { en: 'A world to learn, and tools to build it.', es: 'Un mundo por aprender, y herramientas para construirlo.' },
        cardWidth: 44,
        cards: [
          {
            eyebrow: { en: 'THE TECH TREE', es: 'EL ÁRBOL TECNOLÓGICO' },
            headline: { en: 'Research your way up.', es: 'Investiga para avanzar.' },
            body: { en: 'A 57-node tech tree with four branching forks and 39 missions walks you from ore to a computer.', es: 'Un árbol tecnológico de 57 nodos con cuatro bifurcaciones y 39 misiones te lleva del mineral a una computadora.' },
            image: '/projects/ohmstead/tech-tree.webp',
            position: 'center top',
          },
          {
            eyebrow: { en: 'THE ART LAB', es: 'EL LABORATORIO DE ARTE' },
            headline: { en: 'Every machine, drawn in code.', es: 'Cada máquina, dibujada en código.' },
            body: { en: 'All 38 machine sprites are procedural. A built-in Art Lab inspects each at three zoom levels, four rotations and every status.', es: 'Los 38 sprites de máquinas son procedurales. Un Laboratorio de Arte integrado inspecciona cada uno en tres niveles de zoom, cuatro rotaciones y cada estado.' },
            image: '/projects/ohmstead/art-lab.webp',
            position: 'center top',
          },
          {
            eyebrow: { en: 'THE GAME', es: 'EL JUEGO' },
            headline: { en: 'A real interface, already running.', es: 'Una interfaz real, ya funcionando.' },
            body: { en: 'Toolbar, missions, inventory and a power panel, all working on top of the simulation.', es: 'Barra de herramientas, misiones, inventario y un panel de energía, todo funcionando sobre la simulación.' },
            image: '/projects/ohmstead/game-ui.webp',
            position: 'center top',
          },
        ],
      },
      {
        type: 'statement',
        tone: 'dark',
        eyebrow: { en: 'WHERE IT STANDS', es: 'DÓNDE VA' },
        text: {
          en: 'The *engine* is built. The *game* is next.',
          es: 'El *motor* está construido. El *juego* sigue.',
        },
        body: {
          en: 'The simulation, power, fluids, chip chain and the logic-circuit engine are built and tested. Still to come: the in-game logic editor, the last placeable machines and the campaign ending. It is not playable yet, and it is the project I am putting the most time into.',
          es: 'La simulación, la energía, los fluidos, la cadena de chips y el motor de circuitos lógicos están construidos y probados. Falta el editor lógico dentro del juego, las últimas máquinas colocables y el final de la campaña. Aún no es jugable, y es el proyecto al que más tiempo le estoy dedicando.',
        },
      },
      {
        type: 'specs',
        tone: 'dark',
        eyebrow: { en: 'THE NUMBERS', es: 'LAS CIFRAS' },
        items: [
          { value: '57', label: { en: 'research nodes', es: 'nodos de investigación' } },
          { value: '39', label: { en: 'missions', es: 'misiones' } },
          { value: '73', label: { en: 'recipes', es: 'recetas' } },
          { value: '20 Hz', label: { en: 'fixed-step simulation', es: 'simulación de paso fijo' } },
          { value: '38', label: { en: 'machine sprites, in code', es: 'sprites de máquinas, en código' } },
          { value: '16', label: { en: 'test files passing', es: 'archivos de prueba aprobados' } },
        ],
        note: {
          en: 'About 13.7k lines of engine, render and art code. Screens are from a hand-built tutorial line, not a full factory.',
          es: 'Unas 13.7k líneas de código de motor, render y arte. Las pantallas vienen de una línea tutorial armada a mano, no de una fábrica completa.',
        },
      },
      { type: 'glance', tone: 'light' },
    ],
  },
]

export const comingSoonProjects = [
  {
    slug: 'ohmstead',
    title: 'Ohmstead',
    status: { en: 'In development', es: 'En desarrollo' },
    tagline: {
      en: 'An isometric factory-builder about manufacturing electronics, from raw ore to a working desktop computer. The deterministic simulation, belts, machines, crafting, labs, and a 57-node tech tree are built and tested; the art is being drawn in code.',
      es: 'Un constructor de fábricas isométrico sobre fabricar electrónica, del mineral a una computadora de escritorio funcional. La simulación determinista, las cintas, las máquinas, la fabricación, los laboratorios y un árbol tecnológico de 57 nodos ya están construidos y probados; el arte se está dibujando en código.',
    },
    tech: ['PixiJS', 'JavaScript', 'Node tests'],
    facts: [
      { value: '57', label: { en: 'Research nodes', es: 'Nodos de investigación' } },
      { value: '39', label: { en: 'Missions', es: 'Misiones' } },
      { value: '73', label: { en: 'Recipes', es: 'Recetas' } },
      { value: '20 Hz', label: { en: 'Fixed-step simulation', es: 'Simulación de paso fijo' } },
    ],
  },
]

export const stats = [
  {
    value: '2',
    label: { en: 'Engineering degrees in progress', es: 'Carreras de ingeniería en curso' },
  },
  { value: '6', label: { en: 'Projects built', es: 'Proyectos construidos' } },
  { value: '3.38', label: { en: 'GPA', es: 'Promedio (GPA)' } },
  { value: '3', label: { en: 'Languages spoken', es: 'Idiomas hablados' } },
]
