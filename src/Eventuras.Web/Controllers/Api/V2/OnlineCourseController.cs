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
    [Route("api/v{version:apiVersion}/onlinecourses")]
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
    }
}
