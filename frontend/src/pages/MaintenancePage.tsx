import { useEffect } from 'react'
import { business } from '../data/business'

export const MaintenancePage = () => {
  useEffect(() => {
    document.title = `${business.name} | Website Update`

    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      document.head.appendChild(robots)
    }
    robots.content = 'noindex, nofollow'

    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!description) {
      description = document.createElement('meta')
      description.name = 'description'
      document.head.appendChild(description)
    }
    description.content = `${business.name} is improving the website. Please check back soon.`
  }, [])

  return (
    <main className="dark-band flex min-h-screen items-center justify-center px-4 py-12 text-white">
      <section className="w-full max-w-2xl text-center">
        <p className="mx-auto max-w-xl text-3xl font-normal leading-tight sm:text-4xl">{business.name}</p>
        <p className="mt-8 text-sm font-normal uppercase tracking-[0.18em] text-[var(--color-accent)]">Website Update</p>
        <h1 className="mt-4 text-4xl font-normal leading-tight sm:text-5xl">We are improving the website.</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg font-normal leading-8 text-white/75">
          Osborne Motors is making updates to provide a better online experience. Please check back soon.
        </p>
        <div className="mx-auto mt-8 h-px max-w-sm bg-white/15" />
        <p className="mt-6 text-sm font-normal text-white/70">
          {business.address}, {business.cityState}
        </p>
      </section>
    </main>
  )
}
