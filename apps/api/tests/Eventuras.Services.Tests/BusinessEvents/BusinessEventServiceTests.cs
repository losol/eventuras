#nullable enable

using System;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services;
using Eventuras.Services.BusinessEvents;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using Xunit;

namespace Eventuras.Services.Tests.BusinessEvents;

public class BusinessEventServiceTests
{
    private static ApplicationDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    private static BusinessEventService CreateService(ApplicationDbContext db)
        => new(db, new NoopAccessControl());

    // Unit tests exercise AddEvent (which does not touch access control) and
    // the pure query-shape of ListEventsAsync. HTTP-level access enforcement
    // is covered by BusinessEventsControllerTest in WebApi.Tests.
    private sealed class NoopAccessControl : IBusinessEventAccessControlService
    {
        public Task CheckListAccessAsync(Guid organizationUuid, CancellationToken cancellationToken = default)
            => Task.CompletedTask;
    }

    [Fact]
    public void AddEvent_Throws_On_Null_Subject()
    {
        using var db = CreateDbContext();
        var service = CreateService(db);

        Assert.Throws<ArgumentNullException>(() =>
            service.AddEvent(null!, "order.created", "Order created"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("  ")]
    public void AddEvent_Throws_On_Invalid_EventType(string? eventType)
    {
        using var db = CreateDbContext();
        var service = CreateService(db);
        var subject = BusinessEventSubjects.ForOrder(Guid.NewGuid());

        Assert.ThrowsAny<ArgumentException>(() =>
            service.AddEvent(subject, eventType!, "Order created"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("  ")]
    public void AddEvent_Throws_On_Invalid_Message(string? message)
    {
        using var db = CreateDbContext();
        var service = CreateService(db);
        var subject = BusinessEventSubjects.ForOrder(Guid.NewGuid());

        Assert.ThrowsAny<ArgumentException>(() =>
            service.AddEvent(subject, "order.created", message!));
    }

    [Fact]
    public void AddEvent_Adds_Entity_To_DbContext()
    {
        using var db = CreateDbContext();
        var service = CreateService(db);
        var orderUuid = Guid.NewGuid();
        var organizationUuid = Guid.NewGuid();
        var actorUuid = Guid.NewGuid();

        service.AddEvent(
            BusinessEventSubjects.ForOrder(orderUuid),
            "order.created",
            "Order was created",
            organizationUuid: organizationUuid,
            actorUserUuid: actorUuid);

        var entry = db.ChangeTracker.Entries<BusinessEvent>().Single();
        var entity = entry.Entity;

        Assert.Equal("order", entity.SubjectType);
        Assert.Equal(orderUuid, entity.SubjectUuid);
        Assert.Equal(organizationUuid, entity.OrganizationUuid);
        Assert.Equal("order.created", entity.EventType);
        Assert.Equal("Order was created", entity.Message);
        Assert.Equal(actorUuid, entity.ActorUserUuid);
        Assert.Null(entity.MetadataJson);
    }

    [Fact]
    public void AddEvent_Serializes_Metadata_As_Json()
    {
        using var db = CreateDbContext();
        var service = CreateService(db);
        var subject = BusinessEventSubjects.ForRegistration(Guid.NewGuid());
        var metadata = new { reason = "duplicate", source = "admin" };

        service.AddEvent(subject, "registration.cancelled", "Cancelled", metadata: metadata);

        var entity = db.ChangeTracker.Entries<BusinessEvent>().Single().Entity;
        Assert.NotNull(entity.MetadataJson);

        var parsed = JsonDocument.Parse(entity.MetadataJson);
        Assert.Equal("duplicate", parsed.RootElement.GetProperty("reason").GetString());
        Assert.Equal("admin", parsed.RootElement.GetProperty("source").GetString());
    }

    [Fact]
    public async Task ListEventsAsync_Returns_Subject_Events_In_Descending_Created_Order()
    {
        using var db = CreateDbContext();
        var service = CreateService(db);
        var orderUuid = Guid.NewGuid();
        var organizationUuid = Guid.NewGuid();
        var otherOrganizationUuid = Guid.NewGuid();
        var otherOrderUuid = Guid.NewGuid();

        db.BusinessEvents.AddRange(
            new BusinessEvent
            {
                CreatedAt = Instant.FromUtc(2026, 4, 19, 10, 0),
                EventType = "order.created",
                Message = "Created",
                SubjectType = "order",
                SubjectUuid = orderUuid,
                OrganizationUuid = organizationUuid
            },
            new BusinessEvent
            {
                CreatedAt = Instant.FromUtc(2026, 4, 19, 11, 0),
                EventType = "order.status.changed",
                Message = "Verified",
                SubjectType = "order",
                SubjectUuid = orderUuid,
                OrganizationUuid = organizationUuid
            },
            new BusinessEvent
            {
                CreatedAt = Instant.FromUtc(2026, 4, 19, 12, 0),
                EventType = "order.invoice.created",
                Message = "Invoiced",
                SubjectType = "order",
                SubjectUuid = orderUuid,
                OrganizationUuid = organizationUuid
            },
            new BusinessEvent
            {
                CreatedAt = Instant.FromUtc(2026, 4, 19, 12, 30),
                EventType = "order.status.changed",
                Message = "Other organization",
                SubjectType = "order",
                SubjectUuid = orderUuid,
                OrganizationUuid = otherOrganizationUuid
            },
            new BusinessEvent
            {
                CreatedAt = Instant.FromUtc(2026, 4, 19, 13, 0),
                EventType = "order.created",
                Message = "Other order",
                SubjectType = "order",
                SubjectUuid = otherOrderUuid,
                OrganizationUuid = organizationUuid
            });
        await db.SaveChangesAsync();

        var result = await service.ListEventsAsync(
            organizationUuid,
            BusinessEventSubjects.ForOrder(orderUuid),
            new PagingRequest(offset: 0, limit: 2));

        Assert.Equal(3, result.TotalRecords);
        Assert.Equal(
            new[] { "order.invoice.created", "order.status.changed" },
            result.Data.Select(e => e.EventType).ToArray());
    }

    [Fact]
    public async Task ListEventsForEventAsync_Returns_Events_Across_Subjects_For_The_Event()
    {
        using var db = CreateDbContext();
        var service = CreateService(db);
        var organizationUuid = Guid.NewGuid();

        var eventInfo = new EventInfo { EventInfoId = 1, OrganizationId = 1, Title = "Mine", Slug = "mine" };
        var otherEvent = new EventInfo { EventInfoId = 2, OrganizationId = 1, Title = "Other", Slug = "other" };
        var registration = new Registration { RegistrationId = 1, EventInfoId = 1 };
        var otherRegistration = new Registration { RegistrationId = 2, EventInfoId = 2 };
        var order = new Order { OrderId = 1, RegistrationId = 1 };
        var otherOrder = new Order { OrderId = 2, RegistrationId = 2 };
        db.EventInfos.AddRange(eventInfo, otherEvent);
        db.Registrations.AddRange(registration, otherRegistration);
        db.Orders.AddRange(order, otherOrder);

        BusinessEvent Row(Instant at, string message, BusinessEventSubject subject, Guid? org = null) => new()
        {
            CreatedAt = at,
            EventType = subject.Type + ".status.changed",
            Message = message,
            SubjectType = subject.Type,
            SubjectUuid = subject.Uuid,
            OrganizationUuid = org ?? organizationUuid
        };

        db.BusinessEvents.AddRange(
            Row(Instant.FromUtc(2026, 4, 19, 10, 0), "Registration on the event", BusinessEventSubjects.ForRegistration(registration.Uuid)),
            Row(Instant.FromUtc(2026, 4, 19, 11, 0), "Order on the event", BusinessEventSubjects.ForOrder(order.Uuid)),
            Row(Instant.FromUtc(2026, 4, 19, 12, 0), "The event itself", BusinessEventSubjects.ForEvent(eventInfo.Uuid)),
            Row(Instant.FromUtc(2026, 4, 19, 13, 0), "Other event's registration", BusinessEventSubjects.ForRegistration(otherRegistration.Uuid)),
            Row(Instant.FromUtc(2026, 4, 19, 14, 0), "Other event's order", BusinessEventSubjects.ForOrder(otherOrder.Uuid)),
            Row(Instant.FromUtc(2026, 4, 19, 15, 0), "Other event itself", BusinessEventSubjects.ForEvent(otherEvent.Uuid)),
            Row(Instant.FromUtc(2026, 4, 19, 16, 0), "Same event, other org", BusinessEventSubjects.ForRegistration(registration.Uuid), Guid.NewGuid()),
            Row(Instant.FromUtc(2026, 4, 19, 17, 0), "Unrelated user", BusinessEventSubjects.ForUser(Guid.NewGuid())));
        await db.SaveChangesAsync();

        var result = await service.ListEventsForEventAsync(
            organizationUuid,
            eventInfo.Uuid,
            new PagingRequest(offset: 0, limit: 10));

        Assert.Equal(3, result.TotalRecords);
        Assert.Equal(
            new[] { "The event itself", "Order on the event", "Registration on the event" },
            result.Data.Select(e => e.Message).ToArray());
    }
}
