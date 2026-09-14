import { describe, expect, it } from 'vitest';

import type { RegistrationDto } from '@/lib/eventuras-types';

import {
  DEFAULT_RECIPIENT_STATUSES,
  DEFAULT_RECIPIENT_TYPES,
  resolveNotificationRecipients,
} from './notificationRecipients';

let nextId = 0;

const registration = (overrides: Partial<RegistrationDto> = {}): RegistrationDto => ({
  registrationId: ++nextId,
  type: 'Participant',
  status: 'Verified',
  user: { name: 'Kari Nordmann', email: 'kari@example.com', phoneNumber: '+4790000000' },
  ...overrides,
});

describe('resolveNotificationRecipients', () => {
  it('matches the API defaults it mirrors', () => {
    expect(DEFAULT_RECIPIENT_STATUSES).toEqual(['Verified', 'Attended', 'NotAttended', 'Finished']);
    expect(DEFAULT_RECIPIENT_TYPES).toEqual(['Participant']);
  });

  it('keeps participants reachable on the channel', () => {
    const recipients = resolveNotificationRecipients(
      [registration({ user: { name: 'Ola Hansen', email: 'ola@example.com' } })],
      ['Participant'],
      'email'
    );

    expect(recipients).toEqual([
      { registrationId: expect.any(Number), name: 'Ola Hansen', contact: 'ola@example.com' },
    ]);
  });

  it('drops registrations whose type is not selected', () => {
    const recipients = resolveNotificationRecipients(
      [
        registration({ type: 'Lecturer' }),
        registration({ type: 'Participant', user: { name: 'Ola', email: 'ola@example.com' } }),
      ],
      ['Participant'],
      'email'
    );

    expect(recipients.map(r => r.name)).toEqual(['Ola']);
  });

  it('drops archived users, as ActiveUsersOnly does on the API', () => {
    const recipients = resolveNotificationRecipients(
      [registration({ user: { name: 'Arkivert', email: 'a@example.com', archived: true } })],
      ['Participant'],
      'email'
    );

    expect(recipients).toEqual([]);
  });

  it('drops anyone with no address on the channel', () => {
    const registrations = [
      registration({ user: { name: 'Uten e-post', phoneNumber: '+4790000001' } }),
      registration({ user: { name: 'Tom streng', email: '   ', phoneNumber: '+4790000002' } }),
      registration({ user: { name: 'Uten telefon', email: 'b@example.com' } }),
    ];

    expect(resolveNotificationRecipients(registrations, ['Participant'], 'email')).toHaveLength(1);
    expect(resolveNotificationRecipients(registrations, ['Participant'], 'sms')).toHaveLength(2);
  });

  it('falls back to the address when the user has no name', () => {
    const recipients = resolveNotificationRecipients(
      [registration({ user: { email: 'navnlos@example.com' } })],
      ['Participant'],
      'email'
    );

    expect(recipients[0]!.name).toBe('navnlos@example.com');
  });

  it('sorts by name so the list is scannable', () => {
    const recipients = resolveNotificationRecipients(
      [
        registration({ user: { name: 'Per Olsen', email: 'per@example.com' } }),
        registration({ user: { name: 'Ingrid Berg', email: 'ingrid@example.com' } }),
        registration({ user: { name: 'Ola Hansen', email: 'ola@example.com' } }),
      ],
      ['Participant'],
      'email'
    );

    expect(recipients.map(r => r.name)).toEqual(['Ingrid Berg', 'Ola Hansen', 'Per Olsen']);
  });
});
