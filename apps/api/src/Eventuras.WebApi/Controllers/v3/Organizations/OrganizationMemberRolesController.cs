using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Services;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Eventuras.Services.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.v3.Organizations;

[ApiVersion("3")]
[Authorize(Policy = Constants.Auth.AdministratorRole)]
[Route("v{version:apiVersion}/organizations/{organizationId:int}/members/{userId}/roles")]
[ApiController]
public class OrganizationMemberRolesController : ControllerBase
{
    private readonly IOrganizationRetrievalService _organizationRetrievalService;
    private readonly IOrganizationMemberRolesManagementService _rolesManagementService;
    private readonly IUserRetrievalService _userRetrievalService;

    public OrganizationMemberRolesController(
        IOrganizationMemberRolesManagementService rolesManagementService,
        IUserRetrievalService userRetrievalService,
        IOrganizationRetrievalService organizationRetrievalService)
    {
        _rolesManagementService = rolesManagementService ?? throw
            new ArgumentNullException(nameof(rolesManagementService));
        _userRetrievalService = userRetrievalService ?? throw
            new ArgumentNullException(nameof(userRetrievalService));
        _organizationRetrievalService = organizationRetrievalService ?? throw
            new ArgumentNullException(nameof(organizationRetrievalService));
    }

    [HttpGet]
    [Authorize(Roles = Roles.SystemAdmin)]
    public async Task<string[]> List(int organizationId, string userId, CancellationToken token)
    {
        var user = await _userRetrievalService.GetUserByIdAsync(userId,
            new UserRetrievalOptions { IncludeOrgMembership = true }, token);

        await _organizationRetrievalService.GetOrganizationByIdAsync(organizationId,
            cancellationToken: token); // just to check its existence

        return user.OrganizationMembership
                   .FirstOrDefault(m => m.OrganizationId == organizationId)
                   ?.Roles.Select(r => r.Role)
                   .OrderBy(r => r)
                   .ToArray()
               ?? Array.Empty<string>();
    }

    [HttpPost]
    [Authorize(Roles = Roles.SystemAdmin)]
    public async Task<string[]> Add(int organizationId, string userId, [FromBody] RoleRequestDto dto) =>
        await ManipulateRolesAsync(organizationId, userId, dto.Role, (roles, r) =>
        {
            if (roles.Contains(r))
            {
                return false;
            }

            roles.Add(r);
            return true;
        });

    [HttpDelete]
    [Authorize(Roles = Roles.SystemAdmin)]
    public async Task<string[]> Remove(int organizationId, string userId, [FromBody] RoleRequestDto dto) =>
        await ManipulateRolesAsync(organizationId, userId, dto.Role, (roles, r) =>
        {
            if (!roles.Contains(r))
            {
                return false;
            }

            roles.Remove(r);
            return true;
        });

    private async Task<string[]> ManipulateRolesAsync(
        int organizationId,
        string userId,
        string role,
        Func<ICollection<string>, string, bool> f)
    {
        await _organizationRetrievalService.GetOrganizationByIdAsync(organizationId); // just to check its existence

        var user = await _userRetrievalService.GetUserByIdAsync(userId,
            new UserRetrievalOptions { IncludeOrgMembership = true });

        var m = user.OrganizationMembership
            .FirstOrDefault(m => m.OrganizationId == organizationId);

        if (m == null)
        {
            throw new NotFoundException($"User {userId} is not a member of organization {organizationId}");
        }

        var roles = m.Roles
            .Select(r => r.Role)
            .ToHashSet();

        if (f(roles, role))
        {
            await _rolesManagementService
                .UpdateOrganizationMemberRolesAsync(m.Id, roles.ToArray());
        }

        return roles.ToArray();
    }
}

public class RoleRequestDto
{
    [Required][Role] public string Role { get; set; }
}
