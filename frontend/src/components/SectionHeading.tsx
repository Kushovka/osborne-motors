import { motion, useReducedMotion } from 'framer-motion'

type SectionHeadingProps = {
  eyebrow?: string
  title: string
  text?: string
}

export const SectionHeading = ({ eyebrow, title, text }: SectionHeadingProps) => {
  const prefersReducedMotion = useReducedMotion()

  return (
  <motion.div
    className="mx-auto mb-8 max-w-3xl text-center sm:mb-10"
    initial={prefersReducedMotion ? false : { opacity: 0, clipPath: 'inset(0 0 12% 0)' }}
    whileInView={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
    viewport={{ once: true, amount: 0.45 }}
    transition={{ duration: prefersReducedMotion ? 0.14 : 0.42, ease: [0.16, 1, 0.3, 1] }}
  >
    {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
    <h2 className="mt-3 text-3xl font-normal leading-tight text-[var(--color-text)] sm:text-4xl">{title}</h2>
    {text ? <p className="mx-auto mt-3 max-w-2xl text-base font-normal leading-8 text-[var(--color-muted)] sm:text-lg">{text}</p> : null}
  </motion.div>
  )
}
