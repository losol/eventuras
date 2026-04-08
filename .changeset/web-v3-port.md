---
"@eventuras/web": major
---

### v3.0 — Port to API project v3 and event-sdk v3

#### Identity and user IDs

- User IDs are now UUIDs (`string`) instead of `number`. Every signature,
  comparison, mapper, and React prop that previously treated `userId` as
  numeric has been updated. Affects registration flows, admin participant
  lists, event editor, and API mappers.
- `getV3UsersMe` replaced with `getV3Userprofile` (renamed in API v3).

#### SDK type and export changes

- `*DtoPageResponseDto` types renamed to `PageResponseDtoOf*` to match the
  regenerated SDK.
- `RegistrationType` and `RegistrationStatus` are now type-only exports;
  runtime enum-style usage replaced with string literals.
- Nullable fields now arrive as `string | null` instead of `string | undefined`;
  call sites updated accordingly.
- `isolatedModules`-safe re-exports (`export type`) where the SDK types flow
  through `lib/eventuras-types.ts`.

#### Removed fields

- `order.log` removed — the field is no longer part of the `Order` DTO. The
  admin order actions menu no longer renders log history (superseded by the
  new `BusinessEvents` stream).
- `externalRegistrationsUrl` form field removed from the event editor. The
  API now hardcodes this to an empty string and ignores any input, so the
  corresponding `TextField` has been dropped.
