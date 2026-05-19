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
        var service = BuildService(eventInfo, callerUserId: adminUserId);

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

    private RegistrationManagementService BuildService(EventInfo eventInfo, Guid? callerUserId = null)
    {
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

        var httpContextAccessor = new HttpContextAccessor { HttpContext = new DefaultHttpContext() };

        return new RegistrationManagementService(
            Mock.Of<IRegistrationAccessControlService>(),
            Mock.Of<IRegistrationRetrievalService>(),
            Mock.Of<IOrderManagementService>(),
            eventInfoRetrieval,
            Mock.Of<INotificationDeliveryService>(),
            Mock.Of<INotificationManagementService>(),
            userRetrieval.Object,
            Mock.Of<IBusinessEventService>(),
            httpContextAccessor,
            NullLogger<RegistrationManagementService>.Instance,
            _context);
    }
}
