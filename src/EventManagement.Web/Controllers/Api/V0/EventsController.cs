using losol.EventManagement.Services;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Web.Api.Controllers
{
    [ApiVersion("0")]
    [Route("api/v0/events")]
    public class EventsController : Controller
    {
        private readonly IEventInfoService _eventsService;

        public EventsController(IEventInfoService eventsService)
        {
            _eventsService = eventsService;
        }

        [HttpGet, Route("upcoming")]
        public async Task<IActionResult> Get()
        {
            var events = await _eventsService.GetEventsAsync();
            var list = events.Select(s => new
            {
                Id = s.EventInfoId,
                s.Title,
                s.Description,
                s.Location,
                s.City,
                s.DateStart,
                s.DateEnd,
                s.FeaturedImageUrl
            });
            return Ok(list);
        }

    }
}