using Asp.Versioning;
using Eventuras.Domain;
using Eventuras.Services.Auth;
using Eventuras.Services.Registrations;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.WebApi.Controllers.v3.Events.Statistics
{
    [ApiVersion("3")]
    [Authorize]
    [Route("v{version:apiVersion}/events/{eventId}/")]
    [ApiController]
    public class EventStatisticsController : ControllerBase
    {
        private readonly IRegistrationRetrievalService _registrationRetrievalService;

        private readonly ILogger<EventStatisticsController> _logger;

        public EventStatisticsController(
            IRegistrationRetrievalService registrationRetrievalService,
            ILogger<EventStatisticsController> logger)
        {
            _registrationRetrievalService = registrationRetrievalService ?? throw
                new ArgumentNullException(nameof(registrationRetrievalService));

            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet("statistics")]
        public async Task<ActionResult<EventStatisticsDto>> GetEventStatistics(int eventId, CancellationToken cancellationToken)
        {
            var registrationStatistics = await _registrationRetrievalService.GetRegistrationStatisticsAsync(eventId, cancellationToken);

            var byStatus = new ByStatus
            {
                Draft = registrationStatistics.StatusCounts.TryGetValue(Registration.RegistrationStatus.Draft, out var draftCount) ? draftCount : 0,
                Cancelled = registrationStatistics.StatusCounts.TryGetValue(Registration.RegistrationStatus.Cancelled, out var cancelledCount) ? cancelledCount : 0,
                Verified = registrationStatistics.StatusCounts.TryGetValue(Registration.RegistrationStatus.Verified, out var verifiedCount) ? verifiedCount : 0,
                NotAttended = registrationStatistics.StatusCounts.TryGetValue(Registration.RegistrationStatus.NotAttended, out var notAttendedCount) ? notAttendedCount : 0,
                Attended = registrationStatistics.StatusCounts.TryGetValue(Registration.RegistrationStatus.Attended, out var attendedCount) ? attendedCount : 0,
                Finished = registrationStatistics.StatusCounts.TryGetValue(Registration.RegistrationStatus.Finished, out var finishedCount) ? finishedCount : 0,
                WaitingList = registrationStatistics.StatusCounts.TryGetValue(Registration.RegistrationStatus.WaitingList, out var waitingListCount) ? waitingListCount : 0
            };

            var byType = new ByType
            {
                Participant = registrationStatistics.TypeCounts.TryGetValue(Registration.RegistrationType.Participant, out var participantCount) ? participantCount : 0,
                Student = registrationStatistics.TypeCounts.TryGetValue(Registration.RegistrationType.Student, out var studentCount) ? studentCount : 0,
                Staff = registrationStatistics.TypeCounts.TryGetValue(Registration.RegistrationType.Staff, out var staffCount) ? staffCount : 0,
                Lecturer = registrationStatistics.TypeCounts.TryGetValue(Registration.RegistrationType.Lecturer, out var lecturerCount) ? lecturerCount : 0,
                Artist = registrationStatistics.TypeCounts.TryGetValue(Registration.RegistrationType.Artist, out var artistCount) ? artistCount : 0
            };

            var statistics = new EventStatisticsDto
            {
                ByStatus = byStatus,
                ByType = byType
            };

            return Ok(statistics);
        }

    }
}
