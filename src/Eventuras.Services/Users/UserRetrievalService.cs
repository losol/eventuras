using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

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

        public async Task<ApplicationUser> GetUserByIdAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new ArgumentException(nameof(userId));
            }

            return await _context.ApplicationUsers
                .AsNoTracking()
                .SingleAsync(u => u.Id == userId);
        }
        public async Task<List<ApplicationUser>> ListUsers(UserFilter filter, UserRetrievalOptions options)
        {
            filter ??= new UserFilter();
            options ??= new UserRetrievalOptions();

            var query = _context.Users
                .AsNoTracking()
                .UseOptions(options);

            if (filter.AccessibleToOrgOnly)
            {
                var user = _httpContextAccessor.HttpContext.User;
                if (!user.IsInRole(Roles.Admin) &&
                    !user.IsInRole(Roles.SuperAdmin))
                {
                    return new List<ApplicationUser>();
                }

                if (!user.IsInRole(Roles.SuperAdmin))
                {
                    var organization = await _currentOrganizationAccessorService.RequireCurrentOrganizationAsync();
                    if (!organization.IsRoot)
                    {
                        query = query.HavingOrganization(organization);
                    }
                }
            }

            return await query.ToListAsync();
        }
    }
}
