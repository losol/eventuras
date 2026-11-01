import type { BusinessEventDto } from '@/lib/eventuras-sdk';

export type BusinessEventStatus = 'neutral' | 'success' | 'warning' | 'info';

/** Timeline tone for a business event, read off the event type's suffix. */
export function statusForEventType(eventType: string | undefined): BusinessEventStatus {
  if (!eventType) return 'neutral';
  if (eventType.endsWith('.cancelled') || eventType.endsWith('.refunded')) return 'warning';
  if (eventType.endsWith('.verified') || eventType.endsWith('.created')) return 'success';
  if (eventType.endsWith('.invoiced')) return 'info';
  return 'neutral';
}

export const ACTIVITY_SUBJECTS = ['event', 'registration', 'order'] as const;
export type ActivitySubject = (typeof ACTIVITY_SUBJECTS)[number];
export type ActivityFilter = 'all' | ActivitySubject;

export function matchesActivityFilter(event: BusinessEventDto, filter: ActivityFilter): boolean {
  return filter === 'all' || event.subjectType === filter;
}

const SUBJECT_PATHS: Record<string, string> = {
  event: '/admin/events',
  order: '/admin/orders',
  registration: '/admin/registrations',
};

/** Admin page for the event's subject, when it has one. */
export function subjectHref(event: BusinessEventDto): string | undefined {
  const base = event.subjectType ? SUBJECT_PATHS[event.subjectType] : undefined;
  return base && event.subjectId != null ? `${base}/${event.subjectId}` : undefined;
}

/** Who made the change: their name, else a short id so admins can correlate. */
export function actorLabel(event: BusinessEventDto): string | undefined {
  return event.actorName ?? event.actorUserUuid?.slice(0, 8);
}
