import type { EventDto } from '@/lib/eventuras-sdk';

export type OverviewState = 'draft' | 'upcoming' | 'ongoing' | 'past' | 'cancelled';
export type OverviewTab = 'upcoming' | 'draft' | 'past' | 'all';
export const OVERVIEW_TABS: OverviewTab[] = ['upcoming', 'draft', 'past', 'all'];

export type BadgeStatus = 'neutral' | 'success' | 'warning' | 'error' | 'info';
export type StatusKey =
  | 'draft'
  | 'cancelled'
  | 'past'
  | 'ongoing'
  | 'open'
  | 'full'
  | 'waitingList'
  | 'closed'
  | 'planned';

export type Relative =
  | { kind: 'ongoing' | 'today' | 'tomorrow' }
  | { kind: 'inDays' | 'inWeeks' | 'daysAgo' | 'weeksAgo'; count: number };

export interface OverviewRow {
  event: EventDto;
  state: OverviewState;
  statusKey: StatusKey;
  badge: BadgeStatus;
  registrations: number;
  capacity?: number;
  /** registrations / capacity, when there is a capacity. */
  fill?: number;
  relative?: Relative;
}

const DAY = 86_400_000;

/** A LocalDate ("2026-11-01") as UTC midnight millis. */
const toDay = (date?: string | null): number | undefined =>
  date ? Date.parse(`${date.slice(0, 10)}T00:00:00Z`) : undefined;

function stateOf(event: EventDto, today: number): OverviewState {
  if (event.status === 'Draft') return 'draft';
  if (event.status === 'Cancelled') return 'cancelled';
  if (event.status === 'Finished' || event.status === 'Archived') return 'past';

  const start = toDay(event.dateStart);
  if (start === undefined) return 'upcoming';
  const end = toDay(event.dateEnd) ?? start;
  if (end < today) return 'past';
  return start <= today ? 'ongoing' : 'upcoming';
}

function statusOf(event: EventDto, state: OverviewState, full: boolean): [StatusKey, BadgeStatus] {
  switch (state) {
    case 'draft':
      return ['draft', 'neutral'];
    case 'cancelled':
      return ['cancelled', 'error'];
    case 'past':
      return ['past', 'neutral'];
    case 'ongoing':
      return ['ongoing', 'info'];
  }
  switch (event.status) {
    case 'RegistrationsOpen':
      // Only infer "full" when registration is open; other statuses say more.
      return full ? ['full', 'warning'] : ['open', 'success'];
    case 'WaitingList':
      return ['waitingList', 'warning'];
    case 'RegistrationsClosed':
      return ['closed', 'neutral'];
    default:
      return ['planned', 'neutral'];
  }
}

export function relativeTo(start: number, today: number): Relative {
  const days = Math.round((start - today) / DAY);
  if (days === 0) return { kind: 'today' };
  if (days === 1) return { kind: 'tomorrow' };
  if (days > 0) {
    return days < 14
      ? { kind: 'inDays', count: days }
      : { kind: 'inWeeks', count: Math.round(days / 7) };
  }
  return days > -14
    ? { kind: 'daysAgo', count: -days }
    : { kind: 'weeksAgo', count: Math.round(-days / 7) };
}

/** `today` is a LocalDate; `registrations` the active count for the event. */
export function toOverviewRow(event: EventDto, registrations: number, today: string): OverviewRow {
  const todayMs = toDay(today)!;
  const state = stateOf(event, todayMs);
  const capacity =
    event.maxParticipants && event.maxParticipants > 0 ? event.maxParticipants : undefined;
  const full = capacity !== undefined && registrations >= capacity;
  const [statusKey, badge] = statusOf(event, state, full);
  const start = toDay(event.dateStart);

  let relative: Relative | undefined;
  if (state === 'ongoing') relative = { kind: 'ongoing' };
  else if (start !== undefined) relative = relativeTo(start, todayMs);

  return {
    event,
    state,
    statusKey,
    badge,
    registrations,
    capacity,
    fill: capacity ? registrations / capacity : undefined,
    relative,
  };
}

export function inTab(row: OverviewRow, tab: OverviewTab): boolean {
  switch (tab) {
    case 'all':
      return true;
    case 'upcoming':
      return row.state === 'upcoming' || row.state === 'ongoing';
    case 'draft':
      return row.state === 'draft';
    case 'past':
      return row.state === 'past' || row.state === 'cancelled';
  }
}

export function matchesQuery(row: OverviewRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const { title, location, city, dateStart } = row.event;
  return [title, location, city, dateStart].some(v => v?.toLowerCase().includes(q));
}

/** Upcoming and drafts soonest first; past and "all" newest first. Undated last. */
export function sortRows(rows: OverviewRow[], tab: OverviewTab): OverviewRow[] {
  const desc = tab === 'past' || tab === 'all';
  return [...rows].sort((a, b) => {
    const x = a.event.dateStart ?? '';
    const y = b.event.dateStart ?? '';
    if (!x && !y) return 0;
    if (!y) return -1;
    if (!x) return 1;
    return desc ? y.localeCompare(x) : x.localeCompare(y);
  });
}

export type FillTone = 'primary' | 'accent' | 'warning';
export function fillTone(fill: number): FillTone {
  if (fill >= 1) return 'warning';
  if (fill >= 0.85) return 'accent';
  return 'primary';
}
