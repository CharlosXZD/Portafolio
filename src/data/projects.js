export const projects = [
  {
    slug: 'tiger-price',
    title: 'Tiger Price',
    role: 'Lead Full-Stack Developer',
    period: 'Jul 2025 – Present',
    tagline: 'A full e-commerce platform built and run solo, storefront to admin dashboard.',
    tech: ['React', 'Vite', 'Firebase', 'Stripe'],
    stats: [
      { value: '100%', label: 'Features owned solo' },
      { value: '4', label: 'Core modules shipped' },
      { value: '2', label: 'Payment & data integrations' },
    ],
    highlights: [
      'Went from zero to a production storefront alone — no team, no template',
      'Real money moves through it: full Stripe checkout, not a demo cart',
      'Owns the entire stack: storefront, inventory, auth, and admin in one codebase',
    ],
    mockScreen: '/mockups/tiger-price-mock.svg',
    bullets: [
      'Architected and built a full e-commerce platform from the ground up using React, Vite, and CSS',
      'Integrated Firebase for back-end services, including real-time database, authentication, and inventory management',
      'Implemented Stripe payment processing, enabling secure end-to-end online transactions',
      'Sole developer responsible for all platform features: storefront, product catalog, cart, checkout, and admin dashboard',
    ],
  },
  {
    slug: 'tootor',
    title: 'Tootor',
    role: 'Co-Founder & Lead Developer',
    period: 'Jan 2025 – Jun 2025',
    tagline: 'An Uber-style on-demand tutoring marketplace, built cross-platform with Flutter.',
    tech: ['Flutter', 'Dart', 'Firebase'],
    stats: [
      { value: '2', label: 'Platforms (iOS & Android)' },
      { value: '1', label: 'Codebase, cross-platform' },
      { value: '6mo', label: 'Zero to near-launch' },
    ],
    highlights: [
      'Co-founded it — not just an engineer, a decision-maker on product and business',
      'One Flutter codebase shipped to both iOS and Android from day one',
      'Built real in-app purchase and booking/payment flows, not just UI screens',
    ],
    mockScreen: '/mockups/tootor-mock.svg',
    bullets: [
      'Co-founded a startup to build an Uber-style marketplace connecting students with online tutors',
      'Designed and developed the full cross-platform mobile app using Flutter, targeting both iOS and Android',
      'Architected in-app purchase functionality and tutor booking/payment flow',
      'Led all product design and development decisions; reached near-launch stage before halting due to funding constraints',
    ],
  },
  {
    slug: 'project-wellness',
    title: 'Project Wellness',
    role: 'Solo Developer',
    period: 'In active development',
    tagline:
      'A privacy-first fitness app: workout tracking, nutrition-label scanning, and a gamified "Body Rank" muscle-progression system — with zero cloud, zero accounts.',
    tech: ['Flutter', 'Dart', 'SQLite', 'OCR'],
    stats: [
      { value: '13', label: 'Muscle groups ranked' },
      { value: '9', label: 'Rank tiers per group' },
      { value: '0', label: 'Cloud services — fully local' },
    ],
    highlights: [
      'Deliberately built with no backend at all — a real architectural stance, not a shortcut',
      'Shipped computer-vision-style OCR label scanning, not just manual data entry',
      'Designed an original gamification system (Body Rank) from scratch, not a copied template',
    ],
    mockScreen: '/mockups/project-wellness-mock.svg',
    bullets: [
      'Built a fully local-first Flutter app — no backend, no accounts, no cloud sync by design',
      'Implemented barcode and OCR-based nutrition label scanning to log food and track calorie targets',
      'Shipped a workout tracker with an exercise library, tutorial videos, and medal/achievement tracking',
      'Designed "Body Rank," a gamified system that levels 13 muscle groups through 9 tiers based on real training volume',
      'Built a manual, no-cloud export/share system (and full data backup) so users control their own data end to end',
    ],
  },
  {
    slug: 'line-following-robot',
    title: 'Line-Following Robot',
    role: 'University of Michigan – Dearborn, ENGR 100 Team Project',
    period: 'Fall 2025',
    tagline: 'A CAD-designed robot chassis with Arduino-driven autonomous navigation.',
    tech: ['Arduino', 'C++', 'CAD'],
    stats: [
      { value: '1', label: 'Custom-designed chassis' },
      { value: '2', label: 'Navigation sensors integrated' },
    ],
    highlights: [
      'Ranked best in our lab section, out of all the teams',
      'Covered the full hardware pipeline: CAD design, assembly, and firmware in one project',
      'Wrote the autonomous navigation logic from scratch, not a pre-built library',
    ],
    model3d: '/models/line-following-robot.stl',
    bullets: [
      'Designed the full 3D model of the robot chassis using CAD software, optimizing for structure and weight',
      'Programmed the Arduino microcontroller to implement line-detection and autonomous navigation logic',
      'Assembled and integrated hardware components with custom firmware in a collaborative team setting',
    ],
  },
]

export const comingSoonProjects = [
  {
    title: 'Lucklike',
    tagline: 'A game currently in development — the next project on deck. Details soon.',
  },
]

export const stats = [
  { value: '2', label: 'Engineering degrees in progress' },
  { value: '4', label: 'Shipped projects' },
  { value: '3.38', label: 'GPA' },
  { value: '3', label: 'Languages spoken' },
]
