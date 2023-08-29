using System;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Domain;
using Eventuras.Services.Events;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.Events
{
    [ApiVersion("3")]
    [Authorize(Policy = Constants.Auth.AdministratorRole)]
    [Route("v{version:apiVersion}/events")]
    [ApiController]
    [Produces("application/json")]
    public class EventsController : ControllerBase
    {
        private readonly IEventInfoRetrievalService _eventInfoService;
        private readonly IEventManagementService _eventManagementService;

        public EventsController(IEventInfoRetrievalService eventInfoService, IEventManagementService eventManagementService)
        {
            _eventInfoService = eventInfoService ?? throw new ArgumentNullException(nameof(eventInfoService));

            _eventManagementService = eventManagementService ?? throw new ArgumentNullException(nameof(eventManagementService));
        }

        // GET: v3/events
        /// <summary>
        /// Gets a list of events.
        /// </summary>
        /// <param name="query"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        /// <response code="200">Returns a list of events.</response>
        /// <response code="400">If the query is invalid.</response>
        [AllowAnonymous]
        [HttpGet]
        public async Task<PageResponseDto<EventDto>> List([FromQuery] EventsQueryDto query, CancellationToken cancellationToken)
        {
            var events = await _eventInfoService.ListEventsAsync(new EventListRequest(query.Offset, query.Limit)
                {
                    Filter = query.ToEventInfoFilter()
                },
                cancellationToken: cancellationToken);

            return PageResponseDto<EventDto>.FromPaging(query, events, e => new EventDto(e));
        }

        // GET: v3/events/5
        [AllowAnonymous]
        [HttpGet("{id:int}")]
        public async Task<ActionResult<EventDto>> Get(int id, CancellationToken cancellationToken)
        {
            var eventInfo = await _eventInfoService.GetEventInfoByIdAsync(id, cancellationToken: cancellationToken);
            if (eventInfo == null || eventInfo.Archived) { return NotFound(); }

            return Ok(new EventDto(eventInfo));
        }

        // POST: v3/events
        [HttpPost]
        public async Task<EventDto> Post([FromBody] EventFormDto dto)
        {
            var eventInfo = new EventInfo();
            dto.CopyTo(eventInfo);
            await _eventManagementService.CreateNewEventAsync(eventInfo);
            return new EventDto(eventInfo);
        }

        // PUT: v3/events/5
        [HttpPut("{id:int}")]
        public async Task<ActionResult<EventDto>> Put(int id, [FromBody] EventFormDto dto)
        {
            var eventInfo = await _eventInfoService.GetEventInfoByIdAsync(id);
            if (eventInfo.Archived) { return NotFound(); }

            dto.CopyTo(eventInfo);
            await _eventManagementService.UpdateEventAsync(eventInfo);
            return Ok(new EventDto(eventInfo));
        }

        // PATCH: v3/events/5
        [HttpPatch("{id:int}")]
        public async Task<IActionResult> JsonPatchWithModelState(int id, [FromBody] JsonPatchDocument<EventFormDto> patchDoc)
        {
            var entity = await _eventInfoService.GetEventInfoByIdAsync(id);
            var updateModel = EventFormDto.FromEntity(entity);

            patchDoc.ApplyTo(updateModel, ModelState);

            if (!ModelState.IsValid) return ValidationProblem();

            updateModel.CopyTo(entity);
            await _eventManagementService.UpdateEventAsync(entity);

            return Ok(new EventDto(entity));
        }

        // DELETE: v3/events/5
        [HttpDelete("{id:int}")]
        public async Task Delete(int id)
        {
            await _eventManagementService.DeleteEventAsync(id);
        }
    }
}