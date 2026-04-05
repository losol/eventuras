# ADR-0005: v4 API — Records-based DTOs

## Status

Draft

## Context

The v3 API has 53 DTO files with manual property-by-property mapping in constructors. Most are near-1:1 copies of domain entities (e.g., `UserDto` copies 22 properties from `ApplicationUser`). This creates maintenance overhead — every domain field change requires updating the DTO constructor, the DTO properties, and potentially a `CopyTo()` method.

With v4 we also want to switch from `int` IDs to `Uuid` as the primary identifier in all API endpoints, which means every DTO needs to change anyway.

## Decision

Use C# `record` types for v4 DTOs with `implicit operator` for mapping from domain entities.

### Response records

Named `{Entity}Response`. Contain an `implicit operator` from the domain entity so mapping is declared once and used everywhere without manual `new Dto(entity)` calls.

```csharp
public record OrganizationResponse(
    Guid Id,
    string Name,
    string? Description,
    string? Url,
    string? Phone,
    string? Email,
    bool Active
)
{
    public static implicit operator OrganizationResponse(Organization o) =>
        new(o.Uuid, o.Name, o.Description, o.Url, o.Phone, o.Email, o.Active);
}
```

### Input records

Named `{Entity}Input`. Plain records with validation attributes and an `ApplyTo()` method for updates.

```csharp
public record OrganizationInput(
    [property: Required] string Name,
    string? Description,
    string? Url,
    string? Phone,
    string? Email
)
{
    public void ApplyTo(Organization org)
    {
        org.Name = Name;
        org.Description = Description;
        org.Url = Url;
        org.Phone = Phone;
        org.Email = Email;
    }
}
```

### Controller usage

```csharp
[ApiVersion("4")]
[Route("v{version:apiVersion}/organizations")]
public class OrganizationsController : ControllerBase
{
    [HttpGet("{id:guid}")]
    public async Task<OrganizationResponse> Get(Guid id) =>
        await _service.GetByUuidAsync(id); // implicit conversion

    [HttpGet]
    public async Task<PageResponseDto<OrganizationResponse>> List([FromQuery] query) =>
        PageResponseDto<OrganizationResponse>.FromPaging(query, paging, o => o);
        // implicit operator means the lambda is just identity
}
```

### Key decisions

- **`Uuid` as `Id` in API** — v4 response records map `entity.Uuid` to a property named `Id`. The int PK is not exposed.
- **Nested records** — the implicit operator handles nesting naturally. `OrganizationResponse` inside `OrganizationMemberResponse` just works via implicit conversion.
- **Collections** — `IEnumerable<T>` with LINQ `.Select()` uses the implicit operator automatically.
- **Pagination** — keep existing `PageResponseDto<T>` pattern, it already uses generic mapping delegates.
- **v3 preserved** — v4 controllers live alongside v3 in `/Controllers/v4/`. API versioning is already configured.

## Implementation order

Start with `Organization` to establish the pattern (new UI needed for this entity):

1. `OrganizationResponse` / `OrganizationInput` records
2. v4 `OrganizationsController`
3. Service layer: add `GetByUuidAsync` methods

Then expand to remaining entities:

4. `UserResponse` / `UserInput`
5. `EventResponse` / `EventInput`
6. `RegistrationResponse` — complex nesting (User, Event, Orders)
7. Remaining entities

## Consequences

### Positive

- Records are immutable, concise, and get `Equals`/`GetHashCode`/`ToString` for free
- `implicit operator` eliminates all manual `new Dto(entity)` calls in controllers
- Mapping is declared once, in the record itself
- Adding a new domain field = add to record constructor + update implicit operator (one place)
- Type-safe at compile time — missing field = build error

### Negative

- `implicit operator` can hide allocations (but same as constructor-based DTOs)
- Complex projections (conditional nesting, fallback logic) may not fit the implicit operator pattern — use explicit factory methods for those cases
- Two API versions to maintain
