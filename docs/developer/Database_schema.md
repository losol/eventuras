# Database Schema Documentation

This document describes the database schema for the Eventuras platform.

## Overview

Eventuras uses **PostgreSQL** as its primary database, managed through **Entity Framework Core** in the .NET backend.

### Core Entities

- **Users** - User accounts and profiles
- **Organizations** - Multi-tenant organizations
- **Events** - Courses, conferences, and events
- **Registrations** - User event registrations
- **Products** - Event products and add-ons
- **Orders** - Order management
- **Certificates** - Generated certificates
- **Notifications** - Email and SMS notifications

## Entity Relationship Diagram

```
┌─────────────┐
│ Organization│
└──────┬──────┘
       │
       │ 1:N
       │
┌──────┴──────┐         ┌──────────────┐
│   Events    │────────▶│   Products   │
└──────┬──────┘   1:N   └──────────────┘
       │
       │ 1:N
       │
┌──────┴──────┐         ┌──────────────┐
│Registration │────────▶│ Registration │
│             │   1:N   │   Products   │
└──────┬──────┘         └──────────────┘
       │
       │ N:1
       │
┌──────┴──────┐
│    Users    │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────┴──────┐
│   Orders    │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────┴──────┐
│  OrderLines │
└─────────────┘
```

## Core Tables

### Users (AspNetUsers)

Stores user account information and profiles.

| Column | Type | Description |
|--------|------|-------------|
| Id | string | Primary key (GUID) |
| UserName | string | Username (usually email) |
| Email | string | User email |
| EmailConfirmed | boolean | Email verification status |
| PhoneNumber | string | User phone number |
| PhoneNumberConfirmed | boolean | Phone verification status |
| Name | string | Full name |
| GivenName | string | First name |
| FamilyName | string | Last name |
| CreatedAt | datetime | Account creation date |
| Archived | boolean | Soft delete flag |

**Indexes:**
- `IX_AspNetUsers_Email` - Email lookup
- `IX_AspNetUsers_UserName` - Username lookup

**Relationships:**
- Has many `Registrations`
- Has many `Orders`
- Belongs to many `Organizations` (through `OrganizationMembers`)

### Organizations

Multi-tenant organization accounts.

| Column | Type | Description |
|--------|------|-------------|
| OrganizationId | int | Primary key |
| Name | string(300) | Organization name |
| Description | string | Organization description |
| Url | string(300) | Organization website |
| Phone | string(300) | Contact phone |
| Email | string(300) | Contact email |
| LogoUrl | string | Logo image URL |
| LogoBase64 | string | Logo as base64 |
| IsActive | boolean | Active status |
| CreatedAt | datetime | Creation timestamp |
| UpdatedAt | datetime | Last update timestamp |

**Indexes:**
- `IX_Organizations_Name` - Organization lookup

**Relationships:**
- Has many `Events`
- Has many `OrganizationMembers`
- Has many `OrganizationSettings`

### Events

Courses, conferences, and events.

| Column | Type | Description |
|--------|------|-------------|
| EventInfoId | int | Primary key |
| OrganizationId | int | Foreign key to Organization |
| Title | string(300) | Event title |
| Slug | string(300) | URL-friendly identifier |
| Category | string(300) | Event category |
| Description | string | Event description |
| FeaturedImageUrl | string | Featured image URL |
| Featured | boolean | Featured event flag |
| OnDemand | boolean | On-demand availability |
| DateStart | datetime | Event start date |
| DateEnd | datetime | Event end date |
| LastRegistrationDate | datetime | Registration deadline |
| LastCancellationDate | datetime | Cancellation deadline |
| MaxParticipants | int | Maximum participants |
| Published | int | Publication status |
| CreatedAt | datetime | Creation timestamp |
| UpdatedAt | datetime | Last update timestamp |

**Publication Status Values:**
- `0` - Draft
- `1` - Published
- `2` - Cancelled

**Indexes:**
- `IX_Events_OrganizationId` - Organization lookup
- `IX_Events_Slug` - Slug lookup
- `IX_Events_DateStart` - Date range queries
- `IX_Events_Published_Featured` - Featured events query

