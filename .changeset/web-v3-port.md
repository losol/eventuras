---
"@eventuras/web": minor
---

Migrate to event-sdk v3:

- Replace `getV3UsersMe` with `getV3Userprofile` (renamed in API v3)
- Rename `*DtoPageResponseDto` types to `PageResponseDtoOf*` to match the regenerated SDK
- Handle nullable fields where the SDK now returns `string | null` instead of `string | undefined`
