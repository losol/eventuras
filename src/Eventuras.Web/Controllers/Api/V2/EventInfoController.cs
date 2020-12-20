using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Events;
using Eventuras.Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.Web.Controllers.Api.V2
{
    [ApiVersion("2.0")]
    [Authorize(Policy = AuthPolicies.AdministratorRole)]
    [Route("api/v{version:apiVersion}/events")]
    [ApiController]
    public class EventInfoController : ControllerBase
    {
        private readonly IEventInfoRetrievalService _eventInfoService;

        public EventInfoController(IEventInfoRetrievalService eventInfoService)
        {
            _eventInfoService = eventInfoService;
        }

        // GET: api/v2/events
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IQueryable<EventDto>>> Get()
        {
            var events = from e in await _eventInfoService.GetUpcomingEventsAsync()
                         select new EventDto()
                         {
                             Id = e.EventInfoId,
                             Name = e.Title,
                             Slug = e.Code,
                             Description = e.Description,
                             StartDate = e.DateStart,
                             EndDate = e.DateEnd,
                             Featured = e.Featured,
                             Location = new LocationDto()
                             {
                                 Name = e.Location
                             }
                         };
            return Ok(events);
        }

        // GET: api/v2/events/5
        [AllowAnonymous]
        [HttpGet("{id}", Name = "Get")]
        public async Task<ActionResult<EventDto>> Get(int id)
        {
            /* Get help with this!! 
            var eventInfo = await _eventInfoService.GetEventInfoByIdAsync(id).Select(e =>
             new EventDto()
             {
                 Id = e.EventInfoId,
                 Name = e.Title,
                 Slug = e.Code,
                 Description = e.Description,
                 StartDate = e.DateStart,
                 EndDate = e.DateEnd,
                 Featured = e.Featured
             });

             

            if (eventInfo == null)
            {
                return NotFound();
            }

            return Ok(eventInfo);
            */
            return Ok();
        }

        // POST: api/EventInfo
        [HttpPost]
        public void Post([FromBody] string value)
        {
            throw new NotImplementedException();
        }

        // PUT: api/EventInfo/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
            throw new NotImplementedException();
        }

        // DELETE: api/ApiWithActions/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
            throw new NotImplementedException();
        }
    }
}
