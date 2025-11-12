using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Exceptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Users;

public class UserManagementService : IUserManagementService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UserManagementService> _logger;
    private readonly IUserAccessControlService _userAccessControlService;
    private readonly UserManager<ApplicationUser> _userManager;

    public UserManagementService(
        ApplicationDbContext context,
        ILogger<UserManagementService> logger,
        UserManager<ApplicationUser> userManager,
        IUserAccessControlService userAccessControlService)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        _userAccessControlService = userAccessControlService ??
                                    throw new ArgumentNullException(nameof(userAccessControlService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<ApplicationUser> CreateNewUserAsync(
        string email,
        string phoneNumber = null,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("CreateNewUserAsync started.");

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
                _logger.LogWarning("Found archived user with email {email}. Contact admin to unarchive the user.",
                    email);
                throw new DuplicateException(
                    $"An archived user with email {email} already exists. Contact admin to unarchive the user.");
            }

            _logger.LogWarning("Found archived user with email {email}.", email);
            throw new DuplicateException($"An user with email {email} already exists.");
        }


        var user = new ApplicationUser { UserName = email, Email = email, PhoneNumber = phoneNumber };


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
            _logger.LogError("Trouble with creating user with email {email}. Error: {errorMessage}", email,
                errorMessage);
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

        // Allow users to update their own information, and admins to update any user
        await _userAccessControlService.CheckOwnerOrAdminAccessAsync(user, cancellationToken);

        var normalizedEmail = _userManager.NormalizeEmail(user.Email);
        if (await _context.Users.AnyAsync(u => !u.Archived && u.NormalizedEmail == normalizedEmail && u.Id != user.Id,
                cancellationToken))
        {
            _logger.LogWarning($"User with email {user.Email} already exists.");
            throw new DuplicateException($"User with email {user.Email} already exists.");
        }

        await _context.UpdateAsync(user, cancellationToken);
    }
}
