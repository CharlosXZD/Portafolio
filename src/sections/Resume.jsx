import Reveal from '../components/Reveal.jsx'

function Resume() {
  return (
    <section id="resume" className="mx-auto max-w-5xl px-6 py-24">
      <Reveal>
        <h2 className="text-2xl font-semibold tracking-tight">Resume</h2>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
          BSE Computer Engineering &amp; Electrical Engineering, University of Michigan–Dearborn
          (expected May 2029).
        </p>
        <a
          href="/Carlos_de_la_Pena_Resume.pdf"
          download
          className="mt-6 inline-block rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-500"
        >
          Download Resume (PDF)
        </a>
      </Reveal>
    </section>
  )
}

export default Resume
