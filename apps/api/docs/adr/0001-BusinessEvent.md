# ADR-0001: Introduce BusinessEvent for domain event tracking

## Status
Draft

## Context
The current solution stores some domain-related events as free-text logs inside entities (e.g. `Order.Log`).  
This leads to:

- Limited queryability across entities
- Lack of structure and semantics
- Mixing domain state with historical/audit data
- Poor foundation for analytics and admin tooling

We need a flexible, generic, and maintainable way to track business-level events across the system.

## Decision
Introduce a centralized, append-only `BusinessEvent` table for domain events.

### Core design principles

- **Generic subject reference**
  - `SubjectType` (e.g. "order", "registration")
  - `SubjectUuid` (string)

- **Stable event semantics**
  - `EventType` (e.g. "order.created", "order.cancelled")

- **Separation of concerns**
  - Domain entities do not store logs internally
  - Logging handled via application service

- **Flexible payload**
  - Optional structured metadata stored as JSON

### Explicitly avoided

- `object`-based APIs for entities
- Multiple nullable foreign keys per entity type
- Free-text log fields inside domain models
- Overly rigid schema for event-specific data

## Consequences

### Positive
- Enables cross-entity querying and filtering
- Clean separation between domain state and history
- Supports structured metadata and future analytics
- Avoids schema changes for new event types
- Simple and extensible model

### Negative
- No DB-enforced FK constraints for subjects
- Requires consistent use of `SubjectType`
- Slight increase in architectural complexity

## Migration strategy

1. Introduce `BusinessEvent` table and service
2. Start logging events for `Order` (status changes, creation)
3. Stop writing to `Order.Log`
4. Gradually migrate other entities
5. Remove obsolete log fields in a later version

---

# Appendix A: Domain model

```csharp
public class BusinessEvent
{
    public Guid Uuid { get; set; } = Guid.CreateVersion7();

    public Instant CreatedAt { get; set; } = SystemClock.Instance.GetCurrentInstant();

    public string EventType { get; set; } = string.Empty;
    
    public string SubjectType { get; set; } = string.Empty;
    public Guid SubjectUuid { get; set; }

    public Guid? ActorUserUuid { get; set; }

    public string Message { get; set; } = string.Empty;
    
    public string? MetadataJson { get; set; }
}
```

# Appendix B: Subject abstraction

```csharp
public sealed record BusinessEventSubject(
    string Type,
    Guid Uuid);
```

Helper factory:

```csharp
public static class BusinessEventSubjects
{
    public static BusinessEventSubject ForOrder(Guid orderId) =>
        new("order", orderId);

    public static BusinessEventSubject ForRegistration(Guid registrationId) =>
        new("registration", registrationId);

    public static BusinessEventSubject ForUser(Guid userId) =>
        new("user", userId);
}
```

# Appendix C: Service interface

```csharp
public interface IBusinessEventService
{
    void AddEvent(
        BusinessEventSubject subject,
        string eventType,
        string message,
        Guid? actorUserUuid = null,
        object? metadata = null);
}
```

# Appendix D: Example implementation

```csharp
public class BusinessEventService : IBusinessEventService
{
    private readonly ApplicationDbContext _dbContext;

    public BusinessEventService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public void AddEvent(
        BusinessEventSubject subject,
        string eventType,
        string message,
        Guid? actorUserUuid = null,
        object? metadata = null)
    {
        var entity = new BusinessEvent
        {
            EventType = eventType,
            Message = message,
            SubjectType = subject.Type,
            SubjectUuid = subject.Uuid,
            ActorUserUuid = actorUserUuid,
            MetadataJson = metadata is null
                ? null
                : JsonSerializer.Serialize(metadata)
        };

        _dbContext.BusinessEvents.Add(entity);
    }
}
```

# Appendix E: Example usage

```csharp
// Calling service owns SaveChangesAsync — event is persisted in the same transaction
businessEventService.AddEvent(
    BusinessEventSubjects.ForOrder(order.OrderUuid),
    "order.verified",
    "Order was verified",
    actorUserUuid: currentUserUuid);

await _dbContext.SaveChangesAsync(cancellationToken);
```

# Appendix F: Indexing strategy (EF Core)

```csharp
modelBuilder.Entity<BusinessEvent>(entity =>
{
    entity.HasIndex(x => x.CreatedAt);

    entity.HasIndex(x => new
    {
        x.SubjectType,
        x.SubjectUuid
    });

    entity.HasIndex(x => x.EventType);

    entity.HasIndex(x => x.ActorUserUuid);
});
```

# Appendix G: Notes

- `CreatedAt` uses NodaTime (`Instant`)
- `MetadataJson` is optional and should be versioned if needed
- Keep initial implementation minimal
- Avoid over-engineering event taxonomy early
