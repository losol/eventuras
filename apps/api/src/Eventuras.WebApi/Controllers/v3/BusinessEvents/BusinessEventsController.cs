using System;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.Services.BusinessEvents;
using Eventuras.Services.Organizations;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.v3.BusinessEvents;

[ApiVersion("3")]
[Authorize(Policy = Constants.Auth.AdministratorRole)]
[Route("v{version:apiVersion}/business-events")]
[ApiController]
[Produces("application/json")]
public class BusinessEventsController : ControllerBase
{
    private readonly IBusinessEventService _businessEventService;
    private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessor;

    public BusinessEventsController(
        IBusinessEventService businessEventService,
        ICurrentOrganizationAccessorService currentOrganizationAccessor)
    {
        _businessEventService = businessEventService ?? throw new ArgumentNullException(nameof(businessEventService));
        _currentOrganizationAccessor = currentOrganizationAccessor ?? throw new ArgumentNullException(nameof(currentOrganizationAccessor));
    }

    [HttpGet]
    [EndpointSummary("List business events for a subject or an event in the current organization")]
    [EndpointDescription("Returns audit/business events scoped to the current organization (resolved from the Eventuras-Org-Id header, else the orgId query parameter, else the request hostname), filtered by subjectType + subjectUuid (e.g. order + OrderUuid), or by eventInfoUuid for everything recorded on one event (the event itself, its registrations and their orders). Newest first. Requires the caller to be SystemAdmin or an Admin member of the resolved organization.")]
    [ProducesResponseType(typeof(PageResponseDto<BusinessEventDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(403)]
    public async Task<ActionResult<PageResponseDto<BusinessEventDto>>> List(
        [FromQuery] BusinessEventsQueryDto query,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var currentOrg = await _currentOrganizationAccessor.RequireCurrentOrganizationAsync(
            cancellationToken: cancellationToken);

        // Org-membership enforcement (SystemAdmin bypass, Admin must be member) lives in
        // the service: both list methods call CheckListAccessAsync, which throws
        // NotAccessibleException that the exception filter maps to HTTP 403.
        var paging = new PagingRequest(query.Offset, query.Limit);
        var events = query.HasSubject
            ? await _businessEventService.ListEventsAsync(
                currentOrg.Uuid,
                new BusinessEventSubject(query.SubjectType!, query.SubjectUuid!.Value),
                paging,
                cancellationToken)
            : await _businessEventService.ListEventsForEventAsync(
                currentOrg.Uuid,
                query.EventInfoUuid!.Value,
                paging,
                cancellationToken);

        return PageResponseDto<BusinessEventDto>.FromPaging(query, events, e => new BusinessEventDto(e));
    }
}
