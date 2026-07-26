import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <Link to="/" className="text-sm text-neutral-500 hover:underline">
        &larr; Back home
      </Link>
    </section>
  )
}

export default NotFound
