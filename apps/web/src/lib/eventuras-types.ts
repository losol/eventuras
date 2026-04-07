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

// Named enum const objects — these carry both a value and a derived union type.
// Importing { RegistrationStatus } from here gives access to both
// RegistrationStatus.DRAFT etc. (value) and RegistrationStatus as a type.
export {
  EventInfoStatus,
  EventInfoType,
  OrderStatus,
  PaymentProvider,
  RegistrationStatus,
  RegistrationType,
} from '@eventuras/event-sdk';

// Type-only re-exports that have no corresponding const object
export type {
  CertificateDto,
  EmailNotificationDto,
  EventCollectionDto,
  EventDto,
  EventParticipantsFilterDto,
  OrganizationDto,
  ProductDto,
  RegistrationDto,
  SmsNotificationDto,
  UserDto,
} from '@eventuras/event-sdk';
