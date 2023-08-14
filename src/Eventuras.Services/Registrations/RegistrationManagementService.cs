#nullable enable

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Events;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Orders;
using Eventuras.Services.Users;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Registrations
{
    internal class RegistrationManagementService : IRegistrationManagementService
    {
        private readonly IRegistrationAccessControlService _registrationAccessControlService;
        private readonly IOrderManagementService _orderManagementService;
        private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
        private readonly IUserRetrievalService _userRetrievalService;
        private readonly ApplicationDbContext _context;

        public RegistrationManagementService(
            IRegistrationAccessControlService registrationAccessControlService,
            IOrderManagementService orderManagementService,
            IEventInfoRetrievalService eventInfoRetrievalService,
            IUserRetrievalService userRetrievalService,
            ApplicationDbContext context)
        {
            _registrationAccessControlService = registrationAccessControlService;
            _eventInfoRetrievalService = eventInfoRetrievalService;
            _userRetrievalService = userRetrievalService;
            _context = context;
            _orderManagementService = orderManagementService;
        }

        public async Task<Registration> CreateRegistrationAsync(
            int eventId,
            string userId,
            RegistrationOptions? options = null,
            CancellationToken cancellationToken = default)
        {
            var existingRegistration = await _context.Registrations
                .FirstOrDefaultAsync(m => m.EventInfoId == eventId
                                       && m.UserId == userId,
                    cancellationToken);

            if (existingRegistration != null)
            {
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

            var user = await _userRetrievalService.GetUserByIdAsync(userId, null, cancellationToken);

            var registration = new Registration
            {
                EventInfoId = eventId,
                UserId = userId,
                ParticipantName = user.Name // TODO: remove this property?
            };

            await _registrationAccessControlService.CheckRegistrationCreateAccessAsync(registration, cancellationToken);

            if (eventInfo.Status == EventInfo.EventInfoStatus.WaitingList)
            {
                registration.Status = Registration.RegistrationStatus.WaitingList;
            }

            await _context.CreateAsync(registration, true, cancellationToken);

            options ??= new RegistrationOptions();

            if (options.CreateOrder && registration.Status != Registration.RegistrationStatus.WaitingList)
            {
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
                eventInfo.Status = EventInfo.EventInfoStatus.WaitingList;
                await _context.SaveChangesAsync(cancellationToken);
            }

            return registration;
        }

        public async Task UpdateRegistrationAsync(
            Registration registration,
            CancellationToken cancellationToken = default)
        {
            if (registration == null)
            {
                throw new ArgumentNullException(nameof(registration));
            }

            await _registrationAccessControlService.CheckRegistrationUpdateAccessAsync(registration, cancellationToken);

            await _context.UpdateAsync(registration, cancellationToken);
        }
    }
}