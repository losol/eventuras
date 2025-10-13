import * as React from 'react'

export function isSafeUrl(href?: string): boolean {
  if (!href) return false
  try {
    // make a fake base url for supporting relative urls
    const base = 'https://_dummy'
    const u = new URL(href, base)
    const ok = ['http:', 'https:', 'mailto:', 'tel:']
    return ok.includes(u.protocol)
  } catch {
    return false
  }
}

export const SafeLink: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = (p) => {
  const href = typeof p.href === 'string' ? p.href : ''
  if (!isSafeUrl(href)) return <span>{p.children}</span>
  return (
    <a
      {...p}
      rel={p.rel ? `${p.rel} noopener noreferrer` : 'noopener noreferrer'}
      target={p.target ?? '_blank'}
    />
  )
}

export const SafeImg: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (p) => {
  // block data: URLs unless you explicitly want them
  const src = typeof p.src === 'string' ? p.src : ''
  const safe = isSafeUrl(src) // permits http/https only
  if (!safe) return null
  return <img {...p} loading={p.loading ?? 'lazy'} decoding={p.decoding ?? 'async'} referrerPolicy={p.referrerPolicy ?? 'no-referrer'} />
}
