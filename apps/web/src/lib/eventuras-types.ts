/**
 * Types and Enums from Eventuras SDK
 *
 * This module re-exports types and enums from @eventuras/event-sdk
 * for safe use in client components.
 *
 * ⚠️ Only types and enums should be exported here - NO functions or API clients!
 *
 * Client components can import types/enums from here without bundling
 * the server-side client configuration.
 *
 * NOTE: In SDK v3 the enum types (RegistrationStatus, RegistrationType, …) are
 * plain `number` type aliases — they no longer carry named members.  The const
 * objects below restore the named-member access pattern used across the app.
 */

// Re-export all types
export type {
  CertificateDto,
  EmailNotificationDto,
  EventCollectionDto,
  EventDto,
  EventInfoStatus,
  EventInfoType,
  EventParticipantsFilterDto,
  OrganizationDto,
  ProductDto,
  RegistrationDto,
  RegistrationStatus,
  RegistrationType,
  SmsNotificationDto,
  UserDto,
} from '@eventuras/event-sdk';

/**
 * Named constants for RegistrationStatus (mirrors the C# enum).
 * Values are integers as returned by the v3 API.
 */
export const RegistrationStatus = {
  DRAFT: 0,
  CANCELLED: 1,
  VERIFIED: 2,
  NOT_ATTENDED: 3,
  ATTENDED: 4,
  FINISHED: 5,
  WAITING_LIST: 6,
} as const;

/**
 * Named constants for RegistrationType (mirrors the C# enum).
 */
export const RegistrationType = {
  PARTICIPANT: 0,
  STUDENT: 1,
  STAFF: 2,
  LECTURER: 3,
  ARTIST: 4,
} as const;

/**
 * Named constants for EventInfoStatus (mirrors the C# enum).
 */
export const EventInfoStatus = {
  DRAFT: 0,
  PLANNED: 1,
  REGISTRATIONS_OPEN: 2,
  WAITING_LIST: 3,
  REGISTRATIONS_CLOSED: 4,
  FINISHED: 5,
  ARCHIVED: 8,
  CANCELLED: 9,
} as const;

/**
 * Named constants for EventInfoType (mirrors the C# enum).
 */
export const EventInfoType = {
  COURSE: 0,
  CONFERENCE: 1,
  ONLINE_COURSE: 2,
  SOCIAL: 3,
  OTHER: 9,
} as const;

/**
 * Named constants for OrderStatus (mirrors the C# enum).
 */
export const OrderStatus = {
  DRAFT: 0,
  VERIFIED: 1,
  INVOICED: 2,
  CANCELLED: 3,
  REFUNDED: 4,
} as const;

/**
 * Named constants for PaymentProvider (mirrors the C# enum).
 */
export const PaymentProvider = {
  EMAIL_INVOICE: 1,
  POWER_OFFICE_EMAIL_INVOICE: 2,
  POWER_OFFICE_EHF_INVOICE: 3,
  STRIPE_INVOICE: 4,
  STRIPE_DIRECT: 5,
  VIPPS_INVOICE: 6,
  VIPPS_DIRECT: 7,
} as const;
