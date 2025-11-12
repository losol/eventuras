using System;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Domain;
using Eventuras.Services.EventCollections;
using Eventuras.WebApi.Controllers.v3.EventCollections;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Eventuras.WebApi.Controllers.v3.Events.Collections;

[ApiVersion("3")]
[Authorize(Policy = Constants.Auth.AdministratorRole)]
[Route("v{version:apiVersion}/eventcollections")]
[ApiController]
public class EventCollectionController : ControllerBase
{
    private readonly IEventCollectionManagementService _eventCollectionManagementService;
    private readonly IEventCollectionRetrievalService _eventCollectionRetrievalService;
    private readonly ILogger<EventCollectionController> _logger;

    public EventCollectionController(
        IEventCollectionManagementService eventCollectionManagementService,
        IEventCollectionRetrievalService eventCollectionRetrievalService,
        ILogger<EventCollectionController> logger)
    {
        _eventCollectionManagementService = eventCollectionManagementService ?? throw
            new ArgumentNullException(nameof(eventCollectionManagementService));

        _eventCollectionRetrievalService = eventCollectionRetrievalService ?? throw
            new ArgumentNullException(nameof(eventCollectionRetrievalService));

        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PageResponseDto<EventCollectionDto>>> List(
        [FromQuery] EventCollectionsQueryDto query, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid query parameters.");
            return BadRequest("Invalid query parameters.");
        }

        var collections = await _eventCollectionRetrievalService
            .ListCollectionsAsync(cancellationToken: cancellationToken);

        return PageResponseDto<EventCollectionDto>.FromPaging(query, collections, c => new EventCollectionDto(c));
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<EventCollectionDto>> Get(int id, CancellationToken cancellationToken)
    {
        var c = await _eventCollectionRetrievalService
            .GetCollectionByIdAsync(id, cancellationToken: cancellationToken);

        return Ok(new EventCollectionDto(c));
    }

    [HttpPost]
    public async Task<ActionResult<EventCollectionDto>> Create([FromBody] EventCollectionCreateDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState.FormatErrors());
        }

        var collection = new EventCollection();
        dto.CopyTo(collection);
        await _eventCollectionManagementService.CreateCollectionAsync(collection);
        return Ok(new EventCollectionDto(collection));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<EventCollectionDto>> Update(int id, [FromBody] EventCollectionDto dto)
    {
        var collection = await _eventCollectionRetrievalService
            .GetCollectionByIdAsync(id, new EventCollectionRetrievalOptions { ForUpdate = true });

        dto.CopyTo(collection);

        await _eventCollectionManagementService.UpdateCollectionAsync(collection);

        return Ok(new EventCollectionDto(collection));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Archive(int id)
    {
        var collection = await _eventCollectionRetrievalService
            .GetCollectionByIdAsync(id, new EventCollectionRetrievalOptions { ForUpdate = true });

        await _eventCollectionManagementService.ArchiveCollectionAsync(collection);
        return Ok();
    }
}
