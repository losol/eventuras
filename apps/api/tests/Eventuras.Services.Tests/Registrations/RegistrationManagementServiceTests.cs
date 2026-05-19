#nullable enable

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.BusinessEvents;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Notifications;
using Eventuras.Services.Orders;
using Eventuras.Services.Registrations;
using Eventuras.Services.Users;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace Eventuras.Services.Tests.Registrations;

public class RegistrationManagementServiceTests : IDisposable
{
    private readonly ApplicationDbContext _context;

    public RegistrationManagementServiceTests()
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
    public async Task CreateRegistrationAsync_ThrowsInvalidOperation_WhenEventAtCapacity_AndEnforceCapacityTrue()
    {
        var eventInfo = MakeFullEvent(maxParticipants: 2, verifiedRegistrations: 2);
        var service = BuildService(eventInfo);
        var userId = Guid.NewGuid();

        var ex = await Assert.ThrowsAsync<InvalidOperationServiceException>(() =>
            service.CreateRegistrationAsync(
                eventInfo.EventInfoId,
                userId,
                new RegistrationOptions { EnforceCapacity = true, SendWelcomeLetter = false }));

        Assert.Contains("maximum participant capacity", ex.Message);
    }

    [Fact]
    public async Task CreateRegistrationAsync_BypassesCapacityGate_AndFlipsEventToClosed_WhenEnforceCapacityFalse()
    {
        // Admin path: event is already at max, EnforceCapacity=false lets the
        // overbook through. The post-save flip should still fire and move
        // the event into RegistrationsClosed.
        var eventInfo = MakeFullEvent(maxParticipants: 2, verifiedRegistrations: 2);
        var adminUserId = Guid.NewGuid();
        var businessEvents = new Mock<IBusinessEventService>();
        var service = BuildService(eventInfo, businessEvents: businessEvents);

        var registration = await service.CreateRegistrationAsync(
            eventInfo.EventInfoId,
            adminUserId,
            new RegistrationOptions
            {
                EnforceCapacity = false,
                Verified = true,
                SendWelcomeLetter = false,
            });

        Assert.NotNull(registration);
        Assert.Equal(Registration.RegistrationStatus.Verified, registration.Status);
        Assert.Equal(EventInfo.EventInfoStatus.RegistrationsClosed, eventInfo.Status);
    }

    [Fact]
    public async Task CreateRegistrationAsync_EmitsBusinessEvent_WhenEventAutoCloses()
    {
        // When the filling registration triggers the auto-close flip, the
        // service should record an `event.status.changed` business event with
        // the event's UUID as subject — same shape as manual status changes.
        var eventInfo = MakeFullEvent(maxParticipants: 1, verifiedRegistrations: 0);
        var actorUserId = Guid.NewGuid();
        var businessEvents = new Mock<IBusinessEventService>();
        var service = BuildService(eventInfo, callerUserId: actorUserId, businessEvents: businessEvents);

        await service.CreateRegistrationAsync(
            eventInfo.EventInfoId,
            actorUserId,
            new RegistrationOptions { Verified = true, SendWelcomeLetter = false });

        Assert.Equal(EventInfo.EventInfoStatus.RegistrationsClosed, eventInfo.Status);
        businessEvents.Verify(s => s.AddEvent(
            It.Is<BusinessEventSubject>(sub => sub.Type == "event" && sub.Uuid == eventInfo.Uuid),
            "event.status.changed",
            It.Is<string>(m => m.Contains("auto") && m.Contains("MaxParticipants")),
            It.IsAny<Guid?>(),
            actorUserId,
            It.IsAny<object?>()),
            Times.Once);
    }

