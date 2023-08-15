using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Services.Events;
using Eventuras.Services.ExternalSync;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.Web.Controllers.Api.V1;

[ApiVersion("1")]
[Authorize(Policy = AuthPolicies.AdministratorRole)]
[Route("api/v1/events/external")]
[ApiController]
public class ExternalEventsController : Controller
{
    private readonly IExternalEventManagementService _externalEventManagementService;
    private readonly IEventInfoRetrievalService _eventInfoService;

    public ExternalEventsController(IExternalEventManagementService externalEventManagementService, IEventInfoRetrievalService eventInfoService)
    {
        _externalEventManagementService = externalEventManagementService ?? throw new ArgumentNullException(nameof(externalEventManagementService));
        _eventInfoService = eventInfoService ?? throw new ArgumentNullException(nameof(eventInfoService));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> List(int id)
    {
        try { await _eventInfoService.GetEventInfoByIdAsync(id); }
        catch (InvalidOperationException) { return NotFound(); }

        var externalEvents = await _externalEventManagementService.ListExternalEventsAsync(id);
        return Json(externalEvents.Select(c => new ExternalEventDto
        {
            LocalId = c.LocalId,
            ExternalEventId = c.ExternalEventId,
            ExternalServiceName = c.ExternalServiceName,
        }));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, int localId)
    {
        if (localId <= 0) return BadRequest($"{nameof(localId)} must be greater than 0");

        try { await _eventInfoService.GetEventInfoByIdAsync(id); }
        catch (InvalidOperationException) { return NotFound(); }

        var externalEvent = await _externalEventManagementService.FindExternalEventByLocalIdAsync(localId);
        if (externalEvent == null) return Ok(); // may be already removed

        if (externalEvent.EventInfoId != id) return NotFound();

        await _externalEventManagementService.DeleteExternalEventReferenceAsync(localId);
        return Ok();
    }
}

public class ExternalEventDto
{
    public int LocalId { get; set; }

    [Required]
    public string ExternalEventId { get; set; }

    [Required]
    public string ExternalServiceName { get; set; }
}