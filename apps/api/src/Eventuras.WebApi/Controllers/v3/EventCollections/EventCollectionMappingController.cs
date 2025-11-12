using System;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Services.EventCollections;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.v3.Events.Collections;

[ApiVersion("3")]
[Authorize(Policy = Constants.Auth.AdministratorRole)]
[Route("v{version:apiVersion}/events/{eventId}/collections/{collectionId}")]
[ApiController]
public class EventCollectionMappingController : ControllerBase
{
    private readonly IEventCollectionMappingService _collectionMappingService;

    public EventCollectionMappingController(IEventCollectionMappingService collectionMappingService) =>
        _collectionMappingService = collectionMappingService ?? throw
            new ArgumentNullException(nameof(collectionMappingService));

    [HttpPut]
    public async Task<IActionResult> Create(int eventId, int collectionId)
    {
        await _collectionMappingService.AddEventToCollectionAsync(eventId, collectionId);
        return Ok();
    }

    [HttpDelete]
    public async Task<IActionResult> Remove(int eventId, int collectionId)
    {
        await _collectionMappingService.RemoveEventFromCollectionAsync(eventId, collectionId);
        return Ok();
    }
}
