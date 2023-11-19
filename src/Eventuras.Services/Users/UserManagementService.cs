using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Exceptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Users
{
    public class UserManagementService : IUserManagementService
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<UserManagementService> _logger;

        public UserManagementService(
            ApplicationDbContext context,
            ILogger<UserManagementService> logger,
            UserManager<ApplicationUser> userManager)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ApplicationUser> CreateNewUserAsync(
            string name,
            string email,
            string phoneNumber = null,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("CreateNewUserAsync started.");

            if (string.IsNullOrEmpty(name))
            {
                _logger.LogWarning("CreateNewUserAsync called with empty name.");
                throw new ArgumentException("User should have a name.", nameof(name));
            }

            if (string.IsNullOrEmpty(email))
            {
                _logger.LogWarning("CreateNewUserAsync called with empty email.");
                throw new ArgumentException("User should have an email.", nameof(email));
            }

            var finduser = await _userManager.FindByEmailAsync(email);

            if (finduser != null)
            {
                if (finduser.Archived)
                {
                    _logger.LogWarning("Found archived user with email {email}. Contact admin to unarchive the user.", email);
                    throw new DuplicateException($"An archived user with email {email} already exists. Contact admin to unarchive the user.");
                }
                else
                {
                    _logger.LogWarning("Found archived user with email {email}.");
                    throw new DuplicateException($"An user with email {email} already exists.");
                }

            }


            var user = new ApplicationUser()
            {
                UserName = email,
                Name = name,
                Email = email,
                PhoneNumber = phoneNumber
            };


            var create = await _userManager.CreateAsync(user);
            _logger.LogInformation("CreateNewUserAsync finished.");
            if (!create.Succeeded)
            {
                var errorMessageBuilder = new StringBuilder();
                foreach (var error in create.Errors)
                {
                    errorMessageBuilder.AppendLine($"CODE: {error.Code}. DESCRIPTION: {error.Description}");
                }
                var errorMessage = errorMessageBuilder.ToString();
                _logger.LogError($"Trouble with creating user with email {email}. Error: {errorMessage}");
                throw new Exception($"Trouble with creating user with email {email}. Error: {errorMessage}");
            }


            return user;
        }

        public async Task UpdateUserAsync(ApplicationUser user,
            CancellationToken cancellationToken = default)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            var normalizedEmail = _userManager.NormalizeEmail(user.Email);
            if (await _context.Users.AnyAsync(u => !u.Archived && u.NormalizedEmail == normalizedEmail && u.Id != user.Id,
                cancellationToken))
            {
                _logger.LogWarning($"User with email {user.Email} already exists.");
                throw new DuplicateException($"User with email {user.Email} already exists.");
            }

            try
            {
                await _context.UpdateAsync(user);
            }
            catch (DbUpdateException e) when (e.IsUniqueKeyViolation())
            {
                throw new DuplicateException($"User with email {user.Email} already exists.");
            }
        }
    }
}
