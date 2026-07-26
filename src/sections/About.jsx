import Reveal from '../components/Reveal.jsx'

const skills = [
  {
    label: 'Languages & Frameworks',
    items: ['JavaScript', 'React', 'Vite', 'CSS', 'HTML', 'Dart (Flutter)', 'C++ (Arduino)'],
  },
  {
    label: 'Tools & Platforms',
    items: ['Firebase', 'Stripe', 'Git/GitHub', 'Arduino IDE', 'CAD (3D Modeling)'],
  },
  {
    label: 'Hardware & Systems',
    items: ['PC assembly & repair', 'Windows OS', 'Embedded systems (Arduino)'],
  },
  {
    label: 'Spoken Languages',
    items: ['Spanish (Native)', 'English (Fluent)', 'French (A2/B1)'],
  },
]

function About() {
  return (
    <section id="about" className="mx-auto max-w-5xl px-6 py-24">
      <Reveal>
        <h2 className="text-2xl font-semibold tracking-tight">About</h2>
        <p className="mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">
          I&apos;m a dual-degree BSE Computer Engineering &amp; Electrical Engineering student at the
          University of Michigan–Dearborn. I've shipped a live e-commerce platform end-to-end,
          co-founded and led development on a cross-platform tutoring startup, and built embedded
          systems projects like a CAD-designed, Arduino-driven autonomous robot. I like working
          across the stack, from firmware to frontend.
        </p>
      </Reveal>
      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {skills.map((group, i) => (
          <Reveal key={group.label} delay={i * 0.08}>
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {group.label}
            </h3>
            <ul className="mt-3 space-y-1.5 text-sm text-neutral-700 dark:text-neutral-300">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default About
