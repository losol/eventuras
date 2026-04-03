# ADR-0004: Add UUID to all entities

## Status

Draft

## Context

The API currently uses auto-increment `int` primary keys in URLs and JSON responses. This leaks information (entity count, creation order) and couples clients to an internal database detail. With v3 we've already moved `ApplicationUser.Id` to `Guid` and `Registration`/`Order`/`BusinessEvent` have a `Uuid` field.

The plan is:

1. **v3** — Add a `Uuid` column to all entities that don't have one yet. Keep `int` PKs as-is. The v3 API continues to use `int` IDs.
2. **v4 API** — Expose `Uuid` as the primary identifier in all API endpoints. Frontend migrates to use UUIDs.
3. **v4 release** — Drop `int` PKs, promote `Uuid` to PK.

This ADR covers step 1 only.

## Decision

Add `public Guid Uuid { get; set; } = Guid.CreateVersion7();` to all entities that currently use `int` primary keys and don't already have a Uuid field.

### Entities to update

| Entity | Current PK | Already has Uuid |
| --- | --- | --- |
| `EventInfo` | `int EventInfoId` | No |
| `Organization` | `int OrganizationId` | No |
| `OrganizationMember` | `int Id` | No |
| `Product` | `int ProductId` | No |
| `ProductVariant` | `int ProductVariantId` | No |
| `OrderLine` | `int OrderLineId` | No |
| `Invoice` | `int InvoiceId` | No |
| `Certificate` | `int CertificateId` | `CertificateGuid` — rename to `Uuid`, drop unused `Auth` column |
| `Notification` | `int NotificationId` | No |
| `NotificationRecipient` | `int RecipientId` | No |
| `NotificationStatistics` | `int NotificationStatisticsId` | No |
| `EventCollection` | `int CollectionId` | No |

### Entities already done (no changes needed)

| Entity | Identifier |
| --- | --- |
| `ApplicationUser` | `Guid Id` (PK) |
| `Registration` | `int RegistrationId` + `Guid Uuid` |
| `Order` | `int OrderId` + `Guid Uuid` |
| `BusinessEvent` | `Guid Uuid` (PK) |

### Entities excluded

| Entity | Reason |
| --- | --- |
| `PaymentMethod` | Uses `PaymentProvider` enum as PK — reference/config data, not a domain entity |
| `OrganizationMemberRole` | Composite key (`OrganizationMemberId` + `Role`) — junction table |
| `OrganizationSetting` | Composite key (`OrganizationId` + `Name`) — key-value config |
| `OrganizationHostname` | Composite key (`OrganizationId` + `Hostname`) — junction table |
| `EventCollectionMapping` | Composite key (`CollectionId` + `EventId`) — junction table |

## Implementation

For each entity:

1. Add `public Guid Uuid { get; set; } = Guid.CreateVersion7();`
2. Add a unique index on `Uuid` in `ApplicationDbContext.OnModelCreating`

The migration will:

1. Add nullable `Uuid` columns
2. Backfill existing rows with `uuidv7()` via explicit UPDATE
3. Set columns to NOT NULL with `uuidv7()` as default for new rows
4. Create unique indexes on each `Uuid` column

No changes to DTOs, controllers, or API endpoints in this step — that's v4.

## Consequences

### Positive

- Every entity has a stable, opaque identifier ready for external use
- v4 API migration becomes a straightforward swap from int→uuid in DTOs and routes
- UUIDs are generated at entity creation time (v7 = time-sorted)

### Negative

- Adds one column to 12 tables (minor storage overhead)
- Existing rows get `uuidv7()` UUIDs (unique per row, but not reflecting original creation time)
