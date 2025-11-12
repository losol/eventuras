using System;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Services;
using Eventuras.Services.Registrations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Swashbuckle.AspNetCore.Annotations;

namespace Eventuras.WebApi.Controllers.v3.Events.Statistics;

[ApiVersion("3")]
[Authorize(Roles = Roles.Admin)]
[Route("v{version:apiVersion}/events/{eventId}/")]
[ApiController]
public class EventStatisticsController : ControllerBase
{
    private readonly ILogger<EventStatisticsController> _logger;
    private readonly IRegistrationRetrievalService _registrationRetrievalService;

    public EventStatisticsController(
        IRegistrationRetrievalService registrationRetrievalService,
        ILogger<EventStatisticsController> logger)
    {
        _registrationRetrievalService = registrationRetrievalService ?? throw
            new ArgumentNullException(nameof(registrationRetrievalService));

        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpGet("statistics")]
    [ProducesResponseType(typeof(EventStatisticsDto), 200)]
    [SwaggerOperation(
        Summary = "Event statistics",
        Description = "Returns a summary of the registrations for the event."
    )]
    public async Task<ActionResult<EventStatisticsDto>> GetEventStatistics(int eventId,
        CancellationToken cancellationToken)
    {
        var registrationStatistics =
            await _registrationRetrievalService.GetRegistrationStatisticsAsync(eventId, cancellationToken);
        return Ok(registrationStatistics);
    }
}