**Relationships:**
- Belongs to `Organization`
- Has many `Products`
- Has many `Registrations`
- Has many `EventCollectionMappings`

### Products

Products available for events (tickets, workshops, add-ons).

| Column | Type | Description |
|--------|------|-------------|
| ProductId | int | Primary key |
| EventInfoId | int | Foreign key to Event (optional) |
| Name | string(300) | Product name |
| Description | string | Product description |
| Price | decimal(10,2) | Product price |
| VatPercent | decimal(5,2) | VAT percentage |
| Published | boolean | Publication status |
| Visibility | int | Visibility level |
| MinimumQuantity | int | Minimum order quantity |
| IsMandatory | boolean | Mandatory for event |
| EnableQuantity | boolean | Allow quantity selection |
| CreatedAt | datetime | Creation timestamp |
| UpdatedAt | datetime | Last update timestamp |

**Visibility Levels:**
- `0` - Hidden
- `1` - Event members only
- `2` - Public

**Indexes:**
- `IX_Products_EventInfoId` - Event lookup

**Relationships:**
- Belongs to `Event` (optional)
- Has many `ProductVariants`
- Has many `RegistrationProducts`

### Registrations

User registrations for events.

| Column | Type | Description |
|--------|------|-------------|
| RegistrationId | int | Primary key |
| EventInfoId | int | Foreign key to Event |
| UserId | string | Foreign key to User |
| Status | int | Registration status |
| Type | int | Registration type |
| ParticipantName | string | Participant name |
| ParticipantJobTitle | string | Job title |
| ParticipantCity | string | City |
| ParticipantEmployer | string | Employer |
| Notes | string | Additional notes |
| CreatedAt | datetime | Registration timestamp |
| UpdatedAt | datetime | Last update timestamp |

**Registration Status Values:**
- `0` - Draft
- `1` - Cancelled
- `2` - Verified
- `3` - NotAttended
- `4` - Attended
- `5` - Finished
- `6` - WaitingList

**Registration Type Values:**
- `0` - Participant
- `1` - Staff
- `2` - Lecturer
- `3` - Artist

**Indexes:**
- `IX_Registrations_EventInfoId` - Event lookup
- `IX_Registrations_UserId` - User lookup
- `IX_Registrations_Status` - Status filtering

**Relationships:**
- Belongs to `Event`
- Belongs to `User`
- Has many `RegistrationProducts`
- Has one `Certificate`

### RegistrationProducts

Many-to-many relationship between Registrations and Products.

| Column | Type | Description |
|--------|------|-------------|
| RegistrationProductId | int | Primary key |
| RegistrationId | int | Foreign key to Registration |
| ProductId | int | Foreign key to Product |
| ProductVariantId | int | Foreign key to ProductVariant (optional) |
| Quantity | int | Product quantity |
| Price | decimal(10,2) | Price at time of purchase |
| VatPercent | decimal(5,2) | VAT percentage |

**Indexes:**
- `IX_RegistrationProducts_RegistrationId`
- `IX_RegistrationProducts_ProductId`

**Relationships:**
- Belongs to `Registration`
- Belongs to `Product`
- Belongs to `ProductVariant` (optional)

### Orders

Order management for payments.

| Column | Type | Description |
|--------|------|-------------|
| OrderId | int | Primary key |
| UserId | string | Foreign key to User |
| RegistrationId | int | Foreign key to Registration (optional) |
| OrderStatus | int | Order status |
| OrderTime | datetime | Order timestamp |
| PaymentMethod | string | Payment method used |
| CreatedAt | datetime | Creation timestamp |
| UpdatedAt | datetime | Last update timestamp |

**Order Status Values:**
- `0` - Draft
- `1` - Verified
- `2` - Invoiced
- `3` - Cancelled
- `4` - Refunded

**Indexes:**
- `IX_Orders_UserId` - User lookup
- `IX_Orders_RegistrationId` - Registration lookup
- `IX_Orders_OrderStatus` - Status filtering

