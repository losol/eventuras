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
            var statistics = new EventStatisticsDto
            {
                ByStatus = await _registrationRetrievalService.GetRegistrationStatisticsAsync(eventId, cancellationToken)
            };

            return Ok(statistics);
        }
    }
}
