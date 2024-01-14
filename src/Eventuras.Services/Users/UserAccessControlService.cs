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

namespace Eventuras.Services.Users
{
    internal class UserAccessControlService : IUserAccessControlService
    {

        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IUserRetrievalService _userRetrievalService;
        private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
        private readonly ILogger<UserAccessControlService> _logger;

        public UserAccessControlService(
            IHttpContextAccessor httpContextAccessor,
            IUserRetrievalService userRetrievalService,
            ICurrentOrganizationAccessorService currentOrganizationAccessorService,
            ILogger<UserAccessControlService> logger
            )
        {
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _userRetrievalService = userRetrievalService ?? throw new ArgumentNullException(nameof(userRetrievalService));
            _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw new ArgumentNullException(nameof(currentOrganizationAccessorService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }


        public async Task CheckOwnerOrAdminAccessAsync(ApplicationUser user, CancellationToken cancellationToken)
        {
            var requestingUser = _httpContextAccessor.HttpContext!.User;

            // Log information about the access check
            _logger.LogInformation($"Checking owner or admin access for user {requestingUser.GetUserId} for editing user {user.Id}");

            if (requestingUser.IsAnonymous())
            {
                throw new NotAccessibleException("Access denied. User is not logged in.");
            }

            // Check if the requesting user is the owner
            if (user.Id == requestingUser.GetUserId().ToString())
            {
                _logger.LogInformation("Owner access granted.");
                return;
            }

            // Check if the requesting user is an admin
            await CheckAdminAccessAsync(requestingUser, user, cancellationToken);

            // If neither, throw access denied exception
            throw new NotAccessibleException("Access denied. User is neither owner nor admin.");
        }

        private async Task<bool> CheckAdminAccessAsync(ClaimsPrincipal requestingUser, ApplicationUser user, CancellationToken cancellationToken)
        {
            if (requestingUser.IsPowerAdmin()) { return true; }

            if (requestingUser.IsAdmin()) { return true; }

            return false;
        }
    }
}
