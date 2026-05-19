#nullable enable

using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.BusinessEvents;
using Eventuras.Services.Events;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace Eventuras.Services.Tests.Events;

public class EventManagementServiceTests : IDisposable
{
    private readonly ApplicationDbContext _context;

    public EventManagementServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
        GC.SuppressFinalize(this);
    }

    [Fact]
    public async Task UpdateEventAsync_EmitsStatusChangedEvent_WhenStatusChanges()
    {
        var (info, actorUserId, businessEvents, service) = SetupEvent(
            initialStatus: EventInfo.EventInfoStatus.Draft);

        // Mutate status and update — service should detect the delta and emit.
        info.Status = EventInfo.EventInfoStatus.RegistrationsOpen;
        await service.UpdateEventAsync(info);

        businessEvents.Verify(s => s.AddEvent(
            It.Is<BusinessEventSubject>(sub => sub.Type == "event" && sub.Uuid == info.Uuid),
            "event.status.changed",
            It.Is<string>(m =>
                m.Contains("Draft") && m.Contains("RegistrationsOpen")),
            It.IsAny<Guid?>(),
            actorUserId,
            It.IsAny<object?>()),
            Times.Once);
    }

    [Fact]
    public async Task UpdateEventAsync_DoesNotEmit_WhenStatusUnchanged()
    {
        var (info, _, businessEvents, service) = SetupEvent(
            initialStatus: EventInfo.EventInfoStatus.RegistrationsOpen);

        // Same status — only the title changes.
        info.Title = "Renamed";
        await service.UpdateEventAsync(info);

        businessEvents.Verify(s => s.AddEvent(
            It.IsAny<BusinessEventSubject>(),
            "event.status.changed",
            It.IsAny<string>(),
            It.IsAny<Guid?>(),
            It.IsAny<Guid?>(),
            It.IsAny<object?>()),
            Times.Never);
    }

    private (EventInfo info, Guid actorUserId, Mock<IBusinessEventService> businessEvents, EventManagementService service)
        SetupEvent(EventInfo.EventInfoStatus initialStatus)
    {
        var org = new Organization { OrganizationId = 1, Name = "Test Org" };
        _context.Organizations.Add(org);

        var info = new EventInfo
        {
            EventInfoId = 42,
            Title = "Test Event",
            Slug = "test-event-" + Guid.NewGuid(),
            Status = initialStatus,
            OrganizationId = org.OrganizationId,
        };
        _context.EventInfos.Add(info);
        _context.SaveChanges();

        var actorUserId = Guid.NewGuid();
        var httpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, actorUserId.ToString()),
            }, "Eventuras.Database")),
        };
        var httpContextAccessor = new HttpContextAccessor { HttpContext = httpContext };

        var products = new Mock<IProductsService>();
        var businessEvents = new Mock<IBusinessEventService>();

        var service = new EventManagementService(
            _context,
            products.Object,
            businessEvents.Object,
            httpContextAccessor,
            NullLogger<EventManagementService>.Instance);

        return (info, actorUserId, businessEvents, service);
    }
}
