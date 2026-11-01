import { describe, expect, it } from 'vitest';

import type { EventDto } from '@/lib/eventuras-sdk';

import {
  fillTone,
  inTab,
  matchesQuery,
  relativeTo,
  sortRows,
  toOverviewRow,
} from './eventOverview';

const TODAY = '2026-11-01';
const row = (event: Partial<EventDto>, registrations = 0) =>
  toOverviewRow({ status: 'RegistrationsOpen', ...event } as EventDto, registrations, TODAY);

describe('toOverviewRow state and status', () => {
  it.each([
    [{ status: 'Draft', dateStart: '2026-12-01' }, 'draft', 'draft', 'neutral'],
    [{ status: 'Cancelled', dateStart: '2026-12-01' }, 'cancelled', 'cancelled', 'error'],
    [{ dateStart: '2026-10-01' }, 'past', 'past', 'neutral'],
    [{ dateStart: '2026-10-30', dateEnd: '2026-11-02' }, 'ongoing', 'ongoing', 'info'],
    [{ dateStart: '2026-11-01' }, 'ongoing', 'ongoing', 'info'],
    [{ dateStart: '2026-12-01' }, 'upcoming', 'open', 'success'],
    [{ status: 'WaitingList', dateStart: '2026-12-01' }, 'upcoming', 'waitingList', 'warning'],
    [{ status: 'RegistrationsClosed', dateStart: '2026-12-01' }, 'upcoming', 'closed', 'neutral'],
    [{ status: 'Planned', dateStart: '2026-12-01' }, 'upcoming', 'planned', 'neutral'],
    [{ status: 'Finished', dateStart: '2026-12-01' }, 'past', 'past', 'neutral'],
    [{}, 'upcoming', 'open', 'success'],
  ] as const)('%o → %s / %s', (event, state, statusKey, badge) => {
    const r = row(event);
    expect([r.state, r.statusKey, r.badge]).toEqual([state, statusKey, badge]);
  });

  it('marks a full upcoming event as full', () => {
    const r = row({ dateStart: '2026-12-01', maxParticipants: 70 }, 70);
    expect([r.statusKey, r.badge, r.fill]).toEqual(['full', 'warning', 1]);
  });

  it('has no capacity or fill without maxParticipants', () => {
    const r = row({ dateStart: '2026-12-01', maxParticipants: 0 }, 5);
    expect(r.capacity).toBeUndefined();
    expect(r.fill).toBeUndefined();
    expect(r.statusKey).toBe('open');
  });
});

describe('relativeTo', () => {
  const day = (d: string) => Date.parse(`${d}T00:00:00Z`);
  it.each([
    ['2026-11-01', { kind: 'today' }],
    ['2026-11-02', { kind: 'tomorrow' }],
    ['2026-11-09', { kind: 'inDays', count: 8 }],
    ['2026-12-01', { kind: 'inWeeks', count: 4 }],
    ['2026-10-27', { kind: 'daysAgo', count: 5 }],
    ['2026-10-01', { kind: 'weeksAgo', count: 4 }],
  ])('%s', (start, expected) => {
    expect(relativeTo(day(start), day(TODAY))).toEqual(expected);
  });

  it('says ongoing for an ongoing event', () => {
    expect(row({ dateStart: '2026-10-30', dateEnd: '2026-11-02' }).relative).toEqual({
      kind: 'ongoing',
    });
  });
});

describe('tabs, search and sorting', () => {
  const rows = [
    row({ title: 'Palliasjon', location: 'Bodø', dateStart: '2026-10-30', dateEnd: '2026-11-02' }),
    row({ title: 'Geriatri', location: 'Narvik', dateStart: '2027-01-14', status: 'Draft' }),
    row({ title: 'Hjertesvikt', location: 'Digitalt', dateStart: '2026-10-21' }),
    row({ title: 'Akuttmedisin', location: 'Tromsø', dateStart: '2026-11-16' }),
    row({ title: 'Avlyst kurs', dateStart: '2026-11-20', status: 'Cancelled' }),
  ];
  const titles = (rs: typeof rows) => rs.map(r => r.event.title);

  it('puts ongoing in upcoming and cancelled in past', () => {
    expect(titles(rows.filter(r => inTab(r, 'upcoming')))).toEqual(['Palliasjon', 'Akuttmedisin']);
    expect(titles(rows.filter(r => inTab(r, 'draft')))).toEqual(['Geriatri']);
    expect(titles(rows.filter(r => inTab(r, 'past')))).toEqual(['Hjertesvikt', 'Avlyst kurs']);
    expect(rows.filter(r => inTab(r, 'all'))).toHaveLength(5);
  });

  it('searches title, location and date, case-insensitively', () => {
    expect(titles(rows.filter(r => matchesQuery(r, 'bodø')))).toEqual(['Palliasjon']);
    expect(titles(rows.filter(r => matchesQuery(r, '2027')))).toEqual(['Geriatri']);
    expect(rows.filter(r => matchesQuery(r, '  '))).toHaveLength(5);
  });

  it('sorts upcoming soonest first and past newest first, undated last', () => {
    const undated = row({ title: 'Udatert' });
    expect(titles(sortRows([rows[3]!, undated, rows[0]!], 'upcoming'))).toEqual([
      'Palliasjon',
      'Akuttmedisin',
      'Udatert',
    ]);
    expect(titles(sortRows([rows[2]!, rows[4]!], 'past'))).toEqual(['Avlyst kurs', 'Hjertesvikt']);
  });
});

describe('fillTone', () => {
  it.each([
    [0.5, 'primary'],
    [0.85, 'accent'],
    [1, 'warning'],
  ] as const)('%s → %s', (fill, tone) => expect(fillTone(fill)).toBe(tone));
});
