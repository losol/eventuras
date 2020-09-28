using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.ExternalSync;
using Eventuras.Services.Zoom.Client;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Eventuras.Services.Zoom
{
    internal class ZoomSyncProviderService : AbstractExternalAccountPerRegistrationSyncProviderService
    {
        public override string Name => "Zoom";

        private readonly IZoomApiClient _zoomApiClient;

        public ZoomSyncProviderService(ApplicationDbContext context, IZoomApiClient zoomApiClient) : base(context)
        {
            _zoomApiClient = zoomApiClient ?? throw new ArgumentNullException(nameof(zoomApiClient));
        }

        protected override async Task<ExternalEvent> EnsureExternalEventAsync(EventInfo eventInfo)
        {
            var externalEvent = await base.EnsureExternalEventAsync(eventInfo);
            if (!externalEvent.TryGetZoomMeetingId(out _))
            {
                throw new InvalidZoomMeetingIdException(externalEvent.ExternalEventId);
            }
            return externalEvent;
        }

        protected override async Task<ExternalAccount> CreateNewExternalAccountForRegistrationAsync(Registration registration)
        {
            var externalEvent = await EnsureExternalEventAsync(registration.EventInfo);
            var meetingId = externalEvent.GetZoomMeetingId();

            try
            {
                var normalizedUserEmail = registration.User.Email.Trim().ToLower();

                // First check if the email is already registered in Zoom meeting
                var registrants = await _zoomApiClient.ListMeetingRegistrantsAsync(meetingId);
                var registrantId = registrants.FirstOrDefault(r => string.Equals(
                        r.Email.Trim().ToLower(),
                        normalizedUserEmail))?
                    .RegistrantId;

                if (registrantId == null)
                {
                    registrantId = (await _zoomApiClient.CreateMeetingRegistrantsAsync(meetingId,
                        new CreateMeetingRegistrantRequestDto
                        {
                            Email = registration.User.Email,
                            FirstName = registration.ParticipantFirstName,
                            LastName = registration.ParticipantLastName
                        }))?.RegistrantId;
                }

                return new ExternalAccount
                {
                    UserId = registration.UserId,
                    RegistrationId = registration.RegistrationId,
                    ExternalServiceName = Name,
                    ExternalAccountId = registrantId,
                    DisplayName = registration.ParticipantName
                };
            }
            catch (ZoomClientException e)
            {
                throw new ExternalSyncException($"Failed to create registrant {registration.CustomerEmail} for meeting {meetingId}", e);
            }
        }
    }
}
