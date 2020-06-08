using losol.EventManagement.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using losol.EventManagement.Services.Registrations;

namespace losol.EventManagement.Services.Lms
{
    internal class EventSynchronizationService : IEventSynchronizationService
    {
        private readonly ILmsProviderService _lmsProviderService;
        private readonly ILogger<EventSynchronizationService> _logger;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IRegistrationRetrievalService _registrationRetrievalService;
        private readonly IRegistrationEnrollmentService _registrationEnrollmentService;
        private readonly IEventInfoService _eventInfoService;

        public EventSynchronizationService(
            ILmsProviderService lmsProviderService,
            ILogger<EventSynchronizationService> logger,
            UserManager<ApplicationUser> userManager,
            IRegistrationRetrievalService registrationRetrievalService,
            IRegistrationEnrollmentService registrationEnrollmentService,
            IEventInfoService eventInfoService)
        {
            _lmsProviderService = lmsProviderService ?? throw new ArgumentNullException(nameof(lmsProviderService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
            _registrationRetrievalService = registrationRetrievalService ?? throw new ArgumentNullException(nameof(registrationRetrievalService));
            _registrationEnrollmentService = registrationEnrollmentService ?? throw new ArgumentNullException(nameof(registrationEnrollmentService));
            _eventInfoService = eventInfoService;
        }

        public async Task<EventSynchronizationResult> SyncEvent(int eventId, CancellationToken cancellationToken)
        {
            var eventInfo = await _eventInfoService.GetAsync(eventId);
            if (string.IsNullOrEmpty(eventInfo.LmsCourseId))
            {
                throw new InvalidOperationException($"Event {eventInfo.EventInfoId} is not assigned to LMS course");
            }

            var result = new EventSynchronizationResult();

            var reader = new PageReader<Registration>(async (offset, limit, token) =>
                await _registrationRetrievalService.ListRegistrationsAsync(
                    new IRegistrationRetrievalService.Request
                    {
                        Offset = offset,
                        Limit = limit,
                        EventInfoId = eventInfo?.EventInfoId,
                        IncludingUser = true,
                        IncludingEventInfo = true,
                        VerifiedOnly = true,
                        // we dont need checks for that users are active for now
                        //ActiveUsersOnly = true,
                        //HavingEmailConfirmedOnly = true,
                        //NotEnrolledOnly = true,
                        // TODO: more filters?
                        OrderBy = IRegistrationRetrievalService.Order.RegistrationTime
                    }, token));

            while (await reader.HasMoreAsync(cancellationToken))
            {
                foreach (var registration in await reader.ReadNextAsync(cancellationToken))
                {
                    if (registration.EnrolledInLms)
                    {
                        result.EnrolledUserIds.Add(registration.UserId);
                        result.ExistingUserIds.Add(registration.UserId);
                        continue;
                    }
                    var lmsAccountId = await CreateLmsAccountIfNotExists(registration, result);
                    if (!string.IsNullOrEmpty(lmsAccountId))
                    {
                        await EnrollUserToCourseAsync(registration, lmsAccountId, result);
                    }
                }
            }

            return result;
        }

        private async Task<string> CreateLmsAccountIfNotExists(Registration registration, EventSynchronizationResult result)
        {
            var user = registration.User;

            try
            {
                var existingLogins = await _userManager.GetLoginsAsync(user);
                var login = existingLogins.FirstOrDefault(l => l.LoginProvider == _lmsProviderService.Name);
                if (login != null)
                {
                    result.ExistingUserIds.Add(user.Id);
                    return login.ProviderKey;
                }
                else
                {
                    var lmsAccount = await _lmsProviderService.CreateAccountForUserAsync(registration);
                    await _userManager.AddLoginAsync(user, new UserLoginInfo(_lmsProviderService.Name, lmsAccount.Id, lmsAccount.Name));
                    result.CreatedUserIds.Add(user.Id);
                    // TODO: send password via email?
                    return lmsAccount.Id;
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Failed to create new LMS account for user {userId}", user.Id);
                result.Errors.Add(user.Id, e);
                return null;
            }
        }

        private async Task EnrollUserToCourseAsync(Registration registration, string lmsAccountId, EventSynchronizationResult result)
        {
            try
            {
                await _lmsProviderService.EnrollUserToCourseAsync(lmsAccountId, registration.EventInfo.LmsCourseId);
                await _registrationEnrollmentService.EnrollAsync(registration);
                result.EnrolledUserIds.Add(registration.UserId);
            }
            catch (Exception e)
            {
                result.Errors.Add(registration.UserId, e);
            }
        }
    }
}
