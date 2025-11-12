using System;
using System.Threading.Tasks;
using Eventuras.Infrastructure;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Organizations;

public class OrganizationAccessControlService : IOrganizationAccessControlService
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public OrganizationAccessControlService(
        ApplicationDbContext context,
        IHttpContextAccessor httpContextAccessor)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task CheckOrganizationReadAccessAsync(int organizationId) => await CheckAdminRoleAsync(organizationId);

    public async Task CheckOrganizationUpdateAccessAsync(int organizationId) =>
        await CheckAdminRoleAsync(organizationId);

    private async Task CheckAdminRoleAsync(int organizationId)
    {
        var user = _httpContextAccessor.HttpContext.User;
        if (user.IsPowerAdmin())
        {
            return;
        }

        var member = await _context.OrganizationMembers
            .AsNoTracking()
            .Include(m => m.Roles)
            .SingleOrDefaultAsync(m => m.OrganizationId == organizationId &&
                                       m.UserId == user.GetUserId());

        if (member?.HasRole(Roles.Admin) != true)
        {
            throw new NotAccessibleException(
                $"User is not allowed to update organization {organizationId}");
        }
    }
}
