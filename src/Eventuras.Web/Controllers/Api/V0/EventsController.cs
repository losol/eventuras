using System.Linq;
using System.Threading.Tasks;
using Eventuras.Services.Events;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.Web.Api.Controllers;

[ApiVersion("0")]
[Route("api/v0/events")]
public class EventsController : Controller
{
    private readonly IEventInfoRetrievalService _eventsService;

    public EventsController(IEventInfoRetrievalService eventsService)
    {
        _eventsService = eventsService;
    }

    [HttpGet]
    [Route("upcoming")]
    public async Task<IActionResult> Get()
    {
        var events = await _eventsService.GetUpcomingEventsAsync();
        var list = events.Select(s => new
        {
            Id = s.EventInfoId,
            s.Title,
            s.Description,
            s.Location,
            s.City,
            s.DateStart,
            s.DateEnd,
            s.FeaturedImageUrl,
        });
        return Ok(list);
    }
}