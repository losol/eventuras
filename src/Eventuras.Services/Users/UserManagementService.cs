using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Users
{
    public class UserManagementService : IUserManagementService
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;
        private readonly IOrganizationMemberManagementService _organizationMemberManagementService;

        public UserManagementService(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            IHttpContextAccessor httpContextAccessor,
            ICurrentOrganizationAccessorService currentOrganizationAccessorService,
            IOrganizationMemberManagementService organizationMemberManagementService)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _currentOrganizationAccessorService = currentOrganizationAccessorService ??
                throw new ArgumentNullException(nameof(currentOrganizationAccessorService));
            _organizationMemberManagementService = organizationMemberManagementService ??
                throw new ArgumentNullException(nameof(organizationMemberManagementService));
        }

        public async Task<ApplicationUser> CreateNewUserAsync(
            string name,
            string email,
            string phoneNumber = null,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrEmpty(name))
            {
                throw new ArgumentException("user name must not be emmpty", nameof(name));
            }

            if (string.IsNullOrEmpty(email))
            {
                throw new ArgumentException("email must not be emmpty", nameof(email));
            }

            var normalizedEmail = _userManager.NormalizeEmail(email);
            if (await _context.Users.AnyAsync(u => !u.Archived && u.NormalizedEmail == normalizedEmail,
                cancellationToken))
            {
                throw new DuplicateException($"User with email {email} already exists.");
            }

            var user = new ApplicationUser
            {
                Name = name,
                Email = email,
                PhoneNumber = phoneNumber
            };

            try
            {
                await _context.CreateAsync(user, cancellationToken);
            }
            catch (DbUpdateException e) when (e.IsUniqueKeyViolation())
            {
                throw new DuplicateException($"User with email {email} already exists.");
            }

            Organization org = null;
            if (!_httpContextAccessor.HttpContext.User.IsPowerAdmin())
            {
                org = await _currentOrganizationAccessorService.GetCurrentOrganizationAsync();
            }

            if (org != null)
            {
                await _organizationMemberManagementService.AddToOrganizationAsync(user, org);
            }

            return user;
        }
    }
}
