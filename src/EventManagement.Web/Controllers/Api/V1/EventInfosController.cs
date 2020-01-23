using losol.EventManagement.Services;
using losol.EventManagement.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Web.Controllers.Api.V1
{
    [ApiVersion("1")]
    [Authorize(Policy = AuthPolicies.AdministratorRole)]
    [Route("api/v1/eventinfos")]
    [ApiController]
    public class EventInfosController : ControllerBase
    {
        private readonly IEventInfoService _eventInfoService;

        public EventInfosController(IEventInfoService eventInfoService)
        {
            _eventInfoService = eventInfoService;
        }

        // GET: api/v1/eventinfos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventInfoViewModel>>> GetRegistrations()
        {
            var eventinfos = await _eventInfoService.GetEventsAsync();
            var vmlist = eventinfos.Select(m => new EventInfoViewModel(m));
            return Ok(vmlist);
        }


    }
}