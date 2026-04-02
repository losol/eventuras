# ADR-00X: Introduce BusinessEventLog for domain event tracking

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
Introduce a centralized, append-only `BusinessEventLog` table for domain events.

### Core design principles

- **Generic subject reference**
  - `SubjectType` (e.g. "order", "registration")
  - `SubjectId` (string)

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

1. Introduce `BusinessEventLog` table and service
2. Start logging events for `Order` (status changes, creation)
3. Stop writing to `Order.Log`
4. Gradually migrate other entities
5. Remove obsolete log fields in a later version

---

# Appendix A: Domain model

```csharp
public class BusinessEventLog
{
    public int BusinessEventLogId { get; set; }

    public Instant Timestamp { get; set; } = SystemClock.Instance.GetCurrentInstant();

    public string EventType { get; set; } = string.Empty;
    
    public string SubjectType { get; set; } = string.Empty;
    public string SubjectId { get; set; } = string.Empty;

    public string? ActorUserId { get; set; }

    public string Message { get; set; } = string.Empty;
    
    public string? MetadataJson { get; set; }
}
```

# Appendix B: Subject abstraction

```csharp
public sealed record BusinessEventSubject(
    string Type,
    string Id);
```

Helper factory:

```csharp
public static class BusinessEventSubjects
{
    public static BusinessEventSubject ForOrder(int orderId) =>
        new("order", orderId.ToString());

    public static BusinessEventSubject ForRegistration(int registrationId) =>
        new("registration", registrationId.ToString());

    public static BusinessEventSubject ForUser(string userId) =>
        new("user", userId);
}
```

# Appendix C: Service interface

```csharp
public interface IBusinessEventService
{
    Task LogEventAsync(
        BusinessEventSubject subject,
        string eventType,
        string message,
        string? actorUserId = null,
        object? metadata = null,
        CancellationToken cancellationToken = default);
}
```

# Appendix D: Example implementation

```csharp
public class BusinessEventService : IBusinessEventService
{
    private readonly EventurasDbContext _dbContext;

    public BusinessEventService(EventurasDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task LogEventAsync(
        BusinessEventSubject subject,
        string eventType,
        string message,
        string? actorUserId = null,
        object? metadata = null,
        CancellationToken cancellationToken = default)
    {
        var entity = new BusinessEventLog
        {
            EventType = eventType,
            Message = message,
            SubjectType = subject.Type,
            SubjectId = subject.Id,
            ActorUserId = actorUserId,
            MetadataJson = metadata is null
                ? null
                : JsonSerializer.Serialize(metadata)
        };

        _dbContext.BusinessEventLogs.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
```

# Appendix E: Example usage

```csharp
await businessEventService.LogEventAsync(
    BusinessEventSubjects.ForOrder(order.OrderId),
    "order.verified",
    "Order was verified",
    actorUserId: currentUserId,
    cancellationToken: cancellationToken);
```

# Appendix F: Indexing strategy (EF Core)

```csharp
modelBuilder.Entity<BusinessEventLog>(entity =>
{
    entity.HasIndex(x => x.Timestamp);

    entity.HasIndex(x => new
    {
        x.SubjectType,
        x.SubjectId
    });

    entity.HasIndex(x => x.EventType);

    entity.HasIndex(x => x.ActorUserId);
});
```

# Appendix G: Notes

- `Timestamp` uses NodaTime (`Instant`)
- `MetadataJson` is optional and should be versioned if needed
- Keep initial implementation minimal
- Avoid over-engineering event taxonomy early