**Relationships:**
- Belongs to `User`
- Belongs to `Registration` (optional)
- Has many `OrderLines`

### OrderLines

Individual line items in an order.

| Column | Type | Description |
|--------|------|-------------|
| OrderLineId | int | Primary key |
| OrderId | int | Foreign key to Order |
| ProductId | int | Foreign key to Product (optional) |
| ProductVariantId | int | Foreign key to ProductVariant (optional) |
| Quantity | int | Quantity ordered |
| Price | decimal(10,2) | Unit price |
| VatPercent | decimal(5,2) | VAT percentage |
| ItemSubtotal | decimal(10,2) | Line total |
| ProductName | string | Product name (snapshot) |
| ProductDescription | string | Product description (snapshot) |

**Indexes:**
- `IX_OrderLines_OrderId` - Order lookup
- `IX_OrderLines_ProductId` - Product lookup

**Relationships:**
- Belongs to `Order`
- Belongs to `Product` (optional)
- Belongs to `ProductVariant` (optional)

### Certificates

Generated certificates for event completion.

| Column | Type | Description |
|--------|------|-------------|
| CertificateId | int | Primary key |
| RegistrationId | int | Foreign key to Registration |
| Title | string | Certificate title |
| Description | string | Certificate description |
| Comment | string | Additional comments |
| IssuedDate | datetime | Issue date |
| IssuedInCity | string | City of issuance |
| EvidenceDescription | string | Evidence of completion |
| RecipientName | string | Recipient name |

**Indexes:**
- `IX_Certificates_RegistrationId` - Registration lookup

**Relationships:**
- Belongs to `Registration`

## Supporting Tables

### OrganizationMembers

Users belonging to organizations.

| Column | Type | Description |
|--------|------|-------------|
| UserId | string | Foreign key to User |
| OrganizationId | int | Foreign key to Organization |
| Role | string | Member role |
| CreatedAt | datetime | Membership start date |

**Roles:**
- `Owner` - Organization owner
- `Admin` - Administrator
- `Member` - Regular member

**Primary Key:** Composite (UserId, OrganizationId)

### OrganizationSettings

Organization-specific settings.

| Column | Type | Description |
|--------|------|-------------|
| OrganizationSettingId | int | Primary key |
| OrganizationId | int | Foreign key to Organization |
| Key | string | Setting key |
| Value | string | Setting value |

**Indexes:**
- `IX_OrganizationSettings_OrganizationId_Key` - Setting lookup

### EventCollections

Event collections/series.

| Column | Type | Description |
|--------|------|-------------|
| CollectionId | int | Primary key |
| OrganizationId | int | Foreign key to Organization |
| Name | string(300) | Collection name |
| Slug | string(300) | URL-friendly identifier |
| Description | string | Collection description |
| FeaturedImageUrl | string | Featured image URL |
| Featured | boolean | Featured flag |

### EventCollectionMappings

Events belonging to collections.

| Column | Type | Description |
|--------|------|-------------|
| CollectionId | int | Foreign key to EventCollection |
| EventInfoId | int | Foreign key to Event |

**Primary Key:** Composite (CollectionId, EventInfoId)

### Notifications

Email and SMS notifications.

| Column | Type | Description |
|--------|------|-------------|
| NotificationId | int | Primary key |
| EventInfoId | int | Foreign key to Event (optional) |
| RegistrationId | int | Foreign key to Registration (optional) |
| RecipientUserId | string | Foreign key to User |
| Type | int | Notification type |
| Status | int | Delivery status |
| Message | string | Message content |
| Subject | string | Email subject |
| CreatedAt | datetime | Creation timestamp |
| SentAt | datetime | Delivery timestamp |

**Notification Types:**
- `0` - Email
- `1` - SMS

**Status Values:**
- `0` - Pending
- `1` - Sent
- `2` - Failed

## Indexes and Performance

### Recommended Indexes

