import { Link } from 'react-router'
import type { MouseEventHandler, ReactNode } from 'react'

import { getContactActionFromHref, trackContactCta } from '../utils/ctaTracking'

type ButtonProps = {
  children: ReactNode
  href: string
  variant?: 'primary' | 'secondary' | 'light'
  className?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

const variants = {
  primary: 'bg-[var(--color-button)] text-white shadow-sm hover:bg-[var(--color-button-hover)] focus-visible:outline-[var(--color-button)]',
  secondary: 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-link)] shadow-sm hover:bg-[var(--color-hover)] focus-visible:outline-[var(--color-accent)]',
  light: 'bg-[var(--color-surface)] text-[var(--color-link)] ring-1 ring-[var(--color-border)] hover:bg-[var(--color-hover)] focus-visible:outline-[var(--color-accent)]',
}

export const Button = ({ children, href, variant = 'primary', className = '', onClick }: ButtonProps) => {
  const classes = `site-button inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 py-3 text-base font-normal shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${className}`
  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    const contactAction = getContactActionFromHref(href)
    if (contactAction) {
      trackContactCta(contactAction.actionType, contactAction.contentName)
    }

    onClick?.(event)
  }

  if (href.startsWith('/') && !href.startsWith('//')) {
    return (
      <Link to={href} className={classes} onClick={handleClick}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} className={classes} onClick={handleClick}>
      {children}
    </a>
  )
}
