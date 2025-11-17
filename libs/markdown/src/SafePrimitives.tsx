import * as React from 'react'
import { Link } from '@eventuras/ratio-ui/core/Link'

export function isSafeUrl(href?: string, allowExternalLinks = false): boolean {
  if (!href) return false
  try {
    // make a fake base url for supporting relative urls
    const base = 'https://_dummy'
    const u = new URL(href, base)
    const ok = ['http:', 'https:', 'mailto:', 'tel:']

    if (!ok.includes(u.protocol)) {
      return false
    }

    // If external links are not allowed, only permit relative URLs
    if (!allowExternalLinks && u.host !== '_dummy') {
      return false
    }

    return true
  } catch {
    return false
  }
}

export interface SafeLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  allowExternalLinks?: boolean
}

export const SafeLink: React.FC<SafeLinkProps> = ({
  allowExternalLinks = false,
  ...p
}) => {
  const href = typeof p.href === 'string' ? p.href : ''
  if (!isSafeUrl(href, allowExternalLinks)) return <span>{p.children}</span>

  return (
    <Link
      href={href}
      className={p.className}
      componentProps={{
        rel: p.rel ? `${p.rel} noopener noreferrer` : 'noopener noreferrer',
        target: p.target ?? '_blank',
      }}
    >
      {p.children}
    </Link>
  )
}

export interface SafeImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  allowExternalLinks?: boolean
}

export const SafeImg: React.FC<SafeImgProps> = ({
  allowExternalLinks = false,
  ...p
}) => {
  // block data: URLs unless you explicitly want them
  const src = typeof p.src === 'string' ? p.src : ''
  const safe = isSafeUrl(src, allowExternalLinks) // permits http/https only
  if (!safe) return null
  return (
    <img
      {...p}
      loading={p.loading ?? 'lazy'}
      decoding={p.decoding ?? 'async'}
      referrerPolicy={p.referrerPolicy ?? 'no-referrer'}
    />
  )
}
