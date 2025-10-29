using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Users;

internal class UserAccessControlService : IUserAccessControlService
{

    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<UserAccessControlService> _logger;

    public UserAccessControlService(
        IHttpContextAccessor httpContextAccessor,
        ILogger<UserAccessControlService> logger
        )
    {
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }


    public Task CheckOwnerOrAdminAccessAsync(ApplicationUser user, CancellationToken cancellationToken)
    {
        var requestingUser = _httpContextAccessor.HttpContext.User;

        // Log information about the access check
        _logger.LogInformation($"Checking owner or admin access for user {requestingUser.GetUserId} for editing user {user.Id}");

        if (requestingUser.IsAnonymous())
        {
            throw new NotAccessibleException("Access denied. User is not logged in.");
        }

        // Check if the requesting user is the owner
        if (user.Id == requestingUser.GetUserId())
        {
            _logger.LogInformation("Owner access granted.");
            return Task.CompletedTask;
        }

        // Check if the requesting user is an admin
        var isAdmin = CheckAdminAccessAsync(requestingUser);

        if (isAdmin)
        {
            _logger.LogInformation("Admin access granted.");
            return Task.CompletedTask;
        }

        // If neither, throw access denied exception
        throw new NotAccessibleException("Access denied. User is neither owner nor admin.");
    }

    private bool CheckAdminAccessAsync(ClaimsPrincipal user)
    {
        if (user.IsAdmin())
        { return true; }
        if (user.IsPowerAdmin())
        { return true; }

        return false;
    }
}
