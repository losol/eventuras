/* @vitest-environment jsdom */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';

// mock ratio-ui primitives to avoid style deps
vi.mock('@eventuras/ratio-ui/core/Heading', () => ({
  Heading: (p: any) => <h2 {...p} />,
}));
vi.mock('@eventuras/ratio-ui/core/Text', () => ({
  Text: (p: any) => <p {...p} />,
}));

// import the component under test
import { MarkdownContent } from './MarkdownContent';

describe('MarkdownContent', () => {
  // renders heading when provided
  it('renders a heading', () => {
    render(<MarkdownContent heading="Hello" markdown="Body" />)
    expect(screen.getByRole('heading', { level: 2, name: 'Hello' })).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  // renders bold text correctly
  it('renders bold text with **asterisks**', () => {
    const { container } = render(<MarkdownContent markdown="Join us for **Amazing Event**, an exciting opportunity." />)
    const strong = container.querySelector('strong')
    expect(strong).toBeInTheDocument()
    expect(strong).toHaveTextContent('Amazing Event')
  })

  // renders italic text correctly
  it('renders italic text with *asterisks*', () => {
    const { container } = render(<MarkdownContent markdown="This is *emphasized* text." />)
    const em = container.querySelector('em')
    expect(em).toBeInTheDocument()
    expect(em).toHaveTextContent('emphasized')
  })

  // strips invisible chars by default
  it('sanitizes invisible spaces by default', () => {
    const md = 'Text\u00A0\u200Bend'
    render(<MarkdownContent markdown={md} />)
    expect(screen.getByText('Text end')).toBeInTheDocument()
  })

  // allows turning off sanitation
  it('respects keepInvisibleCharacters = true', () => {
    const md = '\uFEFFStart'
    render(<MarkdownContent markdown={md} keepInvisibleCharacters={true}/>)
    // BOM may still render as empty, assert literal node presence
    expect(screen.getByText('Start')).toBeInTheDocument()
  })

  // blocks raw HTML by default
  it('blocks raw HTML when enableRawHtml = false (default)', () => {
    render(<MarkdownContent markdown={'<div data-x="1">XSS</div>'} />)
    expect(screen.queryByText('XSS')).not.toBeInTheDocument()
  })

  // permits raw HTML only when explicitly enabled
  it('can allow raw HTML when enableRawHtml = true', () => {
    render(<MarkdownContent markdown={'<div>X</div>'} enableRawHtml={true}/>)
    expect(screen.getByText('X')).toBeInTheDocument()
  })

  // blocks external links by default
  it('blocks external links by default', () => {
    const { container } = render(<MarkdownContent markdown={'[go](https://example.com)'} />)
    expect(screen.queryByRole('link')).toBeNull()
    expect(container).toHaveTextContent('go')
  })

  // renders external link when allowExternalLinks = true
  it('renders external link when allowExternalLinks = true', () => {
    render(<MarkdownContent markdown={'[go](https://example.com)'} allowExternalLinks={true} />)
    const a = screen.getByRole('link', { name: 'go' }) as HTMLAnchorElement
    expect(a).toBeInTheDocument()
    expect(a.href).toMatch(/^https:\/\/example\.com\/?/)
    expect(a.rel).toMatch(/noopener/)
    expect(a.target).toBe('_blank')
  })

  // blocks javascript: links
  it('blocks javascript: links', () => {
    const md = 'Before [x](javascript:alert(1)) After'
    const { container } = render(<MarkdownContent markdown={md} />)

    // no anchors rendered
    expect(screen.queryByRole('link')).toBeNull()

    // content survives
    expect(container).toHaveTextContent('Before')
    expect(container).toHaveTextContent('After')
    expect(container).toHaveTextContent(/\bx\b/)
  })

  // resolves relative links safely
  it('allows relative links', () => {
    render(<MarkdownContent markdown={'[home](/)'} />)
    const a = screen.getByRole('link', { name: 'home' }) as HTMLAnchorElement
    expect(a).toBeInTheDocument()
    expect(a.getAttribute('href')).toBe('/') // stays relative
  })

  // blocks external images by default
  it('blocks external images by default', () => {
    render(<MarkdownContent markdown={'![alt](https://example.com/a.png)'} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  // renders external image when allowExternalLinks = true
  it('renders external image when allowExternalLinks = true', () => {
    render(<MarkdownContent markdown={'![alt](https://example.com/a.png)'} allowExternalLinks={true} />)
    const img = screen.getByRole('img', { name: 'alt' }) as HTMLImageElement

    // check attributes (jsdom)
    expect(img.getAttribute('src')).toBe('https://example.com/a.png')
    expect(img.getAttribute('loading')).toBe('lazy')
    expect(img.getAttribute('decoding')).toBe('async')
    expect(img.getAttribute('referrerpolicy')).toBe('no-referrer')
  })

  // rehype-sanitize strips javascript: from src, but the img element still renders (with empty/no src)
  // This is safe - the dangerous URL is removed
  it('sanitizes javascript: image protocols', () => {
    render(<MarkdownContent markdown={'![x](javascript:alert(1))'} />)
    const img = screen.queryByRole('img')
    // Image renders but without the dangerous src
    expect(img).toBeInTheDocument()
    expect(img?.getAttribute('src')).toBeFalsy()
  })

  // data: URLs for images are allowed by rehype-sanitize's defaultSchema (GitHub's policy)
  // This is intentional - small inline images via data: URLs are a legitimate use case
  it('allows data: image URLs (per GitHub defaults)', () => {
    render(<MarkdownContent markdown={'![x](data:image/png;base64,aaaa)'} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  // stripHtmlTags option for legacy content with HTML-wrapped markdown
  it('strips HTML tags when stripHtmlTags = true', () => {
    render(<MarkdownContent markdown={'<p>**Questions?** Contact us</p>'} stripHtmlTags />)
    expect(screen.getByText('Questions?')).toBeInTheDocument()
    // Bold should be rendered as <strong>
    const strong = document.querySelector('strong')
    expect(strong).toBeInTheDocument()
    expect(strong?.textContent).toBe('Questions?')
  })

  // unescapes backslash-escaped markdown characters
  it('unescapes backslash-escaped markdown (e.g., \\*\\* from server)', () => {
    // This simulates data that comes from server with escaped asterisks
    const escapedMarkdown = 'Join us for \\*\\*Amazing Event\\*\\*, an exciting opportunity.'
    const { container } = render(<MarkdownContent markdown={escapedMarkdown} />)
    const strong = container.querySelector('strong')
    expect(strong).toBeInTheDocument()
    expect(strong).toHaveTextContent('Amazing Event')
  })
})
