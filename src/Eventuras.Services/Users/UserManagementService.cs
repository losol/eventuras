using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Exceptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Users
{
    public class UserManagementService : IUserManagementService
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public UserManagementService(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
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
