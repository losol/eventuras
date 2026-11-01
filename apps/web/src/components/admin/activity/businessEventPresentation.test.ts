import { describe, expect, it } from 'vitest';

import type { BusinessEventDto } from '@/lib/eventuras-sdk';

import { actorLabel, subjectHref } from './businessEventPresentation';

const event = (overrides: Partial<BusinessEventDto>): BusinessEventDto =>
  ({ eventType: 'registration.status.changed', ...overrides }) as BusinessEventDto;

describe('subjectHref', () => {
  it.each([
    ['registration', 12, '/admin/registrations/12'],
    ['order', 7, '/admin/orders/7'],
    ['event', 261, '/admin/events/261'],
  ])('links a %s to its admin page', (subjectType, subjectId, href) => {
    expect(subjectHref(event({ subjectType, subjectId }))).toBe(href);
  });

  it('has no link without an id or for unknown types', () => {
    expect(subjectHref(event({ subjectType: 'registration', subjectId: null }))).toBeUndefined();
    expect(subjectHref(event({ subjectType: 'user', subjectId: 3 }))).toBeUndefined();
  });
});

describe('actorLabel', () => {
  it('prefers the name, then a short id, else nothing', () => {
    expect(actorLabel(event({ actorName: 'Kari Admin', actorUserUuid: 'abcdef12-3456' }))).toBe(
      'Kari Admin'
    );
    expect(actorLabel(event({ actorUserUuid: 'abcdef12-3456' }))).toBe('abcdef12');
    expect(actorLabel(event({}))).toBeUndefined();
  });
});
