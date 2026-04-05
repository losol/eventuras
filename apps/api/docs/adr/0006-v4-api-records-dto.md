# ADR-0006: v4 API design principles

## Status

Draft

## Context

The v3 API has 53 DTO files with manual property-by-property mapping. Many responses nest full related objects by default (e.g., a Registration response embeds the full User, Event, and all Orders). This creates complex DTOs, deep mapping logic, and over-fetching.

With v4 we want a simpler, more predictable API surface.

## Decision

### Core principles

1. **Record-based DTOs** — all v4 DTOs are C# `record` types.
2. **Shallow by default** — responses contain only the entity's own fields. No nested objects unless explicitly requested.
3. **UUID references for relationships** — instead of embedding a full `User` object, return `userId: "uuid"`. Clients follow the reference if they need more data.
4. **Complex read models are explicit exceptions** — aggregate responses that combine multiple entities exist only where there's a clear use case (e.g., a registration detail view). They are separate endpoints, not the default.
5. **Implicit conversions are optional sugar** — for simple leaf resources, an `implicit operator` can reduce boilerplate. It's a convenience, not the core pattern.

### What this looks like

**Shallow response (the default):**

```csharp
public record OrganizationResponse(
    Guid Id,
    string Name,
    string? Description,
    string? Url,
    string? Phone,
    string? Email,
    bool Active
);
```

**Reference, not embed:**

```csharp
// v3 (nested)
{ "user": { "id": "...", "name": "...", "email": "...", ... } }

// v4 (reference)
{ "userId": "550e8400-..." }
```

**Input record:**

```csharp
public record OrganizationInput(
    [property: Required] string Name,
    string? Description,
    string? Url,
    string? Phone,
    string? Email
);
```

**Controller:**

```csharp
[ApiVersion("4.0-beta")]
[Route("v{version:apiVersion}/organizations")]
public class OrganizationsController : ControllerBase
{
    [HttpGet("{id:guid}")]
    public async Task<OrganizationResponse> Get(Guid id) => ...;

    [HttpPost]
    public async Task<OrganizationResponse> Create(OrganizationInput input) => ...;
}
```

### Mapping approach

There is no single mandated mapping strategy. Use what fits:

| Complexity | Approach | Example |
| --- | --- | --- |
| Simple leaf entity | `implicit operator` or inline construction | Organization, User, Product |
| Entity with UUID references | Inline construction mapping `entity.Uuid` to `Id` | Registration (shallow), Order (shallow) |
| Aggregate read model | Static `From()` factory method at a separate endpoint | Registration detail with user + event + orders |

### Key decisions

- **`Uuid` as `Id`** — v4 responses expose `entity.Uuid` as `Id`. The int PK is never exposed.
- **API version `4.0-beta`** — allows iteration before locking the contract.
- **v3 preserved** — v4 controllers live alongside v3 in `/Controllers/v4/`.
- **No mapping library** — records + inline construction is sufficient.

## Implementation order

Start with `Organization` (new UI needed):

1. `OrganizationResponse` / `OrganizationInput` records
2. v4 `OrganizationsController`
3. Service layer: add `GetByUuidAsync` method

Then expand one entity at a time.

## Consequences

### Positive

- Predictable API — every response has the same shape (flat, with UUID references)
- Less over-fetching — clients request only what they need
- Simpler DTOs — most records are 5-15 fields with no nesting
- Less mapping code — no deep object graph construction by default
- Records give `Equals`/`GetHashCode`/`ToString` for free

### Negative

- More HTTP requests for clients that need related data (N+1 if naive)
- May need batch/expand endpoints later for performance-critical views
- Two API versions to maintain during transition
