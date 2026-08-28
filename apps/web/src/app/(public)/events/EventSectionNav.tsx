'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import { Container } from '@eventuras/ratio-ui/layout/Container';

import { useActiveSection } from '@/app/(public)/events/useActiveSection';

export type EventSectionNavSection = { id: string; title: string };

export type EventSectionNavProps = {
  sections: EventSectionNavSection[];
  /** CSS `top` for the sticky bar — the height of the site navbar above it. */
  top: string;
  ariaLabel: string;
};

const linkClasses =
  'font-mono text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap no-underline transition-colors';

/**
 * Sticky in-page section nav under the site navbar — mono overline links with
 * the current section highlighted. 12 spacing units tall (`h-12`).
 */
export default function EventSectionNav({
  sections,
  top,
  ariaLabel,
}: Readonly<EventSectionNavProps>) {
  const ref = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);
  const activeId = useActiveSection(
    sections.map(section => section.id),
    offset
  );

  // Scroll-spy wants the bar's bottom edge in px; `top` is rem-based, so measure.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setOffset(Number.parseFloat(getComputedStyle(el).top) + el.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className="sticky z-10 bg-surface border-b border-border-1"
      style={{ top }}
    >
      <Container size="xl" className="flex h-12 items-center gap-6 overflow-x-auto">
        {sections.map(section => {
          const current = activeId === section.id;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={current ? 'location' : undefined}
              className={`${linkClasses} ${
                current ? 'text-(--text)' : 'text-(--text-subtle) hover:text-(--text)'
              }`}
            >
              {section.title}
            </a>
          );
        })}
      </Container>
    </nav>
  );
}