```sql
-- Events performance
CREATE INDEX idx_events_org_published ON events(organization_id, published, date_start);
CREATE INDEX idx_events_featured ON events(featured, published) WHERE published = 1;

-- Registrations performance  
CREATE INDEX idx_registrations_user_event ON registrations(user_id, event_info_id);
CREATE INDEX idx_registrations_status_event ON registrations(status, event_info_id);

-- Orders performance
CREATE INDEX idx_orders_user_status ON orders(user_id, order_status);

-- Full-text search (if needed)
CREATE INDEX idx_events_title_fulltext ON events USING gin(to_tsvector('english', title));
CREATE INDEX idx_events_description_fulltext ON events USING gin(to_tsvector('english', description));
```

### Query Optimization

**Example: Load event with products and registrations:**

```csharp
// ❌ Bad - N+1 queries
var events = await context.Events.ToListAsync();
foreach (var evt in events)
{
    var products = await context.Products
        .Where(p => p.EventInfoId == evt.EventInfoId)
        .ToListAsync();
}

// ✅ Good - Single query with Include
var events = await context.Events
    .Include(e => e.Products)
    .Include(e => e.Registrations)
        .ThenInclude(r => r.User)
    .ToListAsync();
```

## Migrations

### Creating Migrations

```bash
# Create a new migration
cd apps/api
dotnet ef migrations add AddNewField --project src/Eventuras.WebApi

# Review migration
cat src/Eventuras.WebApi/Migrations/*_AddNewField.cs

# Apply migration
dotnet ef database update --project src/Eventuras.WebApi
```

### Migration Best Practices

1. **Always review generated migrations** before applying
2. **Test migrations on a copy of production data** first
3. **Include rollback strategy** in migration planning
4. **Back up database** before applying migrations to production
5. **Use transaction** for data migrations

### Example Migration

```csharp
public partial class AddEventSlug : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "Slug",
            table: "Events",
            type: "character varying(300)",
            maxLength: 300,
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_Events_Slug",
            table: "Events",
            column: "Slug",
            unique: true);

        // Populate slugs from titles
        migrationBuilder.Sql(@"
            UPDATE ""Events""
            SET ""Slug"" = LOWER(REGEXP_REPLACE(""Title"", '[^a-zA-Z0-9]+', '-', 'g'))
            WHERE ""Slug"" IS NULL;
        ");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_Events_Slug",
            table: "Events");

        migrationBuilder.DropColumn(
            name: "Slug",
            table: "Events");
    }
}
```

## Data Seeding

### Seed Data Location

Seed data is configured in `ApplicationDbContext.cs`:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    // Seed admin user
    modelBuilder.Entity<ApplicationUser>().HasData(
        new ApplicationUser
        {
            Id = "admin-id",
            UserName = "admin@email.com",
            Email = "admin@email.com",
            EmailConfirmed = true,
            Name = "System Admin"
        }
    );

    // Seed organization
    modelBuilder.Entity<Organization>().HasData(
        new Organization
        {
            OrganizationId = 1,
            Name = "Default Organization",
            IsActive = true
        }
    );
}
```

### Running Seed

```bash
# Seed data is applied automatically on first migration
dotnet ef database update

# Or run explicit seed
dotnet run --project src/Eventuras.WebApi -- --seed
```

## Backup and Restore

### Backup

```bash
# Full database backup
pg_dump -h localhost -U eventuras eventuras > backup.sql

# Schema only
pg_dump -h localhost -U eventuras --schema-only eventuras > schema.sql

# Data only
pg_dump -h localhost -U eventuras --data-only eventuras > data.sql

# Specific tables
pg_dump -h localhost -U eventuras -t events -t products eventuras > events_backup.sql
```

### Restore

```bash
# Restore full backup
psql -h localhost -U eventuras eventuras < backup.sql

# Restore specific tables
psql -h localhost -U eventuras eventuras < events_backup.sql
```

## Further Reading

- [Entity Framework Core Documentation](https://docs.microsoft.com/en-us/ef/core/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Migrations Guide](./Migrations.md)
- [Configuration Guide](./Configuration.md)
