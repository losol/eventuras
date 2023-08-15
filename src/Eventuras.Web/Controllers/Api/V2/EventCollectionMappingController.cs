using System;
using System.Threading.Tasks;
using Eventuras.Services.EventCollections;
using Eventuras.Services.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.Web.Controllers.Api.V2;

[ApiVersion("2")]
[Authorize(Policy = AuthPolicies.AdministratorRole)]
[Route("api/v{version:apiVersion}/events/{id}/collections/{collectionId}")]
[ApiController]
public class EventCollectionMappingController : ControllerBase
{
    private readonly IEventCollectionMappingService _collectionMappingService;

    public EventCollectionMappingController(IEventCollectionMappingService collectionMappingService)
    {
        _collectionMappingService = collectionMappingService ?? throw new ArgumentNullException(nameof(collectionMappingService));
    }

    [HttpPut]
    public async Task<IActionResult> Create(int id, int collectionId)
    {
        try
        {
            await _collectionMappingService.AddEventToCollectionAsync(id, collectionId);
            return Ok();
        }
        catch (NotFoundException e) { return NotFound(e.Message); }
        catch (NotAccessibleException e)
        {
            return NotFound(e.Message); // FIXME: 403 Forbidden redirects to Login page
        }
    }

    [HttpDelete]
    public async Task<IActionResult> Remove(int id, int collectionId)
    {
        try
        {
            await _collectionMappingService.RemoveEventFromCollectionAsync(id, collectionId);
            return Ok();
        }
        catch (NotFoundException e) { return NotFound(e.Message); }
        catch (NotAccessibleException e)
        {
            return NotFound(e.Message); // FIXME: 403 Forbidden redirects to Login page
        }
    }
}