    [Fact]
    public async Task CreateRegistrationAsync_DoesNotEmitBusinessEvent_WhenStatusDoesNotChange()
    {
        // Event already at capacity but already in RegistrationsClosed status —
        // an admin override that lands here shouldn't re-emit a "changed" event
        // because nothing changed.
        var eventInfo = MakeFullEvent(maxParticipants: 1, verifiedRegistrations: 1);
        eventInfo.Status = EventInfo.EventInfoStatus.RegistrationsClosed;
        var businessEvents = new Mock<IBusinessEventService>();
        var service = BuildService(eventInfo, businessEvents: businessEvents);

        await service.CreateRegistrationAsync(
            eventInfo.EventInfoId,
            Guid.NewGuid(),
            new RegistrationOptions
            {
                EnforceCapacity = false,
                Verified = true,
                SendWelcomeLetter = false,
            });

        businessEvents.Verify(s => s.AddEvent(
            It.IsAny<BusinessEventSubject>(),
            "event.status.changed",
            It.IsAny<string>(),
            It.IsAny<Guid?>(),
            It.IsAny<Guid?>(),
            It.IsAny<object?>()),
            Times.Never);
    }

    private static EventInfo MakeFullEvent(int maxParticipants, int verifiedRegistrations)
    {
        var eventInfo = new EventInfo
        {
            EventInfoId = 42,
            Title = "Test Event",
            Status = EventInfo.EventInfoStatus.RegistrationsOpen,
            MaxParticipants = maxParticipants,
            Registrations = Enumerable.Range(0, verifiedRegistrations)
                .Select(_ => new Registration
                {
                    EventInfoId = 42,
                    UserId = Guid.NewGuid(),
                    Status = Registration.RegistrationStatus.Verified,
                })
                .ToList(),
            Products = new System.Collections.Generic.List<Product>(),
        };
        return eventInfo;
    }

    private RegistrationManagementService BuildService(
        EventInfo eventInfo,
        Guid? callerUserId = null,
        Mock<IBusinessEventService>? businessEvents = null)
    {
        // Seed the organisation first so eventInfo.OrganizationId is stable
        // before any downstream consumer (the retrieval mock, the service)
        // observes it.
        SeedOrganizationFor(eventInfo);

        var eventInfoRetrieval = ServiceMocks.MockEventInfoRetrievalService(out _, eventInfo);

        var userRetrieval = new Mock<IUserRetrievalService>();
        userRetrieval
            .Setup(u => u.GetUserByIdAsync(It.IsAny<Guid>(), It.IsAny<UserRetrievalOptions?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Guid id, UserRetrievalOptions? _, CancellationToken _) => new ApplicationUser
            {
                Id = id,
                Email = "leo@losen.com",
                GivenName = "Leo",
                FamilyName = "Losen",
            });

        var httpContext = new DefaultHttpContext();
        if (callerUserId is { } id)
        {
            // GetUserId() looks for an identity with this auth type — match
            // the production claim shape so the actor UUID propagates.
            httpContext.User = new System.Security.Claims.ClaimsPrincipal(
                new System.Security.Claims.ClaimsIdentity(new[]
                {
                    new System.Security.Claims.Claim(
                        System.Security.Claims.ClaimTypes.NameIdentifier, id.ToString()),
                }, "Eventuras.Database"));
        }

        var httpContextAccessor = new HttpContextAccessor { HttpContext = httpContext };

        return new RegistrationManagementService(
            Mock.Of<IRegistrationAccessControlService>(),
            Mock.Of<IRegistrationRetrievalService>(),
            Mock.Of<IOrderManagementService>(),
            eventInfoRetrieval,
            Mock.Of<INotificationDeliveryService>(),
            Mock.Of<INotificationManagementService>(),
            userRetrieval.Object,
            businessEvents?.Object ?? Mock.Of<IBusinessEventService>(),
            httpContextAccessor,
            NullLogger<RegistrationManagementService>.Instance,
            _context);
    }

    // Persist an Organization so the auto-close emission's DbContext lookup
    // for the tenant UUID resolves to something. Done before any mock or
    // service observes the eventInfo to keep BuildService's responsibilities
    // visible.
    private void SeedOrganizationFor(EventInfo eventInfo)
    {
        if (_context.Organizations.Any(o => o.OrganizationId == eventInfo.OrganizationId))
        {
            return;
        }

        var organization = new Organization
        {
            OrganizationId = eventInfo.OrganizationId == 0 ? 1 : eventInfo.OrganizationId,
            Name = "Test Org",
        };
        _context.Organizations.Add(organization);
        _context.SaveChanges();
        eventInfo.OrganizationId = organization.OrganizationId;
    }
}
