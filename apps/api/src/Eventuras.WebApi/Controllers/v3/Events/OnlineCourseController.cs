using System.Linq;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Services.Events;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.v3.Events;

[ApiVersion("3")]
[Authorize(Policy = Constants.Auth.AdministratorRole)]
[Route("v{version:apiVersion}/onlinecourses")]
[ApiController]
public class OnlineCourseController : ControllerBase
{
    private readonly IEventInfoRetrievalService _eventInfoService;

    public OnlineCourseController(IEventInfoRetrievalService eventInfoService) => _eventInfoService = eventInfoService;

    // GET: v1/onlinecourses
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IQueryable<OnlineCourseDto>>> Get()
    {
        var events = from e in await _eventInfoService.GetOnDemandEventsAsync()
                     select new OnlineCourseDto
                     {
                         Id = e.EventInfoId,
                         Name = e.Title,
                         Slug = e.Slug,
                         Description = e.Description,
                         Featured = e.Featured
                     };
        return Ok(events);
    }

    // GET: v1/onlinecourses/5
    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<OnlineCourseDto>> Get(int id)
    {
        var eventInfo = await _eventInfoService.GetEventInfoByIdAsync(id);
        if (eventInfo == null)
        {
            return NotFound();
        }

        var dto = new OnlineCourseDto
        {
            Id = eventInfo.EventInfoId,
            Name = eventInfo.Title,
            Slug = eventInfo.Slug,
            Description = eventInfo.Description,
            Featured = eventInfo.Featured
        };

        return Ok(dto);
    }
}
