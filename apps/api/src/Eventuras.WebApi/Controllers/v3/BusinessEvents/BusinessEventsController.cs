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
    [EndpointSummary("List business events for a subject in the current organization")]
    [EndpointDescription("Returns audit/business events scoped to the organization resolved from the Eventuras-Org-Id header, filtered by subjectType + subjectUuid (e.g. order + OrderUuid). Newest first. Requires the caller to be SystemAdmin or an Admin member of the resolved organization.")]
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

        // Org-membership enforcement (SystemAdmin bypass, Admin must be member)
        // lives inside BusinessEventService.ListEventsAsync — the service throws
        // NotAccessibleException which the exception filter maps to HTTP 403.
        var events = await _businessEventService.ListEventsAsync(
            currentOrg.Uuid,
            new BusinessEventSubject(query.SubjectType, query.SubjectUuid),
            new PagingRequest(query.Offset, query.Limit),
            cancellationToken);

        return PageResponseDto<BusinessEventDto>.FromPaging(query, events, e => new BusinessEventDto(e));
    }
}
