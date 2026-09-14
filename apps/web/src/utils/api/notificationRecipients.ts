import type { RegistrationDto, RegistrationStatus, RegistrationType } from '@/lib/eventuras-types';

/** One resolved recipient, as the confirmation step names them. */
export type NotificationRecipient = {
  registrationId: number;
  name: string;
  contact: string;
};

export type NotificationChannel = 'email' | 'sms';

// What the API falls back to when the filter leaves these out
// (NotificationManagementService.GetRecipientsAsync).
export const DEFAULT_RECIPIENT_STATUSES: RegistrationStatus[] = [
  'Verified',
  'Attended',
  'NotAttended',
  'Finished',
];
export const DEFAULT_RECIPIENT_TYPES: RegistrationType[] = ['Participant'];

const contactFor = (registration: RegistrationDto, channel: NotificationChannel) =>
  (channel === 'email' ? registration.user?.email : registration.user?.phoneNumber)?.trim();

/**
 * Narrows registrations to the people a notification actually reaches, applying
 * the same rules as the API: the requested registration types, active users
 * only, and only those reachable on this channel. Status filtering happens in
 * the query, so registrations are expected to be pre-filtered by status.
 */
export const resolveNotificationRecipients = (
  registrations: RegistrationDto[],
  types: RegistrationType[],
  channel: NotificationChannel
): NotificationRecipient[] =>
  registrations
    .filter(registration => !!registration.type && types.includes(registration.type))
    .filter(registration => registration.user?.archived !== true)
    .flatMap<NotificationRecipient>(registration => {
      const contact = contactFor(registration, channel);
      if (!contact || registration.registrationId === undefined) return [];
      return [
        {
          registrationId: registration.registrationId,
          name: registration.user?.name?.trim() || contact,
          contact,
        },
      ];
    })
    .sort((a, b) => a.name.localeCompare(b.name));
