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

namespace Eventuras.WebApi.Controllers
{
    [ApiVersion("1")]
    [Authorize(Policy = AuthPolicies.AdministratorRole)]
    [Route("v{version:apiVersion}/onlinecourses")]
    [ApiController]
    public class OnlineCourseController : ControllerBase
    {
        private readonly IEventInfoRetrievalService _eventInfoService;

        public OnlineCourseController(IEventInfoRetrievalService eventInfoService)
        {
            _eventInfoService = eventInfoService;
        }

        // GET: api/v2/onlinecourses
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IQueryable<OnlineCourseDto>>> Get()
        {
            var events = from e in await _eventInfoService.GetOnDemandEventsAsync()
                         select new OnlineCourseDto()
                         {
                             Id = e.EventInfoId,
                             Name = e.Title,
                             Slug = e.Code,
                             Description = e.Description,
                             Featured = e.Featured
                         };
            return Ok(events);
        }

        // GET: api/v2/onlinecourses/5
        [AllowAnonymous]
        [EnableCors("AllowGetFromAnyOrigin")]
        [HttpGet("{id}")]
        public async Task<ActionResult<OnlineCourseDto>> Get(int id)
        {
            var eventInfo = await _eventInfoService.GetEventInfoByIdAsync(id);
            if (eventInfo == null)
            {
                return NotFound();
            }

            var dto = new OnlineCourseDto()
            {
                Id = eventInfo.EventInfoId,
                Name = eventInfo.Title,
                Slug = eventInfo.Code,
                Description = eventInfo.Description,
                Featured = eventInfo.Featured
            };

            return Ok(dto);
        }
    }
}
