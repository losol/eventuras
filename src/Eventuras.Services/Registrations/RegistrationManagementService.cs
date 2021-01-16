using Eventuras.Domain;
using Eventuras.Infrastructure;
using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Services.Events;
using Eventuras.Services.Users;

namespace Eventuras.Services.Registrations
{
    internal class RegistrationManagementService : IRegistrationManagementService
    {
        private readonly IRegistrationAccessControlService _registrationAccessControlService;
        private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
        private readonly IUserRetrievalService _userRetrievalService;
        private readonly ApplicationDbContext _context;

        public RegistrationManagementService(
            IRegistrationAccessControlService registrationAccessControlService,
            IEventInfoRetrievalService eventInfoRetrievalService,
            IUserRetrievalService userRetrievalService,
            ApplicationDbContext context)
        {
            _registrationAccessControlService = registrationAccessControlService ?? throw
                new ArgumentNullException(nameof(context));

            _eventInfoRetrievalService = eventInfoRetrievalService ?? throw
                new ArgumentNullException(nameof(eventInfoRetrievalService));

            _userRetrievalService = userRetrievalService ?? throw
                new ArgumentNullException(nameof(userRetrievalService));

            _context = context ?? throw
                new ArgumentNullException(nameof(context));
        }

        public async Task<Registration> CreateRegistrationAsync(int eventId, string userId, CancellationToken cancellationToken)
        {
            var @event = await _eventInfoRetrievalService.GetEventInfoByIdAsync(eventId, null, cancellationToken); // To check event reference only
            var user = await _userRetrievalService.GetUserByIdAsync(userId, cancellationToken);

            var registration = new Registration
            {
                EventInfoId = eventId,
                UserId = userId,
                ParticipantName = user.Name // TODO: remove this property?
            };

            await _registrationAccessControlService.CheckRegistrationCreateAccessAsync(registration, cancellationToken);

            await _context.Registrations.AddAsync(registration, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            return registration;
        }

        public async Task UpdateRegistrationAsync(
            Registration registration,
            CancellationToken cancellationToken)
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
