using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Exceptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

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
                throw new ArgumentException("User should have a name.", nameof(name));
            }

            if (string.IsNullOrEmpty(email))
            {
                throw new ArgumentException("User should have an email.", nameof(email));
            }

            var finduser = await _userManager.FindByEmailAsync(email);

            if (finduser != null)
            {
                if (finduser.Archived)
                {
                    throw new DuplicateException($"An archived user with email {email} already exists. Contact admin to unarchive the user.");
                }
                else
                {
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
            if (!create.Succeeded)
            {
                var errormessage = "";
                foreach (var error in create.Errors)
                {
                    errormessage += $"CODE: {error.Code}. DESCRIPTION: {error.Description}";
                }
                throw new Exception($"Trouble with creating user with email {email}. Error: {errormessage}");
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
