'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface TableOfContentsProps {
  headings: TocHeading[];
  className?: string;
}

/**
 * Sticky table-of-contents sidebar with scroll-spy.
 *
 * Highlights the heading currently visible in the viewport
 * using an IntersectionObserver.
 */
export function TableOfContents({ headings, className = '' }: Readonly<TableOfContentsProps>) {
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the first intersecting heading
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: '0px 0px -80% 0px', threshold: 0 },
    );

    for (const el of elements) {
      observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="On this page" className={`text-sm ${className}`}>
      <p className="mb-3 font-medium text-gray-900 dark:text-white">On this page</p>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={activeId === heading.id ? true : undefined}
              className={`block transition-colors ${heading.level === 3 ? 'pl-3' : ''}
                ${activeId === heading.id
                  ? 'font-medium text-primary-700 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
