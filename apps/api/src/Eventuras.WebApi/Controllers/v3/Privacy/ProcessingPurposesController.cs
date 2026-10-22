using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Services;
using Eventuras.Services.Organizations;
using Eventuras.Services.Privacy;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.v3.Privacy;

[ApiVersion("3")]
[Authorize(Policy = Constants.Auth.AdministratorRole)]
[Route("v{version:apiVersion}/processing-purposes")]
[ApiController]
[Produces("application/json")]
public class ProcessingPurposesController : ControllerBase
{
    private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessor;
    private readonly IProcessingPurposeService _processingPurposeService;

    public ProcessingPurposesController(
        IProcessingPurposeService processingPurposeService,
        ICurrentOrganizationAccessorService currentOrganizationAccessor)
    {
        _processingPurposeService = processingPurposeService ?? throw new ArgumentNullException(nameof(processingPurposeService));
        _currentOrganizationAccessor = currentOrganizationAccessor ?? throw new ArgumentNullException(nameof(currentOrganizationAccessor));
    }

    [HttpGet]
    [EndpointSummary("List the current organization's processing purposes")]
    [EndpointDescription("Returns the current version of each processing purpose in the current organization (resolved from the Eventuras-Org-Id header, else the orgId query parameter, else the request hostname), ordered by code. Retired purposes and superseded versions are left out. Requires the caller to be SystemAdmin or an Admin member of the resolved organization.")]
    [ProducesResponseType(typeof(ProcessingPurposeDto[]), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(403)]
    public async Task<ProcessingPurposeDto[]> List(CancellationToken cancellationToken)
    {
        var currentOrg = await _currentOrganizationAccessor.RequireCurrentOrganizationAsync(
            cancellationToken: cancellationToken);

        var purposes = await _processingPurposeService.ListCurrentAsync(currentOrg, cancellationToken);

        return purposes.Select(p => new ProcessingPurposeDto(p)).ToArray();
    }

    [HttpPost]
    [Authorize(Roles = Roles.SystemAdmin)]
    [EndpointSummary("Create a processing purpose in the current organization")]
    [EndpointDescription("Creates version 1 of a new processing purpose in the current organization (resolved like the list endpoint). SystemAdmin only. A code the organization already uses, in any version, is a conflict; a purpose covering special category data must be a Consent.")]
    [ProducesResponseType(typeof(ProcessingPurposeDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(403)]
    [ProducesResponseType(409)]
    public async Task<ActionResult<ProcessingPurposeDto>> Create(
        [FromBody] ProcessingPurposeFormDto dto,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState.FormatErrors());
        }

        var currentOrg = await _currentOrganizationAccessor.RequireCurrentOrganizationAsync(
            cancellationToken: cancellationToken);

        var purpose = await _processingPurposeService.CreateAsync(
            currentOrg, dto.ToNewProcessingPurpose(), cancellationToken);

        return Ok(new ProcessingPurposeDto(purpose));
    }
}

