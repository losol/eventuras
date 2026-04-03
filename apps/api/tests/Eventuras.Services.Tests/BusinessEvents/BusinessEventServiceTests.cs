#nullable enable

using System;
using System.Linq;
using System.Text.Json;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.BusinessEvents;
using Microsoft.EntityFrameworkCore;
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

    [Fact]
    public void AddEvent_Throws_On_Null_Subject()
    {
        using var db = CreateDbContext();
        var service = new BusinessEventService(db);

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
        var service = new BusinessEventService(db);
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
        var service = new BusinessEventService(db);
        var subject = BusinessEventSubjects.ForOrder(Guid.NewGuid());

        Assert.ThrowsAny<ArgumentException>(() =>
            service.AddEvent(subject, "order.created", message!));
    }

    [Fact]
    public void AddEvent_Adds_Entity_To_DbContext()
    {
        using var db = CreateDbContext();
        var service = new BusinessEventService(db);
        var orderUuid = Guid.NewGuid();
        var actorUuid = Guid.NewGuid();

        service.AddEvent(
            BusinessEventSubjects.ForOrder(orderUuid),
            "order.created",
            "Order was created",
            actorUserUuid: actorUuid);

        var entry = db.ChangeTracker.Entries<BusinessEvent>().Single();
        var entity = entry.Entity;

        Assert.Equal("order", entity.SubjectType);
        Assert.Equal(orderUuid, entity.SubjectUuid);
        Assert.Equal("order.created", entity.EventType);
        Assert.Equal("Order was created", entity.Message);
        Assert.Equal(actorUuid, entity.ActorUserUuid);
        Assert.Null(entity.MetadataJson);
    }

    [Fact]
    public void AddEvent_Serializes_Metadata_As_Json()
    {
        using var db = CreateDbContext();
        var service = new BusinessEventService(db);
        var subject = BusinessEventSubjects.ForRegistration(Guid.NewGuid());
        var metadata = new { reason = "duplicate", source = "admin" };

        service.AddEvent(subject, "registration.cancelled", "Cancelled", metadata: metadata);

        var entity = db.ChangeTracker.Entries<BusinessEvent>().Single().Entity;
        Assert.NotNull(entity.MetadataJson);

        var parsed = JsonDocument.Parse(entity.MetadataJson);
        Assert.Equal("duplicate", parsed.RootElement.GetProperty("reason").GetString());
        Assert.Equal("admin", parsed.RootElement.GetProperty("source").GetString());
    }
}
