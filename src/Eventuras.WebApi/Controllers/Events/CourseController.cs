using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Events;
using Eventuras.WebApi.Constants;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi
{
    [ApiVersion("1")]
    [Authorize(Policy = AuthPolicies.AdministratorRole)]
    [Route("v{version:apiVersion}/events")]
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
        [HttpGet("{id}")]
        public async Task<ActionResult<EventDto>> Get(int id)
        {
            var eventInfo = await _eventInfoService.GetEventInfoByIdAsync(id);
            if (eventInfo == null)
            {
                return NotFound();
            }

            var dto = new EventDto()
            {
                Id = eventInfo.EventInfoId,
                Name = eventInfo.Title,
                Slug = eventInfo.Code,
                Description = eventInfo.Description,
                StartDate = eventInfo.DateStart,
                EndDate = eventInfo.DateEnd,
                Featured = eventInfo.Featured
            };

            return Ok(dto);
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
