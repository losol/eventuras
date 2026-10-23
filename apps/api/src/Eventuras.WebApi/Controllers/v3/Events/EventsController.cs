using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.Services.Events;
using Eventuras.Services.Registrations;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Eventuras.WebApi.Controllers.v3.Events;

[ApiVersion("3")]
[Authorize(Policy = Constants.Auth.AdministratorRole)]
[Route("v{version:apiVersion}/events")]
[ApiController]
[Produces("application/json")]
public class EventsController : ControllerBase
{
    private readonly IEventInfoRetrievalService _eventInfoService;
    private readonly IEventManagementService _eventManagementService;
    private readonly IRegistrationRetrievalService _registrationRetrievalService;

    private readonly ILogger<EventsController> _logger;

    public EventsController(IEventInfoRetrievalService eventInfoService, IEventManagementService eventManagementService,
        IRegistrationRetrievalService registrationRetrievalService,
        ILogger<EventsController> logger)
    {
        _eventInfoService = eventInfoService ?? throw new ArgumentNullException(nameof(eventInfoService));
        _eventManagementService =
            eventManagementService ?? throw new ArgumentNullException(nameof(eventManagementService));
        _registrationRetrievalService =
            registrationRetrievalService ?? throw new ArgumentNullException(nameof(registrationRetrievalService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    // GET: v3/events
    /// <summary>
    ///     Retrieves a list of events based on the given query.
    /// </summary>
    /// <param name="query">Filter and pagination options.</param>
    /// <param name="cancellationToken">Cancellation token for the async operation.</param>
    /// <returns>A paginated list of events.</returns>
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<PageResponseDto<EventDto>>> List([FromQuery] EventsQueryDto query,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid query parameters.");
            return BadRequest("Invalid query parameters.");
        }

        var events = await _eventInfoService.ListEventsAsync(
            new EventListRequest(query.Offset, query.Limit)
            {
                Filter = query.ToEventInfoFilter(),
                Ordering = query.Ordering
            },
            cancellationToken: cancellationToken);

        var response = PageResponseDto<EventDto>.FromPaging(query, events, e => new EventDto(e));

        // Statistics are admin-only: the flag is ignored for anonymous/non-admin callers
        // so registration counts are never exposed on the public events list. Mirrors the
        // AdministratorRole policy, which covers both Admin and SystemAdmin.
        if (query.IncludeStatistics && Roles.All.Any(User.IsInRole))
        {
            var eventIds = response.Data.Select(e => e.Id).ToArray();
            var statistics =
                await _registrationRetrievalService.GetRegistrationStatisticsForEventsAsync(eventIds, cancellationToken);

            foreach (var dto in response.Data.Where(dto => statistics.ContainsKey(dto.Id)))
            {
                dto.Statistics = EventDto.ToStatisticsDto(statistics[dto.Id]);
            }
        }

        return response;
    }

    // GET: v3/events/5
    /// <summary>
    ///     Retrieves event details by ID.
    /// </summary>
    /// <param name="id">The ID of the event.</param>
    /// <param name="cancellationToken">Cancellation token for the async operation.</param>
    /// <returns>Event details or NotFound if the event is archived or doesn't exist.</returns>
    [AllowAnonymous]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<EventDto>> Get(int id, CancellationToken cancellationToken)
    {
        var eventInfo = await _eventInfoService.GetEventInfoByIdAsync(id, cancellationToken: cancellationToken);

        // Log a warning if the event is not found or archived.
        if (eventInfo == null)
        {
            _logger.LogWarning("Event with ID {Id} not found.", id);
            return NotFound();
        }

        return Ok(new EventDto(eventInfo));
    }

    // GET: v3/events/0190a5b2-...
    /// <summary>
    ///     Retrieves event details by UUID.
    /// </summary>
    /// <param name="uuid">The UUID of the event.</param>
    /// <param name="cancellationToken">Cancellation token for the async operation.</param>
    /// <returns>Event details or NotFound if the event doesn't exist.</returns>
    [AllowAnonymous]
    [HttpGet("{uuid:guid}")]
    [ProducesResponseType(typeof(EventDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<EventDto>> GetByUuid(Guid uuid, CancellationToken cancellationToken)
    {
        var eventInfo = await _eventInfoService.GetEventInfoByUuidAsync(uuid, cancellationToken);
        return Ok(new EventDto(eventInfo));
    }

    // POST: v3/events
    /// <summary>
    ///     Creates a new event.
    /// </summary>
    /// <param name="dto">Event information.</param>
    /// <returns>The created event.</returns>
    [HttpPost]
    public async Task<EventDto> Post([FromBody] EventFormDto dto)
    {
        var eventInfo = new EventInfo();
        dto.CopyTo(eventInfo);
        await _eventManagementService.CreateNewEventAsync(eventInfo);
        return new EventDto(eventInfo);
    }

    // PUT: v3/events/5
    /// <summary>
    ///     Updates an existing event by ID.
    /// </summary>
    /// <param name="id">The ID of the event.</param>
    /// <param name="dto">Updated event information.</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The updated event or NotFound if the event is archived.</returns>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<EventDto>> Put(
        int id,
        [FromBody] EventFormDto dto,
        CancellationToken cancellationToken = default)
    {
        if (dto.Id.HasValue && id != dto.Id.Value)
        {
            _logger.LogWarning("Event ID {Id} does not match the ID in the request body.", id);
            return BadRequest($"Event ID {id} does not match the ID in the request body.");
        }

        var eventInfo = await _eventInfoService.GetEventInfoByIdAsync(id, cancellationToken);
        return await UpdateAsync(eventInfo, dto, cancellationToken);
    }

    // PUT: v3/events/0190a5b2-...
    /// <summary>
    ///     Updates an existing event by UUID.
    /// </summary>
    /// <param name="uuid">The UUID of the event.</param>
    /// <param name="dto">Updated event information.</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The updated event or NotFound if the event is archived.</returns>
    [HttpPut("{uuid:guid}")]
    [ProducesResponseType(typeof(EventDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<EventDto>> PutByUuid(
        Guid uuid,
        [FromBody] EventFormDto dto,
        CancellationToken cancellationToken = default)
    {
        var eventInfo = await _eventInfoService.GetEventInfoByUuidAsync(uuid, cancellationToken);
        if (dto.Id.HasValue && eventInfo.EventInfoId != dto.Id.Value)
        {
            _logger.LogWarning("Event {Uuid} does not match the ID in the request body.", uuid);
            return BadRequest($"Event {uuid} does not match the ID in the request body.");
        }

        return await UpdateAsync(eventInfo, dto, cancellationToken);
    }

    // PATCH: v3/events/{id}
    /// <summary>
    ///     Partially updates a specific event by its ID.
    /// </summary>
    /// <param name="id">The ID of the event to update.</param>
    /// <param name="patchDto">The patch DTO with field updates.</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The updated event.</returns>
    [HttpPatch("{id:int}")]
    [EndpointSummary("Partially update an event")]
    [EndpointDescription("Updates specific fields of an event. For comprehensive updates with all fields, use PUT endpoint with EventFormDto instead.")]
    [ProducesResponseType(typeof(EventDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> PatchEvent(
        int id,
        [FromBody] EventPatchDto patchDto,
        CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state during PATCH operation.");
            return BadRequest(ModelState);
        }

        var entity = await _eventInfoService.GetEventInfoByIdAsync(id, cancellationToken);

        if (entity == null)
        {
            _logger.LogWarning("Event with ID {id} not found for PATCH operation.", id);
            return NotFound("Event not found.");
        }

        return await PatchAsync(entity, patchDto, cancellationToken);
    }

    // PATCH: v3/events/0190a5b2-...
    /// <summary>
    ///     Partially updates a specific event by its UUID.
    /// </summary>
    /// <param name="uuid">The UUID of the event to update.</param>
    /// <param name="patchDto">The patch DTO with field updates.</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The updated event.</returns>
    [HttpPatch("{uuid:guid}")]
    [EndpointSummary("Partially update an event by UUID")]
    [EndpointDescription("Updates specific fields of an event. For comprehensive updates with all fields, use PUT endpoint with EventFormDto instead.")]
    [ProducesResponseType(typeof(EventDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> PatchEventByUuid(
        Guid uuid,
        [FromBody] EventPatchDto patchDto,
        CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state during PATCH operation.");
            return BadRequest(ModelState);
        }

        var entity = await _eventInfoService.GetEventInfoByUuidAsync(uuid, cancellationToken);
        return await PatchAsync(entity, patchDto, cancellationToken);
    }


    // DELETE: v3/events/5
    /// <summary>
    ///     Deletes an event by ID.
    /// </summary>
    /// <param name="id">The ID of the event to delete.</param>
    [HttpDelete("{id:int}")]
    public async Task Delete(int id)
    {
        await _eventManagementService.DeleteEventAsync(id);
    }

    // DELETE: v3/events/0190a5b2-...
    /// <summary>
    ///     Deletes (archives) an event by UUID.
    /// </summary>
    /// <param name="uuid">The UUID of the event to delete.</param>
    /// <param name="cancellationToken">Cancellation token</param>
    [HttpDelete("{uuid:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteByUuid(Guid uuid, CancellationToken cancellationToken = default)
    {
        var eventInfo = await _eventInfoService.GetEventInfoByUuidAsync(uuid, cancellationToken);
        await _eventManagementService.DeleteEventAsync(eventInfo.EventInfoId);
        return Ok();
    }

    private async Task<ActionResult<EventDto>> UpdateAsync(
        EventInfo eventInfo,
        EventFormDto dto,
        CancellationToken cancellationToken)
    {
        if (eventInfo.Archived)
        {
            _logger.LogWarning("Event {Uuid} is archived and cannot be updated.", eventInfo.Uuid);
            return NotFound();
        }

        dto.CopyTo(eventInfo);
        await _eventManagementService.UpdateEventAsync(eventInfo, cancellationToken);
        return Ok(new EventDto(eventInfo));
    }

    private async Task<IActionResult> PatchAsync(
        EventInfo entity,
        EventPatchDto patchDto,
        CancellationToken cancellationToken)
    {
        patchDto.ApplyTo(entity);
        await _eventManagementService.UpdateEventAsync(entity, cancellationToken);
        return Ok(new EventDto(entity));
    }
}
