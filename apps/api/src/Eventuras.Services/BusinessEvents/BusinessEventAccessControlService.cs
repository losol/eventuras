#nullable enable

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Infrastructure;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.BusinessEvents;

internal class BusinessEventAccessControlService : IBusinessEventAccessControlService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public BusinessEventAccessControlService(
        ApplicationDbContext dbContext,
        IHttpContextAccessor httpContextAccessor)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
    }

    public async Task CheckListAccessAsync(Guid organizationUuid, CancellationToken cancellationToken = default)
    {
        var user = _httpContextAccessor.HttpContext?.User;
        if (user is null || user.IsAnonymous())
        {
            throw new NotAccessibleException("Authentication required to read business events.");
        }

        if (user.IsSystemAdmin())
        {
            return;
        }

        if (!user.IsAdmin())
        {
            throw new NotAccessibleException("Admin role required to read business events.");
        }

        var userId = user.GetUserId()
            ?? throw new NotAccessibleException("Authenticated user has no id claim.");

        var isMemberOfOrg = await _dbContext.OrganizationMembers
            .AsNoTracking()
            .Where(m => m.UserId == userId && m.Organization.Uuid == organizationUuid)
            .AnyAsync(cancellationToken);

        if (!isMemberOfOrg)
        {
            throw new NotAccessibleException(
                "Not admin member of the organization whose business events were requested.");
        }
    }
}
