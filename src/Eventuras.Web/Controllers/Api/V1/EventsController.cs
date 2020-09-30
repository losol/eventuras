using Eventuras.Services;
using Eventuras.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Services.Events;

namespace Eventuras.Web.Controllers.Api.V1
{
    [ApiVersion("1")]
    [Authorize(Policy = AuthPolicies.AdministratorRole)]
    [Route("api/v1/events")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly IEventInfoRetrievalService _eventInfoService;

        public EventsController(IEventInfoRetrievalService eventInfoService)
        {
            _eventInfoService = eventInfoService;
        }

        // GET: api/v1/events
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventInfoViewModel>>> GetRegistrations()
        {
            var eventinfos = await _eventInfoService.GetUpcomingEventsAsync();
            var vmlist = eventinfos.Select(m => new EventInfoViewModel(m));
            return Ok(vmlist);
        }


    }
}