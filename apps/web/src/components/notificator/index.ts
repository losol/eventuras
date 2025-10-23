/**
 * Notificator Components
 *
 * Generic and specialized notificator components for sending emails and SMS.
 */

export { default as Notificator, NotificationType } from './Notificator';
export type { NotificatorProps, FilterOption, FilterGroup } from './Notificator';

export { default as EventNotificator } from './EventNotificator';
export type { EventNotificatorProps } from './EventNotificator';
