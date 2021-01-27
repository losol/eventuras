using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Services.Exceptions;

namespace Eventuras.Services.Users
{
    internal class UserRetrievalService : IUserRetrievalService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserRetrievalService(
            ApplicationDbContext context,
            ICurrentOrganizationAccessorService currentOrganizationAccessorService,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw new ArgumentNullException(nameof(currentOrganizationAccessorService));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        }

        public async Task<ApplicationUser> GetUserByIdAsync(string userId, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new ArgumentException(nameof(userId));
            }

            var user = await _context.ApplicationUsers
                .AsNoTracking()
                .SingleOrDefaultAsync(u => u.Id == userId, cancellationToken: cancellationToken);

            if (user == null)
            {
                throw new NotFoundException($"User {userId} not found.");
            }

            // TODO: check org access

            return user;
        }
        public async Task<List<ApplicationUser>> ListUsers(
            UserFilter filter,
            UserRetrievalOptions options,
            CancellationToken cancellationToken)
        {
            filter ??= new UserFilter();
            options ??= new UserRetrievalOptions();

            var query = _context.Users
                .AsNoTracking()
                .UseOptions(options);

            if (filter.AccessibleOnly)
            {
                var user = _httpContextAccessor.HttpContext.User;
                if (!user.IsInRole(Roles.Admin) &&
                    !user.IsInRole(Roles.SuperAdmin))
                {
                    return new List<ApplicationUser>();
                }

                if (!user.IsInRole(Roles.SuperAdmin))
                {
                    var organization = await _currentOrganizationAccessorService.RequireCurrentOrganizationAsync(cancellationToken: cancellationToken);
                    if (!organization.IsRoot)
                    {
                        query = query.HavingOrganization(organization);
                    }
                }
            }

            return await query.ToListAsync(cancellationToken);
        }
    }
}
