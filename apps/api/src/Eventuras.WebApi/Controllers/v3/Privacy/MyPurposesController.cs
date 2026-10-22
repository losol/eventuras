using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Services.Organizations;
using Eventuras.Services.Privacy;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.v3.Privacy;

[ApiVersion("3")]
[Authorize]
[Route("v{version:apiVersion}/userprofile/purposes")]
[ApiController]
[Produces("application/json")]
public class MyPurposesController : ControllerBase
{
    private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessor;
    private readonly IPurposeDecisionService _purposeDecisionService;

    public MyPurposesController(
        IPurposeDecisionService purposeDecisionService,
        ICurrentOrganizationAccessorService currentOrganizationAccessor)
    {
        _purposeDecisionService = purposeDecisionService ?? throw new ArgumentNullException(nameof(purposeDecisionService));
        _currentOrganizationAccessor = currentOrganizationAccessor ?? throw new ArgumentNullException(nameof(currentOrganizationAccessor));
    }

    [HttpGet]
    [EndpointSummary("List the current organization's processing purposes with my decisions")]
    [EndpointDescription("Returns each current processing purpose in the current organization (resolved from the Eventuras-Org-Id header, else the orgId query parameter, else the request hostname) with the signed-in user's organization-wide decision and what it amounts to: mayProcess is the value to enforce, mustAsk says the user should be asked. Ordered by code.")]
    [ProducesResponseType(typeof(MyPurposeDto[]), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(403)]
    public async Task<MyPurposeDto[]> List(CancellationToken cancellationToken)
    {
        var currentOrg = await _currentOrganizationAccessor.RequireCurrentOrganizationAsync(
            cancellationToken: cancellationToken);

        var purposes = await _purposeDecisionService.ListMineAsync(currentOrg, cancellationToken);

        return purposes.Select(p => new MyPurposeDto(p)).ToArray();
    }

    [HttpPut("{code}")]
    [EndpointSummary("Record my decision on a processing purpose")]
    [EndpointDescription("Records the signed-in user's organization-wide decision on the current version of a purpose in the current organization: Denied reserves against a reservation or declines a consent, Allowed accepts. Every change is logged as a business event on the user. 404 when the organization has no current purpose with the code.")]
    [ProducesResponseType(typeof(MyPurposeDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<MyPurposeDto>> Decide(
        string code,
        [FromBody] PurposeDecisionFormDto dto,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState.FormatErrors());
        }

        var currentOrg = await _currentOrganizationAccessor.RequireCurrentOrganizationAsync(
            cancellationToken: cancellationToken);

        var purpose = await _purposeDecisionService.DecideAsync(
            currentOrg, code, dto.Decision!.Value, cancellationToken);

        return Ok(new MyPurposeDto(purpose));
    }
}
