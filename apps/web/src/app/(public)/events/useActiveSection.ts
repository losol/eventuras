'use client';

import { useEffect, useState } from 'react';

/**
 * Scroll-spy for in-page navigation: the id of the section currently under a
 * sticky bar of `offset` px. Sections count as visible between the bar and the
 * upper half of the viewport; at the bottom of the page the last id wins, so a
 * short final section can still become active.
 */
export function useActiveSection(ids: string[], offset: number): string | undefined {
  const [activeId, setActiveId] = useState<string>();
  const idsKey = ids.join('|');

  useEffect(() => {
    const sectionIds = idsKey.split('|').filter(Boolean);
    const elements = sectionIds
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const visible = new Set<string>();
    let current: string | undefined;
    const update = () => {
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      const next = atBottom ? sectionIds.at(-1) : sectionIds.find(id => visible.has(id));
      if (next && next !== current) {
        current = next;
        setActiveId(next);
      }
    };

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        update();
      },
      { rootMargin: `-${offset}px 0px -50% 0px` }
    );
    elements.forEach(el => observer.observe(el));
    window.addEventListener('scroll', update, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', update);
    };
  }, [idsKey, offset]);

  return activeId;
}
