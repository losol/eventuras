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
 */

// Re-export all types
export type {
  EmailNotificationDto,
  SmsNotificationDto,
  EventParticipantsFilterDto,
  EventDto,
  ProductDto,
  RegistrationDto,
  UserDto,
  OrganizationDto,
  CertificateDto,
  EventCollectionDto,
} from '@eventuras/event-sdk';

// Re-export enums (these have runtime values)
export { RegistrationStatus, RegistrationType } from '@eventuras/event-sdk';
