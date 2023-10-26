#nullable enable

using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Events;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Orders;
using Eventuras.Services.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Registrations
{
    internal class RegistrationManagementService : IRegistrationManagementService
    {
        private readonly IRegistrationAccessControlService _registrationAccessControlService;
        private readonly IOrderManagementService _orderManagementService;
        private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
        private readonly IUserRetrievalService _userRetrievalService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<RegistrationManagementService> _logger;

        public RegistrationManagementService(
            IRegistrationAccessControlService registrationAccessControlService,
            IOrderManagementService orderManagementService,
            IEventInfoRetrievalService eventInfoRetrievalService,
            IUserRetrievalService userRetrievalService,
            ILogger<RegistrationManagementService> logger,
            ApplicationDbContext context)
        {
            _registrationAccessControlService = registrationAccessControlService;
            _eventInfoRetrievalService = eventInfoRetrievalService;
            _userRetrievalService = userRetrievalService;
            _context = context;
            _orderManagementService = orderManagementService;
            _logger = logger;
        }

        public async Task<Registration> CreateRegistrationAsync(
            int eventId,
            string userId,
            RegistrationOptions? options = null,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("RegistrationManagementService: Attempting to create registration for EventId: {EventId}, UserId: {UserId}", eventId, userId);

            var existingRegistration = await _context.Registrations
                .FirstOrDefaultAsync(m => m.EventInfoId == eventId
                                       && m.UserId == userId,
                    cancellationToken);

            if (existingRegistration != null)
            {
                _logger.LogWarning("Found existing registration for user on event: EventId {EventId}, UserId {UserId}.", eventId, userId);
                throw new DuplicateException("Found existing registration for user on event.");
            }

            var eventInfo = await _eventInfoRetrievalService.GetEventInfoByIdAsync(eventId,
                new EventInfoRetrievalOptions
                {
                    ForUpdate = true,
                    LoadRegistrations = true,
                    LoadProducts = true
                },
                cancellationToken);
            _logger.LogInformation($"Retrieved event info for EventInfoId {eventInfo.EventInfoId}, Status {eventInfo.Status}");

            var user = await _userRetrievalService.GetUserByIdAsync(userId, null, cancellationToken);

            var registration = new Registration
            {
                EventInfoId = eventId,
                UserId = userId,
                ParticipantName = user.Name // TODO: remove this property?
            };

            _logger.LogInformation($"Checking create access for registration: UserId {registration.UserId}, EventInfoId {registration.EventInfoId}");
            await _registrationAccessControlService.CheckRegistrationCreateAccessAsync(registration, cancellationToken);

            if (eventInfo.Status == EventInfo.EventInfoStatus.WaitingList)
            {
                registration.Status = Registration.RegistrationStatus.WaitingList;
            }

            await _context.CreateAsync(registration, true, cancellationToken);
            _logger.LogInformation($"Successfully created registration for EventId: {eventId}, UserId: {userId}");

            options ??= new RegistrationOptions();

            if (options.CreateOrder && registration.Status != Registration.RegistrationStatus.WaitingList)
            {
                _logger.LogInformation("Creating order for registration: RegistrationId {RegistrationId}, EventInfoId {EventInfoId}", registration.RegistrationId, registration.EventInfoId);

                var mandatoryItems = eventInfo.Products
                    .Where(p => p.IsMandatory)
                    .Select(p => new OrderLineModel(p.ProductId, null, p.MinimumQuantity))
                    .ToArray();

                if (mandatoryItems.Any())
                {
                    await _orderManagementService
                        .CreateOrderForRegistrationAsync(
                            registration.RegistrationId,
                            mandatoryItems,
                            cancellationToken);
                }
            }

            if (eventInfo.MaxParticipants > 0
             && eventInfo.Registrations.Count + 1 >= eventInfo.MaxParticipants)
            {
                _logger.LogInformation("Event {EventId} has reached max participants, changing status to WaitingList", eventId);
                eventInfo.Status = EventInfo.EventInfoStatus.WaitingList;
                await _context.SaveChangesAsync(cancellationToken);
            }

            _logger.LogInformation("Successfully created registration for EventId: {EventId}, UserId: {UserId}", eventId, userId);
            return registration;
        }

        public async Task UpdateRegistrationAsync(
            Registration registration,
            CancellationToken cancellationToken = default)
        {
            if (registration == null)
            {
                _logger.LogError("Did not find registration for update");
                throw new ArgumentNullException(nameof(registration));
            }

            await _registrationAccessControlService.CheckRegistrationUpdateAccessAsync(registration, cancellationToken);

            await _context.UpdateAsync(registration, cancellationToken);
        }
    }
}