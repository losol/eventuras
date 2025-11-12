using System;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Organizations;

internal class OrganizationMemberRolesManagementService : IOrganizationMemberRolesManagementService
{
    private readonly ApplicationDbContext _context;

    public OrganizationMemberRolesManagementService(ApplicationDbContext context) =>
        _context = context ?? throw new ArgumentNullException(nameof(context));

    public async Task UpdateOrganizationMemberRolesAsync(int memberId, string[] roles)
    {
        if (roles == null)
        {
            throw new ArgumentNullException(nameof(roles));
        }

        var member = await _context.OrganizationMembers
            .Include(m => m.Roles)
            .SingleAsync(m => m.Id == memberId);

        var oldRoles = member.Roles
            .ToDictionary(r => r.Role);

        foreach (var role in roles)
        {
            if (oldRoles.ContainsKey(role))
            {
                oldRoles.Remove(role);
            }
            else
            {
                member.Roles.Add(new OrganizationMemberRole { Role = role });
            }
        }

        foreach (var role in oldRoles.Values)
        {
            member.Roles.Remove(role);
        }

        await _context.SaveChangesAsync();
    }
}